import { prisma } from '../database/prisma';
import { CsvRow } from './csvValidator';

/**
 * Imports member data from validated CSV rows into the database.
 * Handles creation and updating of members, with robust error handling
 * for transaction issues and duplicate entries.
 *
 * @param validatedData - Array of validated CSV rows to import
 * @returns Array of successfully imported CSV rows
 * @throws Error if all records fail to import
 *
 * PS: The following code is written to fucking handle errors for compatibility with FerretDB (Fully open-source alternative to MongoDB).
 * I don't know why I'm torturing myself like this 💀
 */

export const importMembersFromCSV = async (
  validatedData: CsvRow[]
): Promise<CsvRow[]> => {
  const successfulImports: CsvRow[] = [];
  const failedImports: Array<{ data: CsvRow; error: any }> = [];

  for (const row of validatedData) {
    try {
      // Check if member already exists (FerretDB supports findUnique)
      const existingMember = await prisma.member.findUnique({
        where: { schoolID: row.schoolID },
      });

      if (existingMember) {
        // Update existing member (FerretDB supports update)
        try {
          await prisma.member.update({
            where: { schoolID: row.schoolID },
            data: {
              name: row.name,
              class: row.class,
              email: row.email,
              discordID: row.discordID || null,
            },
          });
          successfulImports.push(row);
          console.log(`[SUCCESS] Member ${row.name} updated successfully.`);
        } catch (updateErr: any) {
          // Handle update transaction errors
          if (
            updateErr.code === 'P2010' &&
            updateErr.message?.includes('commitTransaction')
          ) {
            // Wait and check if update was actually completed
            await new Promise((resolve) => setTimeout(resolve, 200));

            const updatedMember = await prisma.member.findUnique({
              where: { schoolID: row.schoolID },
            });

            if (updatedMember && updatedMember.name === row.name) {
              successfulImports.push(row);
              console.log(
                `[SUCCESS] Member ${row.name} was actually updated despite transaction error.`
              );
            } else {
              throw updateErr;
            }
          } else {
            throw updateErr;
          }
        }
      } else {
        // Create new member (FerretDB supports create)
        try {
          await prisma.member.create({
            data: {
              schoolID: row.schoolID,
              name: row.name,
              class: row.class,
              email: row.email,
              discordID: row.discordID || null,
            },
          });
          successfulImports.push(row);
          console.log(`[SUCCESS] Member ${row.name} created successfully.`);
        } catch (createErr: any) {
          // Handle create transaction errors
          if (
            createErr.code === 'P2010' &&
            createErr.message?.includes('commitTransaction')
          ) {
            // Wait and check if creation was actually completed
            await new Promise((resolve) => setTimeout(resolve, 200));

            const createdMember = await prisma.member.findUnique({
              where: { schoolID: row.schoolID },
            });

            if (createdMember) {
              successfulImports.push(row);
              console.log(
                `[SUCCESS] Member ${row.name} was actually created despite transaction error.`
              );
            } else {
              throw createErr;
            }
          } else if (createErr.code === 'P2002') {
            // Handle duplicate key error (member created between find and create)
            console.log(
              `[INFO] Member ${row.name} was created by another process, updating instead...`
            );
            try {
              await prisma.member.update({
                where: { schoolID: row.schoolID },
                data: {
                  name: row.name,
                  class: row.class,
                  email: row.email,
                  discordID: row.discordID || null,
                },
              });
              successfulImports.push(row);
              console.log(
                `[SUCCESS] Member ${row.name} updated after duplicate key error.`
              );
            } catch (retryErr) {
              throw retryErr;
            }
          } else {
            throw createErr;
          }
        }
      }
    } catch (err: any) {
      failedImports.push({ data: row, error: err });
      console.error(
        `[ERROR] Error processing member ${row.name}:`,
        err.message || err
      );
    }
  }

  console.log(
    `[STATS] Import completed: ${successfulImports.length} successful, ${failedImports.length} failed`
  );

  // Only throw error if all records failed
  if (failedImports.length > 0 && successfulImports.length === 0) {
    const errorDetails = failedImports
      .map((f) => `${f.data.name}: ${f.error.message || 'Unknown error'}`)
      .slice(0, 3)
      .join('; ');
    throw new Error(
      `All ${failedImports.length} records failed to import. First 3 errors: ${errorDetails}`
    );
  }

  // Log detailed failure report for partial failures
  if (failedImports.length > 0) {
    console.log(`[WARNING] ${failedImports.length} records failed to import:`);
    failedImports.forEach((f) => {
      console.log(
        `  - ${f.data.name} (${f.data.schoolID}): ${f.error.message || 'Unknown error'}`
      );
    });
  }

  return successfulImports;
};
