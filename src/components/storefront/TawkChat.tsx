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

// Fully URL-encoded SVG fallback — no raw quotes so it is safe to embed
// inside a JS string literal. Used when Tawk.to's S3 avatar returns 403.
const FALLBACK_AVATAR =
  "data:image/svg+xml," +
  "%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2040%2040%22%3E" +
  "%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%2220%22%20fill%3D%22%2303b2cb%22%2F%3E" +
  "%3Ccircle%20cx%3D%2220%22%20cy%3D%2215%22%20r%3D%227%22%20fill%3D%22white%22%2F%3E" +
  "%3Cellipse%20cx%3D%2220%22%20cy%3D%2235%22%20rx%3D%2212%22%20ry%3D%229%22%20fill%3D%22white%22%2F%3E" +
  "%3C%2Fsvg%3E";

export function TawkChat({ propertyId, widgetId, visitor }: TawkChatProps) {
  const pid = sanitize(propertyId);
  const wid = sanitize(widgetId);

  if (!pid || !wid) return null;

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

          // Watch for Tawk.to's S3 avatar images being inserted into the DOM.
          // Their agent profile photos are stored as private S3 objects which
          // return 403 when loaded from external sites. Swap them for a fallback
          // before the browser shows the broken-image icon.
          (function(){
            var FALLBACK='${FALLBACK_AVATAR}';
            function patchImg(img){
              if(!img || img.dataset.tawkPatched) return;
              img.dataset.tawkPatched='1';
              img.addEventListener('error',function(){
                if(this.src.indexOf('s3.amazonaws.com')!==-1||
                   this.src.indexOf('tawk-to-pi')!==-1){
                  this.src=FALLBACK;
                }
              });
            }
            function scanImgs(root){
              var imgs=root.querySelectorAll?root.querySelectorAll('img'):[];
              for(var i=0;i<imgs.length;i++) patchImg(imgs[i]);
            }
            var obs=new MutationObserver(function(mutations){
              for(var i=0;i<mutations.length;i++){
                var added=mutations[i].addedNodes;
                for(var j=0;j<added.length;j++){
                  var n=added[j];
                  if(n.nodeType!==1) continue;
                  if(n.tagName==='IMG') patchImg(n);
                  else scanImgs(n);
                }
              }
            });
            obs.observe(document.body,{childList:true,subtree:true});
          })();

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
