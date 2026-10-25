import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { config } from '../config';
import { createError } from './errorHandler';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createStorage(subDir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dest = path.resolve(config.storage.uploadDir, subDir);
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, _file, cb) => {
      // Use random name to prevent path traversal and metadata leakage
      const id = nanoid(16);
      const ext = _file.originalname
        ? path.extname(_file.originalname).toLowerCase()
        : '.jpg';
      cb(null, `${id}${ext}`);
    },
  });
}

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    ALLOWED_MIME_TYPES.includes(file.mimetype) &&
    ALLOWED_EXTENSIONS.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(
      createError(
        `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        400,
        'INVALID_FILE_TYPE'
      )
    );
  }
}

const maxSize = config.storage.maxSizeMb * 1024 * 1024;

export const wardrobeUpload = multer({
  storage: createStorage('wardrobe'),
  fileFilter,
  limits: { fileSize: maxSize, files: 1 },
});

export const referenceUpload = multer({
  storage: createStorage('reference'),
  fileFilter,
  limits: { fileSize: maxSize, files: 1 },
});

export const avatarUpload = multer({
  storage: createStorage('avatars'),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

// Multer error handler
export function handleUploadError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File exceeds maximum size of ${config.storage.maxSizeMb}MB`,
        },
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: err.message },
    });
    return;
  }
  next(err);
}
