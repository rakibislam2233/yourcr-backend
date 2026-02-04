import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { uploadFile } from '../../utils/storage.utils';
import { ICreateStudentPayload, IUserProfileResponse } from './user.interface';
import { UserRepository } from './user.repository';

const getAllUsers = async () => {
  return await UserRepository.getAllUsersForAdmin();
};

const getUserById = async (id: string) => {
  const user = await UserRepository.getUserByIdForResponse(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

const getUserProfile = async (userId: string): Promise<IUserProfileResponse> => {
  const user = await UserRepository.getUserProfileById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    isCr: user.isCr,
    academicInfo: user.institutionId
      ? {
          institutionId: user.institutionId,
          department: user.department || '',
          program: user.program || '',
          year: user.year || '',
          rollNumber: user.rollNumber || '',
          studentId: user.studentId || undefined,
          semester: user.semester || undefined,
          batch: user.batch || undefined,
        }
      : undefined,
  };
};

const updateMyProfile = async (
  userId: string,
  payload: {
    fullName?: string;
    phoneNumber?: string;
    bio?: string;
    dateOfBirth?: string;
  },
  file?: Express.Multer.File
) => {
  const existingUser = await UserRepository.getUserById(userId);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  let profileImage: string | undefined;
  if (file) {
    const uploadResult = await uploadFile(
      file.buffer,
      'yourcr/profile-images',
      `profile_${userId}_${Date.now()}`
    );
    profileImage = uploadResult.secure_url;
  }

  const updated = await UserRepository.updateUserById(userId, {
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
    bio: payload.bio,
    dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : undefined,
    profileImage,
  });

  return updated;
};

const createStudent = async (crId: string, studentData: ICreateStudentPayload) => {
  const defaultPassword = 'Student@123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const cr = await UserRepository.getUserById(crId);

  if (!cr || !cr.isCr) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only CR can create students');
  }

  const existingUser = await UserRepository.getUserByEmail(studentData.email);
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists');
  }

  const student = await UserRepository.createStudentAccount({
    fullName: studentData.fullName,
    email: studentData.email,
    phoneNumber: studentData.phoneNumber,
    password: hashedPassword,
    institutionId: studentData.institutionId,
    department: studentData.department,
    program: studentData.program,
    year: studentData.year,
    rollNumber: studentData.rollNumber,
    studentId: studentData.studentId,
    semester: studentData.semester,
    batch: studentData.batch,
    crId,
  });

  const { password, ...studentWithoutPassword } = student;

  return {
    ...studentWithoutPassword,
    defaultPassword,
  };
};

const updateUserById = async (id: string, payload: any) => {
  const existingUser = await UserRepository.getUserById(id);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const { email, password, ...allowedUpdates } = payload;

  return await UserRepository.updateUserById(id, allowedUpdates);
};

const deleteUserById = async (id: string) => {
  const existingUser = await UserRepository.getUserById(id);
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  await UserRepository.deleteUserById(id);
};

export const UserService = {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateMyProfile,
  createStudent,
  updateUserById,
  deleteUserById,
};
