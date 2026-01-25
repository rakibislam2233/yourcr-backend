import { ICreateCRPayload } from './user.interface';
import { UserRepository } from './user.repository';

const createCR = async (payload: ICreateCRPayload) => {
  const user = await UserRepository.createCR(payload);
  return user;
};
