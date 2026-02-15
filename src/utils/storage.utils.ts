import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary.config';
import ApiError from './ApiError';

export const uploadFile = async (
  buffer: Buffer,
  folder: string = 'uploads',
  fileName?: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
  mimeType?: string
): Promise<any> => {
  try {
    // Convert buffer to base64
    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimeType || 'application/octet-stream'};base64,${base64}`;

    // Determine resource type
    let finalResourceType: 'image' | 'video' | 'raw' = 'raw';

    if (mimeType === 'application/pdf') {
      finalResourceType = 'raw'; 
    } else if (mimeType?.startsWith('image/')) {
      finalResourceType = 'image';
    } else if (mimeType?.startsWith('video/')) {
      finalResourceType = 'video';
    }

    const uploadOptions: any = {
      folder,
      resource_type: finalResourceType,
      type: 'upload',
      access_mode: 'public',
    };

    if (fileName) {
      uploadOptions.public_id = fileName;
    }

    // For PDFs, set format
    if (mimeType === 'application/pdf') {
      uploadOptions.format = 'pdf';
    }

    console.log('🚀 Uploading file with options:', {
      folder,
      fileName,
      mimeType,
      resourceType: uploadOptions.resource_type,
    });

    // Upload using base64
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    console.log('✅ Upload successful:', {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    });

    return result;
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', {
      message: error.message,
      error: error.error,
      http_code: error.http_code,
    });
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'File upload failed: ' + error.message);
  }
};

// Delete file from Cloudinary
export const deleteFile = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'raw'
): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
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
