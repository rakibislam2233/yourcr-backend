import { Router } from 'express';
import { UserController } from './user.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();

// Get all users (admin only)
router.get('/', auth('admin'), UserController.getAllUsers);

// Get user by ID
router.get('/:id', auth(), UserController.getUserById);

// Update user
router.patch('/:id', auth(), UserController.updateUser);

// Delete user
router.delete('/:id', auth('admin'), UserController.deleteUser);

export const UserRoutes = router;
