import path from 'path';
import { logger } from '../utils/logger.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadFileToImagekit(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder = '/origin-hackathon'
): Promise<{ url: string; publicId: string; format: string }> {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 10MB limit. Current: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB`);
  }

  const isImage = mimeType ? mimeType.startsWith('image/') : true;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const base64Str = fileBuffer.toString('base64');
  const dataUri = `data:${mimeType || 'application/octet-stream'};base64,${base64Str}`;

  if (!privateKey) {
    logger.warn('[Imagekit] Private key missing – using Data URL fallback.');
    const fileExt = path.extname(originalFilename) || (isImage ? '.png' : '.pdf');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
    return { url: dataUri, publicId: filename, format: fileExt.replace('.', '') };
  }

  const endpoint = 'https://upload.imagekit.io/api/v1/files/upload';
  const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');
  const normalizedFolder = folder.startsWith('/') ? folder : `/${folder}`;

  try {
    const form = new FormData();
    form.append('file', dataUri);
    form.append('fileName', originalFilename || `upload_${Date.now()}.${isImage ? 'png' : 'pdf'}`);
    form.append('folder', normalizedFolder);
    form.append('useUniqueFileName', 'true');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: authHeader },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error({ status: response.status, errorText }, '[Imagekit] Upload failed');
      throw new Error(`Imagekit upload failed: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as {
      url?: string;
      fileId?: string;
      format?: string;
    };
    logger.info({ url: result.url }, '[Imagekit] Upload success');
    return {
      url: result.url ?? dataUri,
      publicId: result.fileId || originalFilename,
      format: result.format || path.extname(originalFilename).replace('.', ''),
    };
  } catch (err: any) {
    logger.error({ err }, '[Imagekit] Upload error – falling back to Data URL');
    const fileExt = path.extname(originalFilename) || (isImage ? '.png' : '.pdf');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
    return { url: dataUri, publicId: filename, format: fileExt.replace('.', '') };
  }
}