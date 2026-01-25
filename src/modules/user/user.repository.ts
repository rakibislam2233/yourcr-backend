import { prisma } from '../../config/database.config';
import { ICreateUser } from './user.interface';

const createUser = async (payload: ICreateUser) => {
  const user = await prisma.user.create({
    data: payload,
  });
  return user;
};

const getUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const isEmailExists = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!user;
};

export const UserRepository = {
  createUser,
  getUserByEmail,
  isEmailExists,
};
