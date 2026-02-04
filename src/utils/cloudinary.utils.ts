import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
  filename?: string
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: filename || undefined,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result?.secure_url || '',
            public_id: result?.public_id || '',
          });
        }
      }
    );

    stream.pipe(uploadStream);
  });
};

// Upload image to Cloudinary
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  folder: string = 'yourcr/images'
): Promise<{ url: string; public_id: string }> => {
  return await uploadBufferToCloudinary(buffer, folder);
};

// Upload document to Cloudinary
export const uploadDocumentToCloudinary = async (
  buffer: Buffer,
  folder: string = 'yourcr/documents'
): Promise<{ url: string; public_id: string }> => {
  return await uploadBufferToCloudinary(buffer, folder);
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (
  buffer: Buffer,
  userId: string
): Promise<{ url: string; public_id: string }> => {
  const folder = 'yourcr/profiles';
  const filename = `profile_${userId}`;
  return await uploadBufferToCloudinary(buffer, folder, filename);
};

// Upload CR document proof
export const uploadCRDocumentProof = async (
  buffer: Buffer,
  userId: string
): Promise<{ url: string; public_id: string }> => {
  const folder = 'yourcr/cr-documents';
  const filename = `cr_proof_${userId}_${Date.now()}`;
  return await uploadBufferToCloudinary(buffer, folder, filename);
};

// Upload institution logo
export const uploadInstitutionLogo = async (
  buffer: Buffer,
  institutionId: string
): Promise<{ url: string; public_id: string }> => {
  const folder = 'yourcr/institutions';
  const filename = `logo_${institutionId}`;
  return await uploadBufferToCloudinary(buffer, folder, filename);
};

export default cloudinary;
