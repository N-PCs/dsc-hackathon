import path from 'path';

/**
 * Strict Magic-Byte / Signature Validation
 * Prevents disguised executable uploads (e.g. php/sh/exe disguised as image/pdf)
 */
export function validateFileSignature(buffer: Buffer, mimeType: string, fileName: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  const ext = fileName ? path.extname(fileName).toLowerCase().replace('.', '') : '';
  const mime = mimeType ? mimeType.toLowerCase() : '';

  // 1. PDF: %PDF (0x25 0x50 0x44 0x46)
  const isPdfMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

  // 2. JPEG: FF D8 FF
  const isJpegMagic =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  // 3. PNG: 89 50 4E 47
  const isPngMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  // 4. WEBP: RIFF....WEBP
  const isWebpMagic =
    buffer.length >= 12 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50; // P

  // 5. PPTX / Modern Office Open XML (ZIP container): 50 4B 03 04
  const isZipMagic =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;

  // 6. Legacy PPT (OLE2 Compound Document): D0 CF 11 E0
  const isOleMagic =
    buffer.length >= 4 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0;

  if (ext === 'pdf' || mime === 'application/pdf') {
    return isPdfMagic;
  }

  if (ext === 'jpg' || ext === 'jpeg' || mime === 'image/jpeg' || mime === 'image/jpg') {
    return isJpegMagic;
  }

  if (ext === 'png' || mime === 'image/png') {
    return isPngMagic;
  }

  if (ext === 'webp' || mime === 'image/webp') {
    return isWebpMagic;
  }

  if (ext === 'pptx' || mime.includes('presentationml')) {
    return isZipMagic;
  }

  if (ext === 'ppt' || mime.includes('powerpoint')) {
    return isOleMagic || isZipMagic;
  }

  // Fallback: If buffer matches any known valid presentation/image signature
  if (isPdfMagic || isJpegMagic || isPngMagic || isWebpMagic || isZipMagic || isOleMagic) {
    const safeExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'ppt', 'pptx'];
    return safeExtensions.includes(ext);
  }

  return false;
}

/**
 * Sanitizes uploaded file names to avoid path traversal and malicious filenames
 */
export function sanitizeFilename(filename: string): string {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}
