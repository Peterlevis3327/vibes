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
    const domain = parsedUrl.hostname.replace('www.', '');
    
    // Add a simple timeout via AbortController so a bad link doesn't hang the server render
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    // Only parse HTML responses — bail out for binary files (APK, PDF, images, etc.)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetaTag = (name: string) => 
      $(`meta[property="${name}"]`).attr('content') || 
      $(`meta[name="${name}"]`).attr('content') || 
      $(`meta[name="${name.replace('og:', 'twitter:')}"]`).attr('content');

    const title = getMetaTag('og:title') || $('title').text() || null;
    const description = getMetaTag('og:description') || getMetaTag('description') || null;
    let image = getMetaTag('og:image') || getMetaTag('image') || null;

    // Make image url absolute if it's relative
    if (image && !image.startsWith('http')) {
      if (image.startsWith('/')) {
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
    console.error(`Failed to fetch link preview for ${url}`, error);
    return null;
  }
};

// Cache the result for 24 hours (86400 seconds) so we don't spam external sites
export const getLinkPreview = unstable_cache(
  async (url: string) => fetchMetadata(url),
  ['link-preview'],
  { revalidate: 86400 }
);
