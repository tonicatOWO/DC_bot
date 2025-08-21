import { parse } from 'csv-parse';
import { prisma } from '../database/prisma';

export const csvWriter = (fileContent: string) => {
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
      result.forEach((row) => {
        prisma.member
          .create({
            data: {
              name: row.name,
              email: row.email,
              discordId: row.discordId,
              schoolID: row.schoolID,
            },
          })
          .then(() => {
            console.log(`Member ${row.name} added successfully.`);
          })
          .catch((err) => {
            console.error(`Error adding member ${row.name}:`, err);
          });
      });
    }
  );
};
