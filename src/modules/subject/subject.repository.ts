import { database } from '../../config/database.config';
import { ICreateSubjectPayload, IUpdateSubjectPayload } from './subject.interface';

const createSubject = async (payload: ICreateSubjectPayload) => {
  return await database.subject.create({
    data: payload,
  });
};

const getSubjectById = async (id: string) => {
  return await database.subject.findUnique({
    where: { id },
    include: {
      teacher: true,
    },
  });
};

const getAllSubjects = async () => {
  return await database.subject.findMany({
    where: { isDeleted: false },
    include: {
      teacher: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const updateSubject = async (id: string, payload: IUpdateSubjectPayload) => {
  return await database.subject.update({
    where: { id },
    data: payload,
  });
};

const deleteSubject = async (id: string) => {
  return await database.subject.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const SubjectRepository = {
  createSubject,
  getSubjectById,
  getAllSubjects,
  updateSubject,
  deleteSubject,
};
