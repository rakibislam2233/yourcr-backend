import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import { AuditAction } from '../../shared/enum/audit.enum';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { sendStudentCreatedEmail } from '../../utils/emailTemplates';
import { uploadFile } from '../../utils/storage.utils';
import { ICreateStudentPayload } from './user.interface';
import { UserRepository } from './user.repository';
import { InstitutionRepository } from '../institution/institution.repository';

const getAllUsers = async (filters: any, options: any) => {
  return await UserRepository.getAllUsersForAdmin(filters, options);
};

const getUserById = async (id: string) => {
  const user = await UserRepository.getUserById(id);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
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

const createStudent = async (crId: string, studentData: ICreateStudentPayload) => {
  const defaultPassword = studentData.studentId ? studentData.studentId : 'Student@123';
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
    institutionId: cr.institutionId! || studentData.institutionId,
    crId: crId,
    currentBatchId: cr.currentBatchId! || studentData.batchId,
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

  //institution name
  const institution = await InstitutionRepository.getInstitutionById(cr.institutionId!);

  await sendStudentCreatedEmail(
    student.email,
    student.fullName,
    cr.fullName,
    institution?.name!,
    defaultPassword
  );

  const { password, ...studentWithoutPassword } = student;

  return {
    ...studentWithoutPassword,
    defaultPassword,
  };
};

const getAllStudents = async (filters: any, options: any) => {
  return await UserRepository.getAllStudents(filters, options);
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
  updateMyProfile,
  createStudent,
  getAllStudents,
  updateUserById,
  deleteUserById,
  deleteMyProfile,
};
