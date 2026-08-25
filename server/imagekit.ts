import path from 'path';
import fs from 'fs';

const imageKitPublicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const imageKitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const imageKitUrlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

let isImagekitConfigured = false;

if (imageKitPublicKey && imageKitPrivateKey) {
  isImagekitConfigured = true;
  console.log('[Imagekit] SDK configured with public key and private key.');
} else {
  console.log('[Imagekit] No Imagekit API keys found. Upload functionality will be disabled.');
}

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

  // Determine resource type
  const isImage = mimeType.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw';

  if (!isImagekitConfigured) {
    // Fallback Local Storage
    const uploadsDir = path.join(process.cwd(), 'dist', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = path.extname(originalFilename) || (isImage ? '.png' : '.pdf');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, fileBuffer);

    const localUrl = `/uploads/${filename}`;
    console.log(`[Storage Fallback] Saved file locally: ${localUrl} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);

    return {
      url: localUrl,
      publicId: filename,
      format: fileExt.replace('.', ''),
    };
  }

  // Imagekit API upload using official REST endpoint and Basic Auth
  const endpoint = `https://upload.imagekit.io/api/v1/files/upload`;
  const authHeader = 'Basic ' + Buffer.from(imageKitPrivateKey + ':').toString('base64');

  const blob = new Blob([fileBuffer], { type: mimeType || 'application/octet-stream' });

  const formData = new FormData();
  formData.append('file', blob, originalFilename);
  formData.append('fileName', originalFilename);
  formData.append('folder', folder);
  formData.append('useUniqueFileName', 'true');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Imagekit upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    return {
      url: result.url,
      publicId: result.fileId || originalFilename,
      format: result.format || path.extname(originalFilename).replace('.', ''),
    };
  } catch (err: any) {
    console.error('[Imagekit] Upload error:', err);
    throw new Error(err.message || 'Imagekit upload failed');
  }
}