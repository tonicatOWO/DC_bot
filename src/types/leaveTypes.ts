import { z } from 'zod';

export const studentSchema = z.object({
  schoolID: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Student ID must be exactly 6 digits')
    .refine((val) => val !== '000000', {
      message: 'Student ID cannot be all zeros',
    }),

  class: z
    .string()
    .trim()
    .regex(/^\d{3}$/, 'Class must be exactly 3 digits')
    .refine(
      (val) => {
        const classNumber = parseInt(val);
        return classNumber >= 100 && classNumber <= 999;
      },
      {
        message: 'Class must be between 100 and 999',
      }
    ),

  reason: z
    .string()
    .optional()
    .transform((val) => val || 'Not specified'),
});

export type StudentData = z.infer<typeof studentSchema>;

export interface ValidationError {
  field: string;
  message: string;
}
