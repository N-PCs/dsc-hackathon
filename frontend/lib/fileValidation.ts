export function validateFileSignature(buffer: Buffer, mimeType: string, fileName: string): boolean {
  if (!buffer || buffer.length === 0) return false;

  const ext = fileName ? fileName.split(".").pop()?.toLowerCase() : "";
  const mime = mimeType ? mimeType.toLowerCase() : "";

  // PDF: %PDF (25 50 44 46)
  if (mime.includes("pdf") || ext === "pdf") {
    if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return true;
    }
  }

  // JPEG: FF D8 FF
  if (mime.includes("jpeg") || mime.includes("jpg") || ext === "jpg" || ext === "jpeg") {
    if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return true;
    }
  }

  // PNG: 89 50 4E 47
  if (mime.includes("png") || ext === "png") {
    if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true;
    }
  }

  // Allow general image types (WebP, GIF, etc.), presentations (PPT, PPTX), or valid file buffers
  if (
    mime.startsWith("image/") ||
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    mime.includes("octet-stream") ||
    ["ppt", "pptx", "webp", "gif", "png", "jpg", "jpeg", "pdf"].includes(ext || "")
  ) {
    return true;
  }

  return false;
}