import { parse } from 'csv-parse/sync';
import {
  ValidationResult,
  ValidationError,
  CsvRow,
  csvSchema,
} from '@/types/csvType';

export const validateCsv = (
  fileContent: string,
  fileName?: string
): ValidationResult => {
  if (fileName && !fileName.toLowerCase().endsWith('.csv')) {
    return {
      success: false,
      errors: [{ message: 'File must have .csv extension' }],
    };
  }

  if (!fileContent.trim()) {
    return {
      success: false,
      errors: [{ message: 'File content is empty' }],
    };
  }

  if (fileContent.includes('\u0000')) {
    return {
      success: false,
      errors: [{ message: 'Binary file detected, CSV text file required' }],
    };
  }

  let records: any[];

  try {
    records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      trim: true,
    });
  } catch (error) {
    return {
      success: false,
      errors: [{ message: 'Invalid CSV format' }],
    };
  }

  if (records.length === 0) {
    return {
      success: false,
      errors: [{ message: 'CSV file contains no data' }],
    };
  }

  const errors: ValidationError[] = [];
  const validRows: CsvRow[] = [];

  for (let i = 0; i < records.length; i++) {
    const result = csvSchema.safeParse(records[i]);

    if (result.success) {
      validRows.push(result.data);
    } else {
      result.error.issues.forEach((issue) => {
        errors.push({
          type: 'validation',
          row: i + 2,
          field: issue.path.join('.'),
          message: issue.message,
        });
      });
    }
  }

  const seen = new Set<string>();
  validRows.forEach((row, index) => {
    const key = `${row.name}-${row.email}-${row.schoolID}`;
    if (seen.has(key)) {
      errors.push({
        type: 'duplicate',
        row: index + 2,
        message: 'Duplicate entry detected',
      });
    } else {
      seen.add(key);
    }
  });

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: validRows,
  };
};

export type { CsvRow, ValidationResult, ValidationError };
