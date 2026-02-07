import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import { AuditAction } from '../../shared/enum/audit.enum';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { sendStudentCreatedEmail } from '../../utils/emailTemplates';
import { uploadFile } from '../../utils/storage.utils';
import { ICreateStudentPayload, IUserProfileResponse } from './user.interface';
import { UserRepository } from './user.repository';

const getAllUsers = async (filters: any, options: any) => {
  return await UserRepository.getAllUsersForAdmin({ ...filters, ...options });
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
  file?: Express.Multer.File,
  req?: Request
) => {
  await createAuditLog(userId, AuditAction.UPDATE_PROFILE, 'User', userId, { payload }, req);

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

const createStudent = async (crId: string, studentData: ICreateStudentPayload, req?: Request) => {
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
    institutionId: cr.institutionId ?? undefined,
    crId,
    currentBatchId: cr.currentBatchId ?? undefined,
  });

  // Create batch enrollment
  if (cr.currentBatchId) {
    await database.batchEnrollment.create({
      data: {
        batchId: cr.currentBatchId,
        userId: student.id,
        role: 'STUDENT',
        studentId: studentData.studentId || student.fullName,
        enrolledBy: crId,
      },
    });
  }

  // Send welcome email to student
  const institutionName = cr.institutionId
    ? (await database.institution.findUnique({ where: { id: cr.institutionId } }))?.name ||
      'Your Institution'
    : 'Your Institution';

  await sendStudentCreatedEmail(student.email, student.fullName, cr.fullName, institutionName);

  // Audit log
  await createAuditLog(
    crId,
    AuditAction.USER_REGISTERED,
    'User',
    student.id,
    { studentEmail: student.email, batchId: cr.currentBatchId },
    req
  );

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

const deleteMyProfile = async (userId: string) => {
  await UserRepository.deleteUserById(userId);
};

export const UserService = {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateMyProfile,
  createStudent,
  updateUserById,
  deleteUserById,
  deleteMyProfile,
};
