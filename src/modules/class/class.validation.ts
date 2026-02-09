import { z } from 'zod';
import parseAmPmToDate from '../../utils/time';
const timeAmPmSchema = z.string('Time is required').refine(
  val => {
    // 12-hour format with optional leading zero, space before AM/PM optional
    return /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i.test(val);
  },
  {
    message: 'Invalid time format. Use HH:MM AM/PM (e.g. 09:30 AM, 3:45 PM, 12:00 PM)',
  }
);

const createClassValidation = z.object({
  body: z
    .object({
      subjectId: z.string().optional(),
      teacherId: z.string().optional(),

      classDate: z.string('ClassDate is required').refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid date format (use YYYY-MM-DD or valid ISO date)',
      }),

      startTime: timeAmPmSchema,
      endTime: timeAmPmSchema,

      classType: z.enum(['ONLINE', 'OFFLINE']).optional(),
      status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),

      roomNumber: z.string().optional(),
      joinLink: z.string().url({ message: 'Invalid join link URL' }).optional(),
    })
    .refine(
      data => {
        if (!data.startTime || !data.endTime) return true;
        const start = parseAmPmToDate(data.startTime, new Date(data.classDate));
        const end = parseAmPmToDate(data.endTime, new Date(data.classDate));
        return end > start;
      },
      {
        message: 'End time must be after start time',
        path: ['endTime'],
      }
    )
    .refine(
      data => {
        if (!data.classDate || !data.startTime) return true;
        const classStart = parseAmPmToDate(data.startTime, new Date(data.classDate));
        const now = new Date();
        // Allow 5 mins buffer for server lag
        return classStart.getTime() > now.getTime() - 5 * 60 * 1000;
      },
      {
        message: 'Class start time cannot be in the past',
        path: ['startTime'],
      }
    ),
});

const updateClassValidation = z.object({
  body: z.object({
    subjectId: z.string().optional(),
    teacherId: z.string().optional(),
    classDate: z.string().optional(),
    startTime: timeAmPmSchema.optional(),
    endTime: timeAmPmSchema.optional(),
    classType: z.enum(['ONLINE', 'OFFLINE']).optional(),
    status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    roomNumber: z.string().optional(),
    joinLink: z.string().url({ message: 'Invalid join link URL' }).optional(),
  }),
});

export const ClassValidations = {
  createClass: createClassValidation,
  updateClass: updateClassValidation,
};
