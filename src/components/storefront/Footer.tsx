import Link from "next/link";
import type { FooterConfig, ContactInfo } from "@/types";

interface FooterProps {
  siteTitle: string;
  footerConfig: FooterConfig;
  contactInfo: ContactInfo;
}

export function Footer({ siteTitle, footerConfig, contactInfo }: FooterProps) {
  const { links, social, copyright_text } = footerConfig ?? {};

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-bold text-gray-900">{siteTitle}</p>
            {contactInfo?.email && (
              <p className="mt-2 text-sm text-gray-500">{contactInfo.email}</p>
            )}
            {contactInfo?.phone && (
              <p className="text-sm text-gray-500">{contactInfo.phone}</p>
            )}
          </div>

          {/* Links */}
          {(links ?? []).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Links</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.link}>
                    <Link href={link.link} className="text-sm text-gray-500 hover:text-gray-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social */}
          {(social ?? []).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Follow us</h3>
              <ul className="mt-3 space-y-2">
                {social.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">
            {copyright_text || `© ${new Date().getFullYear()} ${siteTitle}`}
          </p>
        </div>
      </div>
    </footer>
  );
}
