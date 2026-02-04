import { AuthRoutes } from '../../modules/auth/auth.routes';
import { UserRoutes } from '../../modules/user/user.routes';
import { CRRegistrationRoutes } from '../../modules/crRegistration/crRegistration.routes';
import { TeacherRoutes } from '../../modules/teacher/teacher.routes';
import { SubjectRoutes } from '../../modules/subject/subject.routes';
import express from 'express';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/cr-registration',
    route: CRRegistrationRoutes,
  },
  {
    path: '/teachers',
    route: TeacherRoutes,
  },
  {
    path: '/subjects',
    route: SubjectRoutes,
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
