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
    super(`CSV validation failed with ${errors.length} error(s)`);
    this.name = 'CSVValidationError';
    this.errors = errors;
  }
}

export const csvSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').toLowerCase(),
  class: z.string().min(1, 'Class is required').trim(),
  schoolID: z.string().min(1, 'Student ID is required').trim(),
  discordID: z
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
