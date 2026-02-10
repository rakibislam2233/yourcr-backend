import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { UserController } from './user.controller';
import { UserValidations } from './user.validation';
import upload from '../../utils/fileUpload.utils';

const router = Router();

//update institution and batch
router.patch(
  '/update-institution-and-batch',
  auth(UserRole.CR),
  upload.single('logo'),
  validateRequest(UserValidations.updateInstitutionAndBatch),
  UserController.updateInstitutionAndBatch
);

// Create student (CR only)
router.post(
  '/create-student',
  auth(UserRole.CR),
  validateRequest(UserValidations.createStudent),
  UserController.createStudent
);

router.get('/all-students', auth(UserRole.CR), UserController.getAllStudents);

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

// Get all users (Admin only)
router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), UserController.getAllUsers);

// Get user by ID
router
  .route('/:id')
  .get(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    UserController.getUserById
  )
  .patch(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    UserController.updateUser
  )
  .delete(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    UserController.deleteUser
  );

export const UserRoutes = router;
