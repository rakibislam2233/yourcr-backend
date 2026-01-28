import { database } from '../../config/database.config';
import { ICreateAccountPayload } from './user.interface';

const createAccount = async (payload: ICreateAccountPayload) => {
  const user = await database.user.create({
    data: payload,
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
        take: 1,
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
};
