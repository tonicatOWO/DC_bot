import { z } from 'zod';

export const studentSchema = z
  .object({
    schoolID: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Student ID must be exactly 6 digits')
      .refine((val) => val !== '000000', {
        message: 'Student ID cannot be all zeros',
      }),
    reason: z
      .string()
      .optional()
      .transform((val) => val || 'Not specified'),
    startTime: z.date(),
    endTime: z.date(),
  })
  .refine((data) => data.endTime >= data.startTime, {
    message: 'End time must be the same or later than start time',
    path: ['endTime'],
  })
  .refine(
    (data) => {
      const now = new Date();
      return data.startTime >= now;
    },
    {
      message: 'Start time cannot be in the past',
      path: ['startTime'],
    }
  )
  .refine(
    (data) => {
      const now = new Date();
      return data.endTime >= now;
    },
    {
      message: 'End time cannot be in the past',
      path: ['endTime'],
    }
  );

export type StudentData = z.infer<typeof studentSchema>;

export interface ValidationError {
  field: string;
  message: string;
}
