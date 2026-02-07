import { StatusCodes } from 'http-status-codes';
import ApiError from './ApiError';

const parseAmPmToDate = (timeStr: string, baseDate: Date): Date => {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid time format: ${timeStr}: Use HH:MM AM/PM (e.g. 09:30 AM, 3:45 PM, 12:00 PM)`
    );
  }

  const [, hourStr, minStr, period] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  if (hour === 12) {
    hour = period.toUpperCase() === 'AM' ? 0 : 12;
  } else if (period.toUpperCase() === 'PM') {
    hour += 12;
  }

  const result = new Date(baseDate);
  result.setHours(hour, minute, 0, 0);

  return result;
};

export default parseAmPmToDate;
