import { z } from 'zod';
import parseAmPmToDate, { getBangladeshTime, parseDateInBD } from '../../utils/time';

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
      subjectId: z.string('Subject is required'),
      teacherId: z.string('Teacher is required'),
      classDate: z.string('ClassDate is required').refine(
        val => {
          try {
            const date = parseDateInBD(val);
            if (isNaN(date.getTime())) return false;

            const now = getBangladeshTime();
            // Reset both to midnight for simple date comparison
            const inputDate = new Date(date).setHours(0, 0, 0, 0);
            const currentDate = new Date(now).setHours(0, 0, 0, 0);

            return inputDate >= currentDate;
          } catch {
            return false;
          }
        },
        {
          message: 'Date cannot be in the past',
        }
      ),
      startTime: timeAmPmSchema,
      endTime: timeAmPmSchema,
      classType: z.enum(['ONLINE', 'OFFLINE']),
      status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
      platform: z.enum(['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER']).optional(),
      roomNumber: z.string('Room number is required').optional(),
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
              if (isNaN(date.getTime())) return false;

              const now = getBangladeshTime();
              // Reset both to midnight for simple date comparison
              const inputDate = new Date(date).setHours(0, 0, 0, 0);
              const currentDate = new Date(now).setHours(0, 0, 0, 0);

              return inputDate >= currentDate;
            } catch {
              return false;
            }
          },
          {
            message: 'Date cannot be in the past',
          }
        ),

      startTime: timeAmPmSchema.optional(),
      endTime: timeAmPmSchema.optional(),
      classType: z.enum(['ONLINE', 'OFFLINE']).optional(),
      status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
      platform: z.enum(['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER']).optional(),
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
