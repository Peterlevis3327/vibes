import * as cheerio from 'cheerio';
import { unstable_cache } from 'next/cache';

export interface LinkPreviewData {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string;
  domain: string;
}

const fetchMetadata = async (url: string): Promise<LinkPreviewData | null> => {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace(/^www\./i, '');
    
    // Add a 5s timeout so slow/unresponsive links don't block server rendering
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; Tech254Bot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      cache: 'force-cache',
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetaTag = (name: string) => 
      $(`meta[property="${name}"]`).attr('content') || 
      $(`meta[name="${name}"]`).attr('content') || 
      $(`meta[property="${name.toLowerCase()}"]`).attr('content') ||
      $(`meta[name="${name.toLowerCase()}"]`).attr('content') ||
      $(`meta[name="${name.replace('og:', 'twitter:')}"]`).attr('content');

    const title = (getMetaTag('og:title') || $('title').text() || $('h1').first().text() || '').trim() || null;
    const description = (getMetaTag('og:description') || getMetaTag('description') || '').trim() || null;
    let image = (getMetaTag('og:image') || getMetaTag('image') || getMetaTag('twitter:image') || '').trim() || null;

    // Convert relative image URLs to absolute URLs
    if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
      if (image.startsWith('//')) {
        image = `${parsedUrl.protocol}${image}`;
      } else if (image.startsWith('/')) {
        image = `${parsedUrl.protocol}//${parsedUrl.host}${image}`;
      } else {
        image = `${parsedUrl.protocol}//${parsedUrl.host}/${image}`;
      }
    }

    return {
      title,
      description,
      image,
      url,
      domain
    };
  } catch (error) {
    console.warn(`Link preview unavailable for ${url}:`, (error as Error)?.message || error);
    return null;
  }
};

// Cache the result for 24 hours per URL to avoid redundant external network requests
export const getLinkPreview = async (rawUrl: string): Promise<LinkPreviewData | null> => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const normalizedUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
    ? trimmed 
    : `https://${trimmed}`;

  return unstable_cache(
    async () => fetchMetadata(normalizedUrl),
    [`link-preview-${normalizedUrl}`],
    { revalidate: 86400 }
  )();
};
