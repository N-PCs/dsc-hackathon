import { Request, Response } from 'express';
import multer from 'multer';
import { uploadFileToS3 } from '../config/s3.js';
import { uploadFileToImagekit } from '../config/imagekit.js';
import { validateFileSignature, sanitizeFilename } from '../utils/fileValidation.js';
import { logger } from '../utils/logger.js';

const storage = multer.memoryStorage();
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.ppt', '.pptx'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(`.${ext}`)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (PNG, JPG, WEBP), PDF, PPT, and PPTX files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter,
});

export const uploadFile = (req: Request, res: Response) => {
  // If base64 in body
  if (req.body && req.body.fileData) {
    handleBase64Upload(req, res);
    return;
  }

  // Multipart upload
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      logger.error({ err }, 'Multer upload error');
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }

      const cleanFilename = sanitizeFilename(req.file.originalname);

      if (!validateFileSignature(req.file.buffer, req.file.mimetype, cleanFilename)) {
        logger.warn({ filename: cleanFilename, ip: req.ip }, 'Rejected file upload with invalid magic bytes');
        return res.status(400).json({ success: false, message: 'Invalid file signature / corrupted file' });
      }

      // Upload to AWS S3 (with ImageKit fallback)
      const result = await uploadFileToS3(
        req.file.buffer,
        cleanFilename,
        req.file.mimetype,
        'presentations'
      );

      res.json({
        success: true,
        url: result.url,
        key: result.key,
        publicId: result.publicId,
        filename: cleanFilename,
        size: result.size,
      });
    } catch (err: any) {
      logger.error({ err }, 'Upload error');
      res.status(500).json({ success: false, message: 'Upload processing failed' });
    }
  });
};

async function handleBase64Upload(req: Request, res: Response) {
  try {
    const { fileData, fileName = 'presentation.pdf', mimeType = 'application/pdf' } = req.body;
    const cleanFilename = sanitizeFilename(fileName);

    const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    if (buffer.length > 15 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size exceeds 15MB limit' });
    }

    if (!validateFileSignature(buffer, mimeType, cleanFilename)) {
      logger.warn({ filename: cleanFilename, ip: req.ip }, 'Rejected base64 upload with invalid magic bytes');
      return res.status(400).json({ success: false, message: 'Invalid file signature' });
    }

    const result = await uploadFileToS3(buffer, cleanFilename, mimeType, 'presentations');
    res.json({
      success: true,
      url: result.url,
      key: result.key,
      publicId: result.publicId,
      filename: cleanFilename,
      size: buffer.length,
    });
  } catch (err: any) {
    logger.error({ err }, 'Base64 upload error');
    res.status(500).json({ success: false, message: 'Upload processing failed' });
  }
}
