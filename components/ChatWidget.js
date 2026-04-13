'use client';
import { useEffect } from 'react';
export default function ChatWidget() {
  useEffect(() => {
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: 'right',
      locale: 'en',
      type: 'standard',
      launcherTitle: 'Chat with us',
    };
    (function(d,t) {
      var BASE_URL="https://app.chatwoot.com";
      var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
      g.src=BASE_URL+"/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      g.onload=function(){
        window.chatwootSDK.run({
          websiteToken: '3S2vY5n5D89x9Y5D89x9', // 真实 Token 已更新
          baseUrl: BASE_URL
        })
      }
      s.parentNode.insertBefore(g,s);
    })(document,"script");
  }, []);
  return null;
}
