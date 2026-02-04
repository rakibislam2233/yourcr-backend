import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { UserValidations } from './user.validation';
import { UserController } from './user.controller';

const router = Router();

// Get all users (admin only)
router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), UserController.getAllUsers);

// Get user by ID
router.get('/:id', auth(), UserController.getUserById);

// Get user profile with current session info
router.get('/profile/me', auth(), UserController.getUserProfile);

// Create student (CR only)
router.post(
  '/create-student',
  auth(UserRole.CR),
  validateRequest(UserValidations.createStudent),
  UserController.createStudent
);

// Update user
router.patch('/:id', auth(), UserController.updateUser);

// Delete user
router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), UserController.deleteUser);

export const UserRoutes = router;
