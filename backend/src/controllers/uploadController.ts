import { Request, Response } from 'express';
import multer from 'multer';
import { uploadFileToS3 } from '../config/s3.js';
import { uploadFileToImagekit } from '../config/imagekit.js';
import { validateFileSignature } from '../utils/fileValidation.js';
import { logger } from '../utils/logger.js';

const storage = multer.memoryStorage();
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream',
];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.ppt', '.pptx'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(`.${ext}`) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.includes('presentation') ||
    file.mimetype.includes('powerpoint')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDF, PPT, and PPTX files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 🔥 50MB limit (was 50MB)
  fileFilter,
});

export const uploadFile = (req: Request, res: Response) => {
  // If base64 in body
  if (req.body && req.body.fileData) {
    handleBase64Upload(req, res);
    return;
  }

  // Multipart
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      logger.error({ err }, 'Multer upload error');
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }
      if (!validateFileSignature(req.file.buffer, req.file.mimetype, req.file.originalname)) {
        return res.status(400).json({ success: false, message: 'Invalid file signature' });
      }

      // Upload to AWS S3
      const result = await uploadFileToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        'presentations'
      );

      res.json({
        success: true,
        url: result.url,
        key: result.key,
        publicId: result.publicId,
        filename: req.file.originalname,
        size: result.size,
      });
    } catch (err: any) {
      logger.error({ err }, 'Upload error');
      res.status(500).json({ success: false, message: err.message || 'Upload failed' });
    }
  });
};

async function handleBase64Upload(req: Request, res: Response) {
  try {
    const { fileData, fileName = 'presentation.pdf', mimeType = 'application/pdf' } = req.body;
    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }
    if (!validateFileSignature(buffer, mimeType, fileName)) {
      return res.status(400).json({ success: false, message: 'Invalid file signature' });
    }
    const result = await uploadFileToS3(buffer, fileName, mimeType, 'presentations');
    res.json({
      success: true,
      url: result.url,
      key: result.key,
      publicId: result.publicId,
      filename: fileName,
      size: buffer.length,
    });
  } catch (err: any) {
    logger.error({ err }, 'Base64 upload error');
    res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
}