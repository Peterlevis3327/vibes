export async function getCloudinaryBlurDataUrl(url: string | undefined): Promise<string | undefined> {
  if (!url || !url.includes("cloudinary.com")) return undefined;

  try {
    // Check if URL has an upload segment
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return undefined;

    // Insert transformations for a tiny, highly blurred image
    // w_10: resize to 10px width
    // e_blur:1000: apply maximum blur
    // q_auto,f_auto: automatic quality and format
    const transformedUrl = 
      url.substring(0, uploadIndex + 8) + 
      "w_10,e_blur:1000,q_auto,f_auto/" + 
      url.substring(uploadIndex + 8);

    // Fetch the tiny image
    const response = await fetch(transformedUrl, {
      cache: 'force-cache',
      next: { revalidate: 86400 * 30 } // Cache for 30 days
    });

    if (!response.ok) {
      console.warn("Failed to fetch blur image from Cloudinary:", response.statusText);
      return undefined;
    }

    // Convert to base64
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error generating blur data URL:", error);
    return undefined;
  }
}
