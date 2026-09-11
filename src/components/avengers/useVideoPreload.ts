'use client';

import { useEffect, useRef, useState } from 'react';

type Spec = { url: string; bytes: number };

export type PreloadResult<K extends string> = {
  /** 0 → 1 across every file in the set. */
  progress: number;
  /** Blob URLs once downloaded; falls back to the plain path on any failure. */
  sources: Record<K, string> | null;
};

/**
 * Pulls the clips down in full before the experience starts.
 *
 * Scrubbing a `<video>` by scroll position only feels solid when the bytes are
 * already local — range-requesting a seek mid-scroll shows up immediately as a
 * stall. So the whole file is read into a Blob and played from an object URL,
 * and the read gives us a real progress number for the loading screen instead
 * of a fake one.
 */
export function useVideoPreload<K extends string>(files: Record<K, Spec>): PreloadResult<K> {
  const [progress, setProgress] = useState(0);
  const [sources, setSources] = useState<Record<K, string> | null>(null);
  const created = useRef<string[]>([]);
  /* The spec object is written inline by the caller, so freeze the first one
     rather than re-running this effect on every render. */
  const spec = useRef(files);

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(spec.current) as [K, Spec][];
    const loaded = {} as Record<K, number>;
    const totals = {} as Record<K, number>;
    const urls = {} as Record<K, string>;
    entries.forEach(([key, s]) => {
      loaded[key] = 0;
      totals[key] = s.bytes;
    });

    const sum = (o: Record<K, number>) => Object.values<number>(o).reduce((a, b) => a + b, 0);

    const report = () => {
      if (cancelled) return;
      setProgress(Math.min(0.999, sum(loaded) / Math.max(1, sum(totals))));
    };

    const pull = async ([key, s]: [K, Spec]) => {
      try {
        const res = await fetch(s.url);
        if (!res.ok || !res.body) throw new Error(String(res.status));

        const declared = Number(res.headers.get('content-length'));
        if (declared > 0) totals[key] = declared;

        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) {
            await reader.cancel();
            return;
          }
          chunks.push(value);
          loaded[key] += value.byteLength;
          report();
        }

        const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
        const objectUrl = URL.createObjectURL(blob);
        created.current.push(objectUrl);
        urls[key] = objectUrl;
      } catch {
        /* Streaming straight from the network still works — it just seeks
           less smoothly. Better than a loader that never finishes. */
        urls[key] = s.url;
        loaded[key] = totals[key];
        report();
      }
    };

    Promise.all(entries.map(pull)).then(() => {
      if (cancelled) return;
      setSources(urls);
      setProgress(1);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* Only release the blobs when the route itself unmounts. */
  useEffect(
    () => () => {
      created.current.forEach((u) => URL.revokeObjectURL(u));
      created.current = [];
    },
    []
  );

  return { progress, sources };
}
