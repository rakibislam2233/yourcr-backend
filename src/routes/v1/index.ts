import { AuthRoutes } from '../../modules/auth/auth.routes';
import { UserRoutes } from '../../modules/user/user.routes';
import { CRRegistrationRoutes } from '../../modules/crRegistration/crRegistration.routes';
import { TeacherRoutes } from '../../modules/teacher/teacher.routes';
import { SubjectRoutes } from '../../modules/subject/subject.routes';
import { RoutineRoutes } from '../../modules/routine/routine.routes';
import { NoticeRoutes } from '../../modules/notice/notice.routes';
import { AssessmentRoutes } from '../../modules/assessment/assessment.routes';
import { IssueRoutes } from '../../modules/issue/issue.routes';
import { NotificationRoutes } from '../../modules/notification/notification.routes';
import { AuditLogRoutes } from '../../modules/auditLog/auditLog.routes';
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
  },
  {
    path: '/routines',
    route: RoutineRoutes,
  },
  {
    path: '/notices',
    route: NoticeRoutes,
  },
  {
    path: '/assessments',
    route: AssessmentRoutes,
  },
  {
    path: '/issues',
    route: IssueRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/audit-logs',
    route: AuditLogRoutes,
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
