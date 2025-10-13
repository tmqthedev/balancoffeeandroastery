// Google Analytics 4 Implementation
export const initGA4 = () => {
  const TRACKING_ID = null; // Disabled for development
  
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

// Meta Pixel Implementation - DISABLED
export const initMetaPixel = () => {
  // Meta Pixel disabled - removed for simplified system
  console.log('Meta Pixel disabled');
};

// TikTok Pixel Implementation
export const initTikTokPixel = () => {
  const TIKTOK_PIXEL_ID = null; // Disabled for development
  
  if (!TIKTOK_PIXEL_ID) return;
  
  (function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    const ttq = w[t] = w[t] || [];
    
    ttq.methods = [
      'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 
      'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'
    ];
    
    ttq.setAndDefer = function(targetObj, method) {
      targetObj[method] = function() {
        targetObj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };    };
    
    for (const method of ttq.methods) {
      ttq.setAndDefer(ttq, method);
    }
    
    ttq.instance = function(instanceId) {
      const instance = ttq._i[instanceId] || [];
      for (const method of ttq.methods) {
        ttq.setAndDefer(instance, method);
      }
      return instance;
    };
    
    ttq.load = function(pixelId, options) {
      const scriptUrl = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[pixelId] = [];
      ttq._i[pixelId]._u = scriptUrl;
      ttq._t = ttq._t || {};
      ttq._t[pixelId] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[pixelId] = options || {};
      
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = scriptUrl + '?sdkid=' + pixelId + '&lib=' + t;
      
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    };
    
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  })(window, document, 'ttq');
};

// Initialize all analytics tools
export const initAnalytics = () => {
  // Disabled for development
  const enableAnalytics = false;
  if (enableAnalytics) {
    initGA4();
    // initMetaPixel(); // Disabled - Meta Pixel removed
    initTikTokPixel();
  }
};

// Track page view across all platforms
export const trackPageView = (path) => {
  // Track in GA4
  if (window.gtag) {
    window.gtag('config', 'GA_TRACKING_ID', {
      page_path: path
    });
  }
  
  // Meta Pixel disabled - removed for simplified system
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
  
  // Meta Pixel disabled - removed for simplified system
  // Meta Pixel ecommerce events disabled
  
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
