'use client'
import Script from 'next/script'
export default function ChatWidget() {
  return (
    <Script id="chatwoot-sdk" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
      (function(d,t) {
        var BASE_URL="https://app.chatwoot.com";
        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=BASE_URL+"/packs/js/sdk.js";
        g.defer = true; g.async = true;
        g.onload=function(){
          window.chatwootSDK.run({
            websiteToken: '3S2vY5n5D89x9Y5D89x9',
            baseUrl: BASE_URL
          })
        }
        s.parentNode.insertBefore(g,s);
      })(document,"script");
    ` }} />
  )
}
