import { z } from 'zod';

export interface ValidationError {
  type?: string;
  row?: number;
  field?: string;
  message: string;
}

export class CSVValidationError extends Error {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('CSV validation failed');
    this.name = 'CSVValidationError';
    this.errors = errors;
  }
}

export const csvSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  class: z.string().min(1, 'Class is required'),
  schoolId: z.string().min(1, 'Student ID is required'),
  discordId: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{17,19}$/.test(val), {
      message: 'Invalid Discord ID format (should be 17-19 digits)',
    })
    .transform((val) => val || undefined),
});

export type CsvRow = z.infer<typeof csvSchema>;

export interface ValidationResult {
  success: boolean;
  data?: CsvRow[];
  errors?: ValidationError[];
}
