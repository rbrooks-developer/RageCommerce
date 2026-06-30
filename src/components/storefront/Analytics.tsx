"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { TrackingConfig } from "@/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    clarity?: (...args: unknown[]) => void;
  }
}

export function Analytics({ ga4_id, meta_pixel_id, clarity_id }: TrackingConfig) {
  const pathname = usePathname();

  // Fire page_view on client-side navigations (Next.js doesn't reload the page)
  useEffect(() => {
    if (ga4_id) {
      window.gtag?.("config", ga4_id, { page_path: pathname });
    }
    if (meta_pixel_id) {
      window.fbq?.("track", "PageView");
    }
  }, [pathname, ga4_id, meta_pixel_id]);

  return (
    <>
      {/* ── Google Analytics 4 ── */}
      {ga4_id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4_id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4_id}', { page_path: window.location.pathname });
          `}</Script>
        </>
      )}

      {/* ── Meta Pixel ── */}
      {meta_pixel_id && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${meta_pixel_id}');
          fbq('track','PageView');
        `}</Script>
      )}

      {/* ── Microsoft Clarity ── */}
      {clarity_id && (
        <Script id="ms-clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)}
          (window,document,"clarity","script","${clarity_id}");
        `}</Script>
      )}
    </>
  );
}
