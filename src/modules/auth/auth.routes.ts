import { Router } from 'express';
import validateRequest from '../../middleware/validation.middleware';

import { auth } from '../../middleware/auth.middleware';
import { AuthController } from './auth.controller';

const router = Router();

// Register user
router.post('/register', validateRequest(AuthValidation.register), AuthController.register);

// Login user
router.post('/login', validateRequest(AuthValidation.login), AuthController.login);

// Refresh token
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshToken),
  AuthController.refreshToken
);

// Logout user
router.post('/logout', auth(), AuthController.logout);

// Get profile
router.get('/profile', auth(), AuthController.getProfile);

// Update profile
router.patch(
  '/profile',
  auth(),
  validateRequest(AuthValidation.updateProfile),
  AuthController.updateProfile
);

export const AuthRoutes = router;
