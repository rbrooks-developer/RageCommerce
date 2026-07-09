"use client";

import { useState } from "react";
import { submitContactForm, subscribeToNewsletter } from "@/lib/actions/contact";

interface SocialLink {
  platform: string;
  url: string;
}

interface Props {
  heading: string;
  subheading: string;
  bodyText: string;
  email: string | null;
  social: SocialLink[];
  bgColor: string;
  fontColor: string;
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();

  if (p.includes("instagram")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
  if (p.includes("facebook")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  );
  if (p.includes("youtube")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
  if (p.includes("tiktok")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.13 8.13 0 004.77 1.52V6.76a4.85 4.85 0 01-1-.07z"/>
    </svg>
  );
  if (p.includes("twitter") || p === "x") return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (p.includes("linkedin")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="w-5 h-5">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

export function ContactForm({ heading, subheading, bodyText, email, social, bgColor, fontColor }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [message, setMessage] = useState("");
  const [formPending, setFormPending] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterPending, setNewsletterPending] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const inputStyle = {
    borderColor: fontColor,
    color: fontColor,
    backgroundColor: "transparent",
  };

  const labelStyle = { color: fontColor, opacity: 0.7 };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormPending(true);
    setFormError(null);
    const result = await submitContactForm({ firstName, lastName, email: formEmail, message });
    setFormPending(false);
    if (result.ok) {
      setFormSuccess(true);
      setFirstName(""); setLastName(""); setFormEmail(""); setMessage("");
    } else {
      setFormError(result.error ?? "Something went wrong.");
    }
  }

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNewsletterPending(true);
    setNewsletterError(null);
    const result = await subscribeToNewsletter(newsletterEmail);
    setNewsletterPending(false);
    if (result.ok) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
    } else {
      setNewsletterError(result.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
      {/* Main two-column layout */}
      <div className="flex flex-col md:flex-row gap-12 md:gap-16">

        {/* Left: info */}
        <div className="md:w-2/5 space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: fontColor }}>
            {heading}
          </h1>
          <p className="text-base font-semibold italic" style={{ color: fontColor }}>
            {subheading}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: fontColor, opacity: 0.65 }}>
            {bodyText}
          </p>

          {email && (
            <div className="flex items-center gap-2 pt-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0" style={{ color: fontColor }}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <a href={`mailto:${email}`} className="text-sm hover:underline" style={{ color: fontColor }}>
                {email}
              </a>
            </div>
          )}

          {social.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              {social.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="transition-opacity hover:opacity-70"
                  style={{ color: fontColor }}
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: form */}
        <div className="md:w-3/5">
          {formSuccess ? (
            <div
              className="rounded-lg p-6 text-sm text-center"
              style={{ border: `1px solid ${fontColor}`, color: fontColor, opacity: 0.85 }}
            >
              <p className="font-semibold text-base mb-1">Message sent!</p>
              <p style={{ opacity: 0.7 }}>Thank you for reaching out. We&apos;ll get back to you soon.</p>
              <button
                onClick={() => setFormSuccess(false)}
                className="mt-4 text-xs underline"
                style={{ color: fontColor, opacity: 0.5 }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First + Last Name */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={labelStyle}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ ...inputStyle, borderBottom: `1px solid ${fontColor}`, opacity: 0.9 }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1" style={labelStyle}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ ...inputStyle, borderBottom: `1px solid ${fontColor}`, opacity: 0.9 }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs mb-1" style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                  style={{ ...inputStyle, borderBottom: `1px solid ${fontColor}`, opacity: 0.9 }}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs mb-1" style={labelStyle}>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-3 py-2 text-sm focus:outline-none resize-none"
                  style={{ ...inputStyle, border: `1px solid ${fontColor}`, opacity: 0.9 }}
                />
              </div>

              {formError && (
                <p className="text-xs" style={{ color: fontColor, opacity: 0.6 }}>{formError}</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={formPending}
                  className="px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: fontColor, color: bgColor }}
                >
                  {formPending ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Newsletter section */}
      <div className="mt-16 pt-10 border-t" style={{ borderColor: fontColor, opacity: undefined }}>
        <div className="max-w-md">
          <h2 className="text-lg font-semibold mb-1" style={{ color: fontColor }}>
            Subscribe to our Newsletter
          </h2>
          <p className="text-sm mb-4" style={{ color: fontColor, opacity: 0.6 }}>
            Stay up to date with our latest news and offers.
          </p>

          {newsletterSuccess ? (
            <p className="text-sm font-medium" style={{ color: fontColor }}>
              You&apos;re subscribed! Thank you for signing up.
            </p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs mb-1" style={{ color: fontColor, opacity: 0.6 }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                  style={{ borderBottom: `1px solid ${fontColor}`, backgroundColor: "transparent", color: fontColor }}
                />
              </div>
              <button
                type="submit"
                disabled={newsletterPending}
                className="px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0"
                style={{ backgroundColor: fontColor, color: bgColor }}
              >
                {newsletterPending ? "…" : "Subscribe"}
              </button>
            </form>
          )}
          {newsletterError && (
            <p className="text-xs mt-2" style={{ color: fontColor, opacity: 0.6 }}>{newsletterError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
