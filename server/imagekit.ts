import path from 'path';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Megabytes limit

export async function uploadFileToImagekit(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder = 'origin-hackathon'
): Promise<{ url: string; publicId: string; format: string }> {
  // Validate File Size Limit (10MB)
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 10MB limit. Current file size: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB`);
  }

  const isImage = mimeType ? mimeType.startsWith('image/') : true;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    console.warn('[Imagekit Warning] IMAGEKIT_PRIVATE_KEY is missing. Using Data URL fallback.');
    try {
      const fileExt = path.extname(originalFilename) || (isImage ? '.png' : '.pdf');
      const base64Str = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType || 'application/octet-stream'};base64,${base64Str}`;
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;

      console.log(`[Storage Fallback] Created Data URL: (${(fileBuffer.length / 1024).toFixed(1)} KB)`);

      return {
        url: dataUrl,
        publicId: filename,
        format: fileExt.replace('.', ''),
      };
    } catch (fallbackErr) {
      console.error('[Storage Fallback Error]:', fallbackErr);
      throw new Error('Failed to process image buffer.');
    }
  }

  const endpoint = `https://upload.imagekit.io/api/v1/files/upload`;
  const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

  const base64Str = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType || 'application/octet-stream'};base64,${base64Str}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        file: dataUri,
        fileName: originalFilename,
        folder: folder,
        useUniqueFileName: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Imagekit Upload Failed ${response.status}]:`, errorText);
      throw new Error(`Imagekit upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('[Imagekit Upload Success]: Cloud URL ->', result.url);

    return {
      url: result.url,
      publicId: result.fileId || originalFilename,
      format: result.format || path.extname(originalFilename).replace('.', ''),
    };
  } catch (err: any) {
    console.error('[Imagekit] Upload error, falling back to Data URL:', err.message);
    try {
      const fileExt = path.extname(originalFilename) || (isImage ? '.png' : '.pdf');
      const dataUrl = `data:${mimeType || 'application/octet-stream'};base64,${base64Str}`;
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
      return {
        url: dataUrl,
        publicId: filename,
        format: fileExt.replace('.', ''),
      };
    } catch (fallbackErr) {
      throw new Error(err.message || 'Imagekit upload failed');
    }
  }
}