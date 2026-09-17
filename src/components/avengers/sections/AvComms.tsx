'use client';

import { useState } from 'react';
import SectionShell from '../SectionShell';
import { profile, socials } from '@/lib/data';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const channels = [
  { k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
  { k: 'Phone', v: profile.phone, href: `tel:${profile.phoneHref}` },
  { k: 'Based', v: profile.location },
];

export default function AvComms() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' });

  /* Same contract as the home page form: the API answers `configured: false`
     when no mail provider key is set, and we hand off to the mail client. */
  const mailtoFallback = () => {
    const subject = encodeURIComponent(`Portfolio message from ${form.name || 'someone'}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', message: '', company: '' });
        return;
      }
      if (data.configured === false) {
        mailtoFallback();
        setStatus('sent');
        return;
      }
      setError(data.error ?? "Couldn't send that. Try again?");
      setStatus('error');
    } catch {
      setError('Network hiccup. Try again, or email me directly.');
      setStatus('error');
    }
  };

  const field =
    'w-full border border-white/12 bg-[#04070a]/70 px-3.5 py-2.5 text-[14px] text-(--paper) outline-hidden transition-colors duration-300 placeholder:text-(--paper-dim)/60 focus:border-(--gamma)/70';

  return (
    <SectionShell
      id="comms"
      file="05"
      label="Comms"
      title="Open a channel"
      kicker={profile.availability}
      height="h-[230vh]"
      exit={false}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div data-av-side>
          <dl className="space-y-3 sm:space-y-4">
            {channels.map((c) => (
              <div
                key={c.k}
                /* the location repeats the kicker — phones don't need both */
                className={`border-l border-(--gamma)/30 pl-4 ${
                  c.k === 'Based' ? 'hidden sm:block' : ''
                }`}
              >
                <dt className="av-mono text-[9px] tracking-[0.26em] text-(--gamma) uppercase">
                  {c.k}
                </dt>
                <dd className="mt-1 text-[15px] text-(--paper)">
                  {c.href ? (
                    <a className="transition-colors hover:text-(--gamma-soft)" href={c.href}>
                      {c.v}
                    </a>
                  ) : (
                    c.v
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2 sm:mt-7">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="av-chip"
              >
                {s.label}
              </a>
            ))}
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="av-chip">
              Résumé ↓
            </a>
          </div>
        </div>

        <form onSubmit={submit} data-av-up className="av-panel av-bracket space-y-3 p-4 sm:p-6">
          {/* honeypot */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="hidden"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="av-mono text-[9px] tracking-[0.24em] text-(--paper-dim) uppercase">
                Name
              </span>
              <input
                required
                className={`${field} mt-1.5`}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Who's calling"
              />
            </label>
            <label className="block">
              <span className="av-mono text-[9px] tracking-[0.24em] text-(--paper-dim) uppercase">
                Email
              </span>
              <input
                required
                type="email"
                className={`${field} mt-1.5`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@somewhere.com"
              />
            </label>
          </div>

          <label className="block">
            <span className="av-mono text-[9px] tracking-[0.24em] text-(--paper-dim) uppercase">
              Message
            </span>
            <textarea
              required
              rows={3}
              className={`${field} mt-1.5 h-20 resize-none sm:h-auto`}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What are we building?"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="av-mono border border-(--gamma)/70 bg-(--gamma)/12 px-5 py-2.5 text-[11px] tracking-[0.24em] text-(--gamma-soft) uppercase transition-all duration-300 hover:bg-(--gamma) hover:text-[#04070a] disabled:opacity-50"
            >
              {status === 'sending' ? 'Transmitting…' : 'Send transmission'}
            </button>

            {status === 'sent' && (
              <span className="av-mono text-[10px] tracking-[0.2em] text-(--gamma) uppercase">
                Received — I&apos;ll reply soon
              </span>
            )}
            {status === 'error' && (
              <span className="av-mono text-[10px] tracking-[0.2em] text-(--alert) uppercase">
                {error}
              </span>
            )}
          </div>
        </form>
      </div>
    </SectionShell>
  );
}
