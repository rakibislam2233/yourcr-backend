import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ],
} as const;

const ALL_ALLOWED_MIME_TYPES = [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.documents];

// Extension to MIME mapping
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  jpg: ['image/jpeg', 'image/jpg'],
  jpeg: ['image/jpeg', 'image/jpg'],
  png: ['image/png'],
  gif: ['image/gif'],
  webp: ['image/webp'],
  svg: ['image/svg+xml'],
  ico: ['image/x-icon', 'image/vnd.microsoft.icon'],
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  txt: ['text/plain'],
  csv: ['text/csv'],
};

// Blocked extensions
const BLOCKED_EXTENSIONS = [
  'exe',
  'bat',
  'cmd',
  'com',
  'pif',
  'scr',
  'vbs',
  'js',
  'jar',
  'sh',
  'app',
  'deb',
  'rpm',
  'dmg',
  'pkg',
  'msi',
  'dll',
  'so',
  'dylib',
];

// validateExtensionMimeMatch
const validateExtensionMimeMatch = (filename: string, mimeType: string): boolean => {
  const extension = path.extname(filename).toLowerCase().slice(1);

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return false;
  }

  const allowedMimes = EXTENSION_MIME_MAP[extension];
  if (!allowedMimes) {
    return false;
  }

  return allowedMimes.includes(mimeType);
};

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
};

// detectSuspiciousPatterns
const detectSuspiciousPatterns = (filename: string): boolean => {
  const suspiciousPatterns = [
    /\.\./,
    /[<>:"|?*]/, // Invalid characters
    /\.{2,}/, // Multiple dots
    /^\.+$/, // Only dots
    /\0/, // Null bytes
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(filename));
};

// fileFilter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  try {
    // Sanitize
    file.originalname = sanitizeFilename(file.originalname);

    // Check suspicious patterns
    if (detectSuspiciousPatterns(file.originalname)) {
      return cb(new Error('Invalid filename: contains suspicious patterns'));
    }

    // Check MIME type
    if (!ALL_ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      return cb(
        new Error(
          `File type not allowed: ${file.mimetype}. Supported: PNG, JPG, GIF, WebP, SVG, ICO, PDF, DOC, TXT, CSV`
        )
      );
    }

    // Validate extension matches MIME
    if (!validateExtensionMimeMatch(file.originalname, file.mimetype)) {
      return cb(
        new Error(`File extension doesn't match file type. Please ensure valid ${file.mimetype}`)
      );
    }

    cb(null, true);
  } catch (error) {
    cb(new Error('File validation failed'));
  }
};

// fileUploadHandler
export const fileUploadHandler = (
  options: {
    maxSizeMB?: number;
    maxFiles?: number;
    fileTypes?: 'images' | 'documents' | 'all';
  } = {}
) => {
  const { maxSizeMB = 10, maxFiles = 10, fileTypes = 'all' } = options;

  const customFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (fileTypes === 'images' && !ALLOWED_MIME_TYPES.images.includes(file.mimetype as any)) {
      return cb(new Error('Only image files are allowed'));
    }

    if (fileTypes === 'documents' && !ALLOWED_MIME_TYPES.documents.includes(file.mimetype as any)) {
      return cb(new Error('Only document files are allowed'));
    }

    return fileFilter(req, file, cb);
  };

  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
      files: maxFiles,
      fields: 20,
      fieldNameSize: 100,
      fieldSize: 1024 * 1024,
    },
    fileFilter: customFileFilter,
  });
};



// Document upload
export const documentUploadHandler = (maxSizeMB: number = 20, maxFiles: number = 3) => {
  return fileUploadHandler({
    maxSizeMB,
    maxFiles,
    fileTypes: 'documents',
  });
};

// Single file upload
export const singleFileUpload = (fieldName: string, maxSizeMB: number = 100) => {
  return fileUploadHandler({ maxSizeMB, maxFiles: 1 }).single(fieldName);
};

// Multiple files upload
export const multipleFilesUpload = (
  fieldName: string,
  maxCount: number = 10,
  maxSizeMB: number = 100
) => {
  return fileUploadHandler({ maxSizeMB, maxFiles: maxCount }).array(fieldName, maxCount);
};

// Fields upload
export const fieldsUpload = (
  fields: { name: string; maxCount: number }[],
  maxSizeMB: number = 10
) => {
  return fileUploadHandler({ maxSizeMB }).fields(fields);
};

export default fileUploadHandler;
