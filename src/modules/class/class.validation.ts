import { z } from 'zod';
import parseAmPmToDate, { parseDateInBD, getBangladeshTime } from '../../utils/time';

const timeAmPmSchema = z.string('Time is required').refine(
  val => {
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

      classDate: z.string('ClassDate is required').refine(
        val => {
          try {
            const date = parseDateInBD(val);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        },
        {
          message: 'Invalid date format (use YYYY-MM-DD or valid ISO date)',
        }
      ),

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

        try {
          const baseDate = parseDateInBD(data.classDate);
          const start = parseAmPmToDate(data.startTime, baseDate);
          const end = parseAmPmToDate(data.endTime, baseDate);

          return end > start;
        } catch {
          return false;
        }
      },
      {
        message: 'End time must be after start time',
        path: ['endTime'],
      }
    )
    .refine(
      data => {
        try {
          const baseDate = parseDateInBD(data.classDate);
          const classStart = parseAmPmToDate(data.startTime, baseDate);
          const now = getBangladeshTime();
          const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

          return classStart >= thirtyMinutesAgo;
        } catch {
          return false;
        }
      },
      {
        message: 'Class can only be created up to 30 minutes before the start time',
        path: ['startTime'],
      }
    ),
});

const updateClassValidation = z.object({
  body: z
    .object({
      subjectId: z.string().optional(),
      teacherId: z.string().optional(),

      classDate: z
        .string()
        .optional()
        .refine(
          val => {
            if (!val) return true;
            try {
              const date = parseDateInBD(val);
              return !isNaN(date.getTime());
            } catch {
              return false;
            }
          },
          {
            message: 'Invalid date format',
          }
        ),

      startTime: timeAmPmSchema.optional(),
      endTime: timeAmPmSchema.optional(),
      classType: z.enum(['ONLINE', 'OFFLINE']).optional(),
      status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
      roomNumber: z.string().optional(),
      joinLink: z.string().url({ message: 'Invalid join link URL' }).optional(),
    })
    .refine(
      data => {
        if (!data.startTime || !data.endTime || !data.classDate) return true;

        try {
          const baseDate = parseDateInBD(data.classDate);
          const start = parseAmPmToDate(data.startTime, baseDate);
          const end = parseAmPmToDate(data.endTime, baseDate);

          return end > start;
        } catch {
          return false;
        }
      },
      {
        message: 'End time must be after start time',
        path: ['endTime'],
      }
    ),
});

export const ClassValidations = {
  createClass: createClassValidation,
  updateClass: updateClassValidation,
};
