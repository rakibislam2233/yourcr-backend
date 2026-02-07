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
        const start = parseAmPmToDate(data.startTime, new Date());
        const end = parseAmPmToDate(data.endTime, new Date());
        return end > start;
      },
      {
        message: 'End time must be after start time',
        path: ['endTime'],
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
