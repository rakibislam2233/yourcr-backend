import { UserRole } from '../../prisma/generated/enums';

export const getAuthStatus = (user: any) => {
  if (!user.isEmailVerified) {
    return {
      message: 'Email not verified. Please verify your email.',
      status: { isEmailVerified: false },
    };
  }

  // Student-specific flow: Check registration and approval
  if (user.role === UserRole.STUDENT && !user.currentBatchId) {
    if (!user.isRegistrationComplete) {
      return {
        message: 'Please complete your CR registration details.',
        status: { isRegistrationComplete: false },
      };
    }

    if (!user.crApprovedAt) {
      return {
        message: 'CR registration is pending approval. Please wait for admin approval.',
        status: { isRegistrationComplete: true, isCrApproved: false },
      };
    }
  }

  // CR-specific flow: Check approval
  if (user.role === UserRole.CR && !user.crApprovedAt) {
    return {
      message: 'CR registration submitted. Awaiting admin approval.',
      status: { isCrApproved: false },
    };
  }

  return null;
};
