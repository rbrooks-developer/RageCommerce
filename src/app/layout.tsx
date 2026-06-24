import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "My Store", template: "%s | My Store" },
  description: "Welcome to our store.",
};

const GOOGLE_FONT_FAMILIES = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
  "Raleway", "Oswald", "Nunito", "DM Sans", "Josefin Sans", "Outfit",
  "Urbanist", "Plus Jakarta Sans", "Figtree", "Mulish", "Quicksand",
  "Playfair Display", "Merriweather", "PT Serif", "Source Sans 3",
  "Lora", "Crimson Text", "EB Garamond", "Libre Baskerville",
  "Bangers", "Comic Neue", "Permanent Marker", "Boogaloo", "Fredoka One",
  "Pacifico", "Caveat", "Patrick Hand", "Indie Flower", "Shadows Into Light",
  "Architects Daughter", "Kalam", "Amatic SC", "Creepster", "Lilita One",
  "Titan One", "Righteous", "Russo One", "Bebas Neue", "Press Start 2P",
];

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const homepage   = settings?.homepage_config as import("@/types").HomepageConfig | null;
  const bgColor    = homepage?.bg_color    ?? "#ffffff";
  const fontColor  = homepage?.font_color  ?? "#111827";
  const fontFamily = homepage?.font_family ?? "default";
  const heroFont   = homepage?.hero_font   ?? "Playfair Display";
  const faviconUrl = settings?.favicon_url ?? null;

  const isGoogleFont   = GOOGLE_FONT_FAMILIES.includes(fontFamily);
  const googleFontUrl  = isGoogleFont
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}&display=swap`
    : null;

  // Hero font is always a Google Font (all options in the picker are Google Fonts)
  const heroFontUrl = heroFont !== fontFamily
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(heroFont)}&display=swap`
    : null;

  const bodyFontFamily = isGoogleFont
    ? `'${fontFamily}', sans-serif`
    : `var(--font-geist-sans), Arial, sans-serif`;

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        {(googleFontUrl || heroFontUrl) && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          </>
        )}
        {googleFontUrl && <link rel="stylesheet" href={googleFontUrl} />}
        {heroFontUrl   && <link rel="stylesheet" href={heroFontUrl} />}
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: bgColor, color: fontColor, fontFamily: bodyFontFamily, '--site-fg': fontColor, '--site-bg': bgColor } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
