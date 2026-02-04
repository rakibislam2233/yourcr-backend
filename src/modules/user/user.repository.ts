import { database } from '../../config/database.config';
import { ICreateAccountPayload } from './user.interface';
import { createPaginationResult, PaginationResult, parsePaginationOptions, createPaginationQuery } from '../../utils/pagination.utils';

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
  // Use pagination utility for automatic defaults
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

const createStudentAccount = async (data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  institutionId: string;
  department: string;
  program: string;
  year: string;
  rollNumber: string;
  studentId?: string;
  semester?: string;
  batch?: string;
  crId: string;
}) => {
  return await database.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      institutionId: data.institutionId,
      department: data.department,
      program: data.program,
      year: data.year,
      rollNumber: data.rollNumber,
      studentId: data.studentId,
      semester: data.semester,
      batch: data.batch,
      crId: data.crId,
      role: 'STUDENT',
    },
  });
};

const deleteUserById = async (id: string) => {
  return await database.user.delete({
    where: { id },
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

export const UserRepository = {
  createAccount,
  getUserByEmail,
  isEmailExists,
  getUserById,
  findUserByEmailWithLatestCr,
  setUserEmailVerified,
  updateUserById,
  getAllUsersForAdmin,
  getUserByIdForResponse,
  getUserProfileById,
  createStudentAccount,
  deleteUserById,
};
