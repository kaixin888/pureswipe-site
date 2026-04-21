'use client'
import Script from 'next/script'

export default function ChatWidget() {
  return (
    <Script
      id="chatwoot-sdk"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          (function(d,t) {
            var BASE_URL="https://app.chatwoot.com";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.defer = true;
            g.async = true;
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: 'UgFhqRHCBAivmm5C4f3b3SJL',
                baseUrl: BASE_URL,
                type: 'standard'
              })
            }
            s.parentNode.insertBefore(g,s);
          })(document,"script");
        `,
      }}
    />
  )
}
