// Google Analytics 4 Implementation
export const initGA4 = () => {
  const TRACKING_ID = process.env.VITE_GA_TRACKING_ID;
  
  if (!TRACKING_ID) return;
  
  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
  document.head.appendChild(script);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
  
  // Make gtag available globally
  window.gtag = gtag;
};

// Meta Pixel (Facebook) Implementation
export const initMetaPixel = () => {
  const PIXEL_ID = process.env.VITE_META_PIXEL_ID;
  
  if (!PIXEL_ID) return;
  
  // Add Facebook Pixel code
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
};

// TikTok Pixel Implementation
export const initTikTokPixel = () => {
  const TIKTOK_PIXEL_ID = process.env.VITE_TIKTOK_PIXEL_ID;
  
  if (!TIKTOK_PIXEL_ID) return;
  
  !function (w, d, t) {
    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  }(window, document, 'ttq');
};

// Initialize all analytics tools
export const initAnalytics = () => {
  // Only initialize in production or if explicitly enabled in other environments
  if (process.env.NODE_ENV === 'production' || process.env.VITE_ENABLE_ANALYTICS === 'true') {
    initGA4();
    initMetaPixel();
    initTikTokPixel();
  }
};

// Track page view across all platforms
export const trackPageView = (path) => {
  // Track in GA4
  if (window.gtag) {
    window.gtag('config', process.env.VITE_GA_TRACKING_ID, {
      page_path: path
    });
  }
  
  // Track in Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
  
  // Track in TikTok
  if (window.ttq) {
    window.ttq.page();
  }
};

// Track ecommerce events
export const trackEcommerceEvent = (eventName, data) => {
  // GA4 ecommerce events
  if (window.gtag) {
    window.gtag('event', eventName, data);
  }
  
  // Meta Pixel ecommerce events
  if (window.fbq) {
    switch (eventName) {
      case 'view_item':
        window.fbq('track', 'ViewContent', {
          content_ids: [data.items[0].item_id],
          content_name: data.items[0].item_name,
          content_type: 'product',
          value: data.value,
          currency: data.currency
        });
        break;
      case 'add_to_cart':
        window.fbq('track', 'AddToCart', {
          content_ids: [data.items[0].item_id],
          content_name: data.items[0].item_name,
          content_type: 'product',
          value: data.value,
          currency: data.currency
        });
        break;
      case 'begin_checkout':
        window.fbq('track', 'InitiateCheckout', {
          value: data.value,
          currency: data.currency
        });
        break;
      case 'purchase':
        window.fbq('track', 'Purchase', {
          value: data.value,
          currency: data.currency
        });
        break;
    }
  }
  
  // TikTok Pixel ecommerce events
  if (window.ttq) {
    switch (eventName) {
      case 'view_item':
        window.ttq.track('ViewContent', {
          content_id: data.items[0].item_id,
          content_name: data.items[0].item_name,
          value: data.value,
          currency: data.currency
        });
        break;
      case 'add_to_cart':
        window.ttq.track('AddToCart', {
          content_id: data.items[0].item_id,
          content_name: data.items[0].item_name,
          value: data.value,
          currency: data.currency
        });
        break;
      case 'begin_checkout':
        window.ttq.track('InitiateCheckout', {
          value: data.value,
          currency: data.currency
        });
        break;
      case 'purchase':
        window.ttq.track('CompletePayment', {
          value: data.value,
          currency: data.currency
        });
        break;
    }
  }
};

export default { initAnalytics, trackPageView, trackEcommerceEvent };
