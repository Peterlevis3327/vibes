export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // If not a Cloudinary URL or not an upload URL, return raw
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) {
    return src;
  }

  // Split the URL around the `/upload/` segment
  const parts = src.split('/upload/');
  
  if (parts.length !== 2) {
    return src;
  }

  // The base params we want to ensure are applied
  const baseParams = [
    'f_auto',
    'c_limit',
    `w_${width}`,
    `q_auto:best`
  ];

  // If there are existing transformations immediately after upload/ (e.g. c_crop,x_10,y_10,w_100,h_100)
  // Cloudinary allows chaining them like `/upload/c_crop.../f_auto,c_limit,w_600/v1234...`
  // We check if the next segment is a transformation block (doesn't start with v and followed by slash)
  let existingTransformations = '';
  let restOfPath = parts[1];

  const firstSlashIndex = parts[1].indexOf('/');
  if (firstSlashIndex !== -1) {
    const potentialTransform = parts[1].substring(0, firstSlashIndex);
    // Cloudinary versions start with 'v' followed by numbers, e.g., v1700000000
    if (!potentialTransform.match(/^v\d+$/) && potentialTransform.includes('_')) {
      existingTransformations = potentialTransform + '/';
      restOfPath = parts[1].substring(firstSlashIndex + 1);
    }
  }

  return `${parts[0]}/upload/${existingTransformations}${baseParams.join(',')}/${restOfPath}`;
}
