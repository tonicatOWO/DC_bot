import { parse } from 'csv-parse';
import { prisma } from '../database/prisma';
import { csvType } from '../../types/csvType';

export const csvWriter = async (fileContent: string): Promise<void> => {
  try {
    const records = await new Promise<csvType[]>((resolve, reject) => {
      parse(
        fileContent,
        {
          delimiter: ',',
          columns: true,
          skip_empty_lines: true,
        },
        (error, result: csvType[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Process records with better error handling
    for (const row of records) {
      try {
        await prisma.member.create({
          data: {
            name: row.name,
            email: row.email,
            class: row.class,
            schoolId: row.schoolId,
            discordId: row.discordId || null,
          },
        });
        console.log(`Member ${row.name} added successfully.`);
      } catch (err) {
        console.error(`Error adding member ${row.name}:`, err);
      }
    }
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw error;
  }
};
