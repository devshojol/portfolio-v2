import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Contact endpoint.
 *
 * Set these in `.env.local` to enable real delivery (see .env.example):
 *   RESEND_API_KEY=re_xxxxxxxx
 *   CONTACT_TO=shojolislam3231@gmail.com
 *   CONTACT_FROM=Portfolio <onboarding@resend.dev>
 *
 * Without a key the route responds 503 with `configured: false`, and the
 * form falls back to opening the visitor's mail client.
 */

type Body = {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot
};

const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages — please try again in a minute." },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // honeypot: silently accept bots
  if (body.company) return NextResponse.json({ ok: true });

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { ok: false, error: "Message should be between 10 and 4000 characters." },
      { status: 400 },
    );
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? "shojolislam3231@gmail.com";
  const from = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";

  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "Email delivery isn't configured yet.",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6">
            <h2 style="margin:0 0 12px">New message from your portfolio</h2>
            <p style="margin:0"><strong>Name:</strong> ${escape(name)}</p>
            <p style="margin:0"><strong>Email:</strong> ${escape(email)}</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
            <p style="white-space:pre-wrap;margin:0">${escape(message)}</p>
          </div>`,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Resend error:", detail);
      return NextResponse.json(
        { ok: false, error: "Couldn't send the message. Please email me directly." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please email me directly." },
      { status: 500 },
    );
  }
}
