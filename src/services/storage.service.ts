import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export class StorageService {
  // Upload file to Cloudinary
  static async uploadFile(
    buffer: Buffer,
    folder: string = 'uploads',
    fileName?: string
  ): Promise<any> {
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
      throw new Error('File upload failed');
    }
  }

  // Delete file from Cloudinary
  static async deleteFile(publicId: string): Promise<any> {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error('File deletion failed');
    }
  }

  // Get file URL
  static getFileUrl(publicId: string, format?: string): string {
    return cloudinary.url(publicId, {
      format: format || 'auto',
      secure: true,
    });
  }
}