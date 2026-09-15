'use client';

import { useState } from 'react';
import { profile } from '@/lib/data';
import SwapButton from './SwapButton';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Footer contact form. Posts to the same `/api/contact` route the main page
 * uses, including its honeypot field and its behaviour when no mail provider
 * is configured: the route answers `configured: false` and we hand off to the
 * visitor's own mail client rather than swallowing the message.
 *
 * Underlined fields rather than boxes — boxes would read as a different design
 * language from the rest of the panel.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

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
    'w-full border-b border-black/30 bg-transparent py-2 text-sm text-black outline-none transition-colors placeholder:text-black/45 focus:border-black';

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Honeypot: off-screen and out of the tab order, so only bots fill it. */}
      <input
        type="text"
        name="company"
        value={form.company}
        onChange={set('company')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">Your name</span>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={set('name')}
            placeholder="Name"
            className={field}
          />
        </label>
        <label className="block">
          <span className="sr-only">Your email</span>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={set('email')}
            placeholder="Email"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="sr-only">Message</span>
        <textarea
          name="message"
          required
          rows={2}
          value={form.message}
          onChange={set('message')}
          placeholder="What are you building?"
          className={`${field} resize-none`}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <SwapButton submit tone="light" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending' : 'Send message'}
        </SwapButton>

        {/* Announced to screen readers as it changes, not only shown. */}
        <p role="status" aria-live="polite" className="v2-label text-black/60">
          {status === 'sent' && "Sent — I'll reply soon."}
          {status === 'error' && error}
        </p>
      </div>
    </form>
  );
}
