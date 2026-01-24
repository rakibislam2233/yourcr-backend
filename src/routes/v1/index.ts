import { AuthRoutes } from '../../modules/auth/auth.routes';
import { UserRoutes } from '../../modules/user/user.routes';
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
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
