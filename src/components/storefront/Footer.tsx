import type { FooterConfig, ContactInfo } from "@/types";

interface FooterProps {
  siteTitle: string;
  logoUrl: string | null;
  footerConfig: FooterConfig;
  contactInfo: ContactInfo;
  bgColor?: string;
  fontColor?: string;
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p.includes("instagram")) return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
  if (p.includes("youtube")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29.94 29.94 0 001 12a29.94 29.94 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29.94 29.94 0 0023 12a29.94 29.94 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
    </svg>
  );
  if (p.includes("facebook")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  );
  if (p.includes("twitter") || p === "x") return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
  if (p.includes("tiktok")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  );
  if (p.includes("linkedin")) return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

export function Footer({ siteTitle, logoUrl, footerConfig, contactInfo, bgColor = "#ffffff", fontColor = "#111827" }: FooterProps) {
  const { social, copyright_text, tagline, social_handle } = footerConfig ?? {};
  const activeSocial = (social ?? []).filter((s) => s.platform && s.url);

  return (
    <footer
      className="mt-auto border-t border-black/10"
      style={{ backgroundColor: bgColor, color: fontColor }}
    >
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:items-center">

          {/* Left — Logo */}
          <div className="flex justify-center md:justify-start">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteTitle} className="h-24 w-24 object-contain" />
            ) : (
              <span className="text-2xl font-bold tracking-widest uppercase">{siteTitle}</span>
            )}
          </div>

          {/* Center — Name, tagline, contact, socials */}
          <div className="flex flex-col items-center text-center gap-1">
            <p className="text-sm font-bold tracking-[0.25em] uppercase">{siteTitle}</p>
            {tagline && (
              <p className="text-xs tracking-[0.2em] uppercase opacity-70">{tagline}</p>
            )}

            {(contactInfo?.phone || contactInfo?.email) && (
              <div className="mt-3 space-y-1 text-xs opacity-80">
                {contactInfo.phone && <p>T: {contactInfo.phone}</p>}
                {contactInfo.email && <p>E: {contactInfo.email}</p>}
              </div>
            )}

            {activeSocial.length > 0 && (
              <>
                <div className="my-3 w-32 border-t border-current opacity-20" />
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {activeSocial.map((s, i) => (
                    <span key={s.url} className="flex items-center gap-2">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.platform}
                        className="transition-opacity hover:opacity-70"
                        style={{ color: fontColor }}
                      >
                        <SocialIcon platform={s.platform} />
                      </a>
                      {i < activeSocial.length - 1 && (
                        <span className="opacity-30 text-xs">|</span>
                      )}
                    </span>
                  ))}
                  {social_handle && (
                    <>
                      <span className="opacity-30 text-xs">|</span>
                      <span className="text-xs tracking-[0.15em] uppercase opacity-70">{social_handle}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right — Copyright */}
          <div className="flex justify-center md:justify-end">
            <p className="text-xs opacity-60 text-center md:text-right">
              {copyright_text || `© ${new Date().getFullYear()} ${siteTitle}. All rights reserved.`}
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
