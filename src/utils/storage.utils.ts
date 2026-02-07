import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary.config';
import ApiError from './ApiError';

// Upload file to Cloudinary
export const uploadFile = async (
  buffer: Buffer,
  folder: string = 'uploads',
  fileName?: string
): Promise<any> => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            public_id: fileName,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });
    return result;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'File upload failed');
  }
};

// Delete file from Cloudinary
export const deleteFile = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'File deletion failed');
  }
};

// Get file URL
export const getFileUrl = (publicId: string, format?: string): string => {
  return cloudinary.url(publicId, {
    format: format || 'auto',
    secure: true,
  });
};

// Video compression utility
export const compressVideo = async (
  buffer: Buffer,
  folder: string = 'videos',
  quality: 'auto' | 'low' | 'medium' | 'high' = 'medium'
): Promise<any> => {
  try {
    const transformation: any = {
      folder,
      resource_type: 'video',
    };

    // Apply quality transformation
    if (quality !== 'auto') {
      transformation.quality = quality;
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(transformation, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });
    return result;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Video compression failed');
  }
};

// Image optimization utility
export const optimizeImage = async (
  buffer: Buffer,
  folder: string = 'images',
  width?: number,
  height?: number
): Promise<any> => {
  try {
    const transformation: any = {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    // Apply dimensions if provided
    if (width || height) {
      transformation.width = width;
      transformation.height = height;
      transformation.crop = 'fill';
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(transformation, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });
    return result;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Image optimization failed');
  }
};

// Sharp image processing utility
export const processImageWithSharp = async (
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    resize?: boolean;
  }
): Promise<Buffer> => {
  const sharp = (await import('sharp')).default;

  let processor = sharp(buffer);

  if (options.resize && options.width && options.height) {
    processor = processor.resize(options.width, options.height, {
      fit: 'cover',
      position: 'center',
    });
  }

  if (options.format) {
    processor = processor.toFormat(options.format);
  }

  if (options.quality) {
    processor = processor.jpeg({ quality: options.quality });
  }

  return await processor.toBuffer();
};
