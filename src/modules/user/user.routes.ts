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
import { FileUploadMiddleware } from '../../utils/fileUpload.utils';

const router = Router();

// Get all users (Admin only)
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.getAllUsers
);

// Get user by ID
router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserController.getUserById
);

// Get user profile
router.get(
  '/profile/me',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserController.getUserProfile
);

// Update user profile with image upload
router.patch(
  '/profile/me',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  FileUploadMiddleware.profileImage,
  catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Handle profile image upload if file is provided
    if (req.file) {
      // Upload to Cloudinary and update profile image URL
      // This would require implementing uploadProfileImage function
      // For now, we'll skip the file upload part
    }

    const user = await UserController.updateUser(
      { params: { id: userId }, body: updateData } as Request,
      res
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  })
);

// Create student (CR only)
router.post(
  '/create-student',
  auth(UserRole.CR),
  validateRequest(UserValidations.createStudent),
  catchAsync(async (req: Request, res: Response) => {
    const crId = req.user?.id;
    const studentData = req.body;

    if (!crId) {
      throw new Error('CR not authenticated');
    }

    const student = await UserController.createStudent(crId, studentData);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  })
);

// Update user
router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserController.updateUser
);

// Delete user (Admin only)
router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  UserController.deleteUser
);

export const UserRoutes = router;
