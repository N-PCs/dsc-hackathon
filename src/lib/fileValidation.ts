export function validateFileSignature(buffer: Buffer, mimeType: string, fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType === 'application/pdf' && ext === 'pdf') {
    // PDF magic bytes: %PDF (25 50 44 46)
    return buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  
  if ((mimeType === 'image/jpeg' || mimeType === 'image/jpg') && (ext === 'jpg' || ext === 'jpeg')) {
    // JPEG magic bytes: FF D8 FF
    return buffer.length > 2 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  
  if (mimeType === 'image/png' && ext === 'png') {
    // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
    return buffer.length > 8 && 
           buffer[0] === 0x89 && buffer[1] === 0x50 && 
           buffer[2] === 0x4E && buffer[3] === 0x47 && 
           buffer[4] === 0x0D && buffer[5] === 0x0A && 
           buffer[6] === 0x1A && buffer[7] === 0x0A;
  }
  
  return false;
}
