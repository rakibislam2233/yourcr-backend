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
  return await database.user.findUnique({
    where: { id },
  });
};

const getUserByEmail = async (email: string) => {
  return await database.user.findUnique({
    where: { email },
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

const getAllUsersForAdmin = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  // Build where clause from filters
  const where: any = {};

  // String filters (case-insensitive contains)
  if (query.fullName) {
    where.fullName = { contains: query.fullName, mode: 'insensitive' };
  }
  if (query.email) {
    where.email = { contains: query.email, mode: 'insensitive' };
  }
  if (query.phoneNumber) {
    where.phoneNumber = { contains: query.phoneNumber, mode: 'insensitive' };
  }

  // Enum filters
  if (query.status) {
    where.status = query.status;
  }
  if (query.role) {
    where.role = query.role;
  }

  // Boolean filter
  if (query.isEmailVerified !== undefined) {
    where.isEmailVerified = query.isEmailVerified === 'true' || query.isEmailVerified === true;
  }

  // Global search
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { phoneNumber: { contains: query.search, mode: 'insensitive' } },
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
    data: { status: 'DELETED' },
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
