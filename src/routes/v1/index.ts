import { Router } from 'express';
import { AssessmentRoutes } from '../../modules/assessment/assessment.routes';
import { AssessmentSubmissionRoutes } from '../../modules/assessmentSubmission/assessmentSubmission.routes';
import { AuditLogRoutes } from '../../modules/auditLog/auditLog.routes';
import { AuthRoutes } from '../../modules/auth/auth.routes';
import { BatchRoutes } from '../../modules/batch/batch.routes';
import { BatchEnrollmentRoutes } from '../../modules/batchEnrollment/batchEnrollment.routes';
import { ClassRoutes } from '../../modules/class/class.routes';
import { CRRegistrationRoutes } from '../../modules/crRegistration/crRegistration.routes';
import { InstitutionRoutes } from '../../modules/institution/institution.routes';
import { IssueRoutes } from '../../modules/issue/issue.routes';
import { NoticeRoutes } from '../../modules/notice/notice.routes';
import { NotificationRoutes } from '../../modules/notification/notification.routes';
import { RoutineRoutes } from '../../modules/routine/routine.routes';
import { SubjectRoutes } from '../../modules/subject/subject.routes';
import { TeacherRoutes } from '../../modules/teacher/teacher.routes';
import { UserRoutes } from '../../modules/user/user.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'YourCR API is running',
    timestamp: new Date().toISOString(),
  });
});

// Module routes
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
    path: '/institutions',
    route: InstitutionRoutes,
  },
  {
    path: '/cr-registrations',
    route: CRRegistrationRoutes,
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
  },
  {
    path: '/classes',
    route: ClassRoutes,
  },
  {
    path: '/assessment-submissions',
    route: AssessmentSubmissionRoutes,
  },
  {
    path: '/batches',
    route: BatchRoutes,
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
    path: '/batch-enrollments',
    route: BatchEnrollmentRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
