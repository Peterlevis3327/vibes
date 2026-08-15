import Script from "next/script";

interface StructuredDataProps {
  settings: any;
}

export function StructuredData({ settings }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const orgData = {
    "@context": "https://schema.org",
    "@type": "Organization", // Could be LocalBusiness based on settings
    "name": settings.siteName || "Tech254",
    "url": baseUrl,
    "logo": settings.logoUrl ? `${baseUrl}${settings.logoUrl}` : undefined,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": settings.contactPhone || settings.whatsappNumber,
      "contactType": "customer service",
      "email": settings.contactEmail,
    },
    "sameAs": [
      settings.socialTwitter,
      settings.socialLinkedin,
      settings.socialInstagram,
    ].filter(Boolean),
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
    />
  );
}
