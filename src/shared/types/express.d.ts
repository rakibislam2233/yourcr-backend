import { IDecodedToken } from '../helpers/jwtHelper';

declare global {
  namespace Express {
    interface Request {
      user?: IDecodedToken; 
    }
  }
}

export {};
