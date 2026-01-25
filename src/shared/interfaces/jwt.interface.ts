import jwt from 'jsonwebtoken';
interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
  type: TokenType;
}

interface IDecodedToken extends jwt.JwtPayload {
  userId: string;
  email: string;
  role: string;
  type: TokenType;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'reset-password',
}

export { ITokenPayload, IDecodedToken };
