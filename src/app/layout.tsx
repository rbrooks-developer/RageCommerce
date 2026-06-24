import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "My Store",
    template: "%s | My Store",
  },
  description: "Welcome to our store.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const bgColor = (settings as any)?.bg_color ?? "#ffffff";
  const fontColor = (settings as any)?.font_color ?? "#111827";

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{ backgroundColor: bgColor, color: fontColor }}
      >
        {children}
      </body>
    </html>
  );
}
