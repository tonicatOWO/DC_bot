import { parse } from 'csv-parse';
import { prisma } from '../database/prisma';
import fs from 'fs';

const csvFilePath = '';
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

parse(
  fileContent,
  {
    delimiter: ',',
    columns: true,
    skip_empty_lines: true,
  },
  (error, result: any[]) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log('CSV數據:', result);
    result.forEach((row) => {
      console.log(`姓名: ${row.name}, email: ${row['e-mail']}`);
    });
  }
);
