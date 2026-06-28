"use client";

import Script from "next/script";

function sanitize(id: string) {
  return id.replace(/[^a-zA-Z0-9\-]/g, "");
}

interface TawkChatProps {
  propertyId: string;
  widgetId: string;
  visitor: { name: string; email: string };
}

export function TawkChat({ propertyId, widgetId, visitor }: TawkChatProps) {
  const pid = sanitize(propertyId);
  const wid = sanitize(widgetId);

  if (!pid || !wid) return null;

  // JSON.stringify handles all escaping — safe to embed in a script tag
  const visitorJson = JSON.stringify({ name: visitor.name, email: visitor.email });

  return (
    <Script
      id="tawk-to"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{};
          Tawk_API.visitor=${visitorJson};
          var Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${pid}/${wid}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
