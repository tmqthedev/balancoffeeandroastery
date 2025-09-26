import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOHelmet = ({
  title = "Balan Coffee & Roastery - Cà phê rang mộc chất lượng cao",
  description = "Cà phê rang mộc chất lượng cao từ Việt Nam. Chuyên về Arabica Cầu Đất, Arabica Typica Kongo và Robusta Lâm Đồng. Mua hạt cà phê nguyên chất online.",
  keywords = "cà phê rang mộc, Arabica Cầu Đất, Arabica Typica Kongo, Robusta Lâm Đồng, coffee and roastery, mua hạt cà phê nguyên chất, cà phê Việt Nam",
  ogTitle,
  ogDescription,
  ogImage = "/dist/title.jpg",
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl,
  structuredData,
  noIndex = false,
  noFollow = false
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://balancoffeeroastery.com.vn';
  const finalCanonicalUrl = canonicalUrl || currentUrl;
  const finalOgUrl = ogUrl || currentUrl;
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const finalTwitterTitle = twitterTitle || title;
  const finalTwitterDescription = twitterDescription || description;
  const finalTwitterImage = twitterImage || ogImage;

  const robotsContent = `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Balan Coffee & Roastery",
    "url": "https://balancoffeeroastery.com.vn",
    "logo": `https://balancoffeeroastery.com.vn${ogImage}`,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Đường Cà Phê",
      "addressLocality": "Quận 1",
      "addressRegion": "TP.HCM",
      "addressCountry": "VN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84-123-456-789",
      "contactType": "customer service",
      "email": "info@balancoffeeroastery.com.vn"
    },
    "sameAs": [
      "https://facebook.com/balancoffee",
      "https://instagram.com/balancoffee",
      "https://www.tiktok.com/@blan.vin"
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={`https://balancoffeeroastery.com.vn${ogImage}`} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Balan Coffee & Roastery" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@balancoffeeroastery" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={`https://balancoffeeroastery.com.vn${finalTwitterImage}`} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData || defaultStructuredData, null, 2)}
      </script>
    </Helmet>
  );
};

SEOHelmet.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogTitle: PropTypes.string,
  ogDescription: PropTypes.string,
  ogImage: PropTypes.string,
  ogUrl: PropTypes.string,
  twitterTitle: PropTypes.string,
  twitterDescription: PropTypes.string,
  twitterImage: PropTypes.string,
  canonicalUrl: PropTypes.string,
  structuredData: PropTypes.object,
  noIndex: PropTypes.bool,
  noFollow: PropTypes.bool
};

export default SEOHelmet;

