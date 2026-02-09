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
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      password: true,
      isEmailVerified: true,
      institution: true,
      currentBatch: true,
      status: true,
      role: true,
      isCr: true,
      institutionId: true,
      currentBatchId: true,
      isDeleted: true,
      createdAt: true,
    },
  });
};

const getUserByEmail = async (email: string) => {
  return await database.user.findFirst({
    where: { email, isDeleted: false },
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
      isEmailVerified: true,
      crId: data.crId,
      currentBatchId: data.currentBatchId,
      isRegistrationComplete: true,
      role: 'STUDENT',
    },
  });
};

const getAllStudents = async (filters: any, options: any) => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  // Build where clause from filters
  const where: any = { isDeleted: false, role: 'STUDENT' };

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.batchId) {
    where.currentBatchId = filters.batchId;
  }

  // Enum filters
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.crId) {
    where.crId = filters.crId;
  }

  // Boolean filter
  if (filters.isEmailVerified !== undefined) {
    where.isEmailVerified = filters.isEmailVerified === 'true' || filters.isEmailVerified === true;
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
        institution: true,
        currentBatch: true,
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
  const users = await database.user.findMany({
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
  return users;
};

export const UserRepository = {
  createAccount,
  getUserByEmail,
  isEmailExists,
  getUserById,
  setUserEmailVerified,
  getUsersByInstitutionAndRole,
  getAllStudents,
  updateUserById,
  getAllUsersForAdmin,
  createStudentAccount,
  deleteUserById,
  getStudentsByCrId,
};
