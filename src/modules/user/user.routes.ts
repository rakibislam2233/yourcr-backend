import { Router } from 'express';
import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { UserValidations } from './user.validation';
import { UserController } from './user.controller';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import upload from '../../utils/fileUpload.utils';

const router = Router();

// Get all users (Admin only)
router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), UserController.getAllUsers);

// Get user by ID
router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserController.getUserById
);

// Get user profile
router
  .route('/profile/me')
  .get(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    UserController.getUserProfile
  )
  .patch(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    validateRequest(UserValidations.updateMyProfile),
    UserController.updateMyProfile
  )
  .delete(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    UserController.deleteMyProfile
  );

// Create student (CR only)
router.post('/create-student', auth(UserRole.CR), validateRequest(UserValidations.createStudent));

// Update user
router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserController.updateUser
);

// Delete user (Admin only)
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), UserController.deleteUser);

export const UserRoutes = router;
