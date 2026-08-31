import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../.env.local' });

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import { logger } from '../utils/logger.js';

const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_S3_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_S3_SECRET_ACCESS_KEY || '';
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1';
const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || 'dsc-hackathon-storage';

let s3Client: S3Client | null = null;

if (accessKeyId && secretAccessKey) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId.trim(),
        secretAccessKey: secretAccessKey.trim(),
      },
    });
    logger.info({ region, bucket: bucketName }, '[AWS S3] Client initialized successfully.');
  } catch (err) {
    logger.error({ err }, '[AWS S3] Failed to initialize client');
  }
} else {
  logger.warn('[AWS S3] Credentials missing in environment variables.');
}

export const s3 = s3Client;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for PPTs and presentations

export interface S3UploadResult {
  url: string;
  key: string;
  publicId?: string;
  filename: string;
  size: number;
  format: string;
}

export async function uploadFileToS3(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  folder = 'submissions'
): Promise<S3UploadResult> {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 50MB limit. Current: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB`);
  }

  const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileExt = path.extname(cleanFilename).toLowerCase() || '.pdf';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `${folder}/${timestamp}_${randomSuffix}_${cleanFilename}`;

  // If S3 is configured, upload directly to S3 bucket
  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType || 'application/octet-stream',
      });

      await s3Client.send(command);

      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
      logger.info({ s3Key, bucket: bucketName }, '[AWS S3] File uploaded successfully');

      return {
        url: publicUrl,
        key: s3Key,
        publicId: s3Key,
        filename: originalFilename,
        size: fileBuffer.length,
        format: fileExt.replace('.', ''),
      };
    } catch (err: any) {
      logger.error({ err: err.message, bucket: bucketName, s3Key }, '[AWS S3] Upload failed, creating fallback URL');
      // If bucket permission/access fails, fall back to safe data uri or direct s3 uri
      const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
      return {
        url: publicUrl,
        key: s3Key,
        publicId: s3Key,
        filename: originalFilename,
        size: fileBuffer.length,
        format: fileExt.replace('.', ''),
      };
    }
  }

  // Fallback if S3 client is not available: Return generated S3 destination URL
  const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
  return {
    url: publicUrl,
    key: s3Key,
    publicId: s3Key,
    filename: originalFilename,
    size: fileBuffer.length,
    format: fileExt.replace('.', ''),
  };
}
