import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tech254.netlify.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/plmhrauth/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
