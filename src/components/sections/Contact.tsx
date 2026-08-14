"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import { profile, socials } from "@/lib/data";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    company: "",
  });

  const mailtoFallback = () => {
    const subject = encodeURIComponent(
      `Portfolio message from ${form.name || "someone"}`,
    );
    const body = encodeURIComponent(
      `${form.message}\n\n— ${form.name} (${form.email})`,
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", message: "", company: "" });
        return;
      }

      if (data.configured === false) {
        // No mail provider key yet — hand off to the visitor's mail client.
        mailtoFallback();
        setStatus("sent");
        return;
      }

      setError(data.error ?? "Couldn't send that. Try again?");
      setStatus("error");
    } catch {
      setError("Network hiccup. Try again, or email me directly.");
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-xl border border-line bg-surface/50 px-4 py-3 text-[15px] text-ink outline-none transition-all duration-300 focus:ring-2 focus:ring-accent/15";

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden py-14 sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_100%,#0b2c4433,transparent_70%)]" />

      <div className="container-x">
        <SectionHeading
          index="05"
          title="Let's build something"
          kicker="Looking for React / React Native work — full time or freelance just say hi."
        />

        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          {/* left: direct links */}
          <div className="space-y-8">
            <Reveal>
              <a
                href={`mailto:${profile.email}`}
                className="group block text-2xl font-medium tracking-tight text-ink transition-colors duration-300 hover:text-accent sm:text-3xl"
              >
                {profile.email}
                <span className="mt-2 block h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </a>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="space-y-3">
                <a
                  href={`tel:${profile.phoneHref}`}
                  className="block font-mono text-[15px] text-ink-dim transition-colors hover:text-accent"
                >
                  {profile.phone}
                </a>
                <p className="text-[14px] text-ink-faint">{profile.location}</p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="flex flex-wrap gap-2.5">
                {socials.map((s) => (
                  <Magnetic key={s.label} strength={0.2}>
                    <a
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-ink-dim transition-all duration-300 hover:border-accent/50 hover:text-accent"
                    >
                      {s.label}
                    </a>
                  </Magnetic>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <a
                href={profile.resumeUrl}
                download
                className="group inline-flex items-center gap-2.5 border-b border-line-strong pb-2 text-[15px] text-ink-dim transition-colors duration-300 hover:border-ink-dim hover:text-ink"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download résumé
                <span className="text-[12px] text-ink-faint">PDF</span>
              </a>
            </Reveal>
          </div>

          {/* right: form */}
          <Reveal direction="left" delay={0.08}>
            <div className="relative rounded-2xl border border-line bg-linear-to-b from-surface/60 to-night/40 p-6 backdrop-blur-sm sm:p-8">
              <AnimatePresence mode="wait">
                {status === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-95 flex-col items-center justify-center text-center"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 220,
                        damping: 14,
                      }}
                      className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent"
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </motion.span>
                    <h3 className="mt-5 text-xl font-medium text-ink">
                      Message on its way
                    </h3>
                    <p className="mt-2 max-w-xs text-[14px] text-ink-dim">
                      Thanks for reaching out — I&apos;ll get back to you soon.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="mt-6 text-[13px] text-accent underline-offset-4 hover:underline"
                    >
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* honeypot */}
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company}
                      onChange={(e) =>
                        setForm({ ...form, company: e.target.value })
                      }
                      className="absolute left-[-9999px] h-0 w-0 opacity-0"
                      aria-hidden
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          required
                          minLength={2}
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          placeholder="Your name"
                          className={field}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          placeholder="you@company.com"
                          className={field}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        minLength={10}
                        rows={6}
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        placeholder="Tell me about the role or project…"
                        className={`${field} resize-none`}
                      />
                    </div>

                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-300"
                      >
                        {error}{" "}
                        <button
                          type="button"
                          onClick={mailtoFallback}
                          className="underline"
                        >
                          Email me directly
                        </button>
                      </motion.p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-accent to-sky px-6 py-3.5 text-sm font-semibold text-[#03151c] transition-all duration-300 hover:shadow-[0_0_36px_-10px_#22d3ee] disabled:opacity-60"
                    >
                      <span className="relative z-10 inline-flex items-center gap-2">
                        {status === "sending" ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#03151c]/30 border-t-[#03151c]" />
                            Sending…
                          </>
                        ) : (
                          <>
                            Send message
                            <svg
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </>
                        )}
                      </span>
                      <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-0" />
                    </button>

                    <p className="text-center text-[12px] text-ink-faint">
                      Or email{" "}
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-ink-dim hover:text-accent"
                      >
                        {profile.email}
                      </a>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
