import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateAccountPayload, ICreateStudentPayload } from './user.interface';

const createAccount = async (payload: ICreateAccountPayload) => {
  const user = await database.user.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: payload.password,
      role: payload.role,
    },
  });
  return user;
};

export const getUserById = async (id: string) => {
  return await database.user.findFirst({
    where: { id, isDeleted: false },
  });
};

const getUserByEmail = async (email: string) => {
  return await database.user.findFirst({
    where: { email, isDeleted: false },
  });
};

const findUserByEmailWithLatestCr = async (email: string) => {
  return await database.user.findUnique({
    where: { email },
    include: {
      crRegistrations: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

const updateUserById = async (id: string, data: any) => {
  return await database.user.update({
    where: { id },
    data,
  });
};

const getAllUsersForAdmin = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  // Build where clause from filters
  const where: any = { isDeleted: false };

  // String filters (case-insensitive contains)
  if (filters.fullName) {
    where.fullName = { contains: filters.fullName, mode: 'insensitive' };
  }
  if (filters.email) {
    where.email = { contains: filters.email, mode: 'insensitive' };
  }
  if (filters.phoneNumber) {
    where.phoneNumber = { contains: filters.phoneNumber, mode: 'insensitive' };
  }

  // Enum filters
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.role) {
    where.role = filters.role;
  }

  // Boolean filter
  if (filters.isEmailVerified !== undefined) {
    where.isEmailVerified = filters.isEmailVerified === 'true' || filters.isEmailVerified === true;
  }

  // Global search
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    database.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        isEmailVerified: true,
        status: true,
        role: true,
        createdAt: true,
      },
      skip,
      take,
      orderBy,
    }),
    database.user.count({ where }),
  ]);

  return createPaginationResult(users, total, pagination);
};

const getUserByIdForResponse = async (id: string) => {
  return await database.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      isEmailVerified: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      isDeleted: true,
    },
  });
};

const getUserProfileById = async (id: string) => {
  return await database.user.findUnique({
    where: { id },
    include: {
      institution: true,
    },
  });
};

const createStudentAccount = async (
  data: ICreateStudentPayload & { currentBatchId?: string; institutionId?: string }
) => {
  return await database.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      institutionId: data.institutionId,
      crId: data.crId,
      currentBatchId: data.currentBatchId,
      isRegistrationComplete: true, // Mark as ready since they are added by a CR
      role: 'STUDENT',
    },
  });
};

const deleteUserById = async (id: string) => {
  return await database.user.update({
    where: { id },
    data: { isDeleted: true, status: 'DELETED' },
  });
};

const isEmailExists = async (email: string) => {
  const user = await database.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
};

const setUserEmailVerified = async (email: string) => {
  return await database.user.update({
    where: { email },
    data: { isEmailVerified: true },
  });
};

const getUsersByInstitutionAndRole = async (institutionId: string, role: string) => {
  return await database.user.findMany({
    where: {
      institutionId,
      role: role as any,
      status: 'ACTIVE',
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
    },
  });
};

const getStudentsByCrId = async (crId: string) => {
  return await database.user.findMany({
    where: {
      crId,
      role: 'STUDENT',
      status: 'ACTIVE',
      isDeleted: false,
    },
    select: {
      id: true,
      email: true,
    },
  });
};

export const UserRepository = {
  createAccount,
  getUserByEmail,
  isEmailExists,
  getUserById,
  findUserByEmailWithLatestCr,
  setUserEmailVerified,
  getUsersByInstitutionAndRole,
  getStudentsByCrId,
  updateUserById,
  getAllUsersForAdmin,
  getUserByIdForResponse,
  getUserProfileById,
  createStudentAccount,
  deleteUserById,
};
