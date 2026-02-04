import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CRRegistrationService } from './crRegistration.service';
import ApiError from '../../utils/ApiError';
import { uploadFile } from '../../utils/storage.utils';

const completeCRRegistration = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  // Handle file upload
  let documentProofUrl = '';
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'yourcr/cr-documents', `cr_proof_${userId}_${Date.now()}`);
    documentProofUrl = uploadResult.secure_url;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Document proof is required');
  }

  // Merge file URL with request body
  const registrationData = {
    ...req.body,
    documentProof: documentProofUrl,
  };

  const result = await CRRegistrationService.completeCRRegistration(userId, registrationData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CR registration completed successfully. Awaiting admin approval.',
    data: result,
  });
});


const getAllCRRegistrations = catchAsync(async (req: Request, res: Response) => {
  // Only admin can view all registrations
  const { role } = req.user;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await CRRegistrationService.getAllCRRegistrations();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CR registrations retrieved successfully',
    data: result,
  });
});

const approveCRRegistration = catchAsync(async (req: Request, res: Response) => {
  // Only admin can approve
  const { role, userId } = req.user;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const registrationId = Array.isArray(req.params.registrationId)
    ? req.params.registrationId[0]
    : req.params.registrationId;
  const result = await CRRegistrationService.approveCRRegistration(registrationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CR registration approved successfully',
    data: result,
  });
});

const rejectCRRegistration = catchAsync(async (req: Request, res: Response) => {
  // Only admin can reject
  const { role } = req.user;
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }
  const registrationId = Array.isArray(req.params.registrationId)
    ? req.params.registrationId[0]
    : req.params.registrationId;
  const { reason } = req.body;
  const result = await CRRegistrationService.rejectCRRegistration(registrationId, reason);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CR registration rejected successfully',
    data: result,
  });
});

export const CRRegistrationController = {
  completeCRRegistration,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};
