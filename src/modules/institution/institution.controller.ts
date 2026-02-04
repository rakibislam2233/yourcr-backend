import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InstitutionService } from './institution.service';
import { uploadFile } from '../../utils/storage.utils';

// Create institution (Admin only)
const createInstitution = catchAsync(async (req: Request, res: Response) => {
  const institutionData = req.body;

  // Handle logo upload if file is provided
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'yourcr/institutions', `logo_${Date.now()}`);
    institutionData.logo = uploadResult.secure_url;
  }

  const institution = await InstitutionService.createInstitution(institutionData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Institution created successfully',
    data: institution,
  });
});

// Get institution by ID
const getInstitutionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const institutionId = Array.isArray(id) ? id[0] : id;

  const institution = await InstitutionService.getInstitutionById(institutionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Institution fetched successfully',
    data: institution,
  });
});

// Get all institutions
const getAllInstitutions = catchAsync(async (req: Request, res: Response) => {
  const institutions = await InstitutionService.getAllInstitutions();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All institutions fetched successfully',
    data: institutions,
  });
});

// Update institution (Admin only)
const updateInstitution = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const institutionId = Array.isArray(id) ? id[0] : id;
  const updateData = req.body;

  const institution = await InstitutionService.updateInstitution(institutionId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Institution updated successfully',
    data: institution,
  });
});

// Delete institution (Admin only)
const deleteInstitution = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const institutionId = Array.isArray(id) ? id[0] : id;

  await InstitutionService.deleteInstitution(institutionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Institution deleted successfully',
  });
});

export const InstitutionController = {
  createInstitution,
  getInstitutionById,
  getAllInstitutions,
  updateInstitution,
  deleteInstitution,
};