import { database } from '../../config/database.config';
import { ICreateCRPayload } from './user.interface';

const createCR = async (payload: ICreateCRPayload) => {
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

const isEmailExists = async (email: string) => {
  const user = await database.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
};

export const UserRepository = {
  createCR,
  getUserByEmail,
  isEmailExists,
};
