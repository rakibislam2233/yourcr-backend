import { ICreateAccountPayload } from './user.interface';
import { UserRepository } from './user.repository';

const createCR = async (payload: ICreateAccountPayload) => {
  const user = await UserRepository.createAccount(payload);
  return user;
};
