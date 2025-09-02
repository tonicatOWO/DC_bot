import { studentSchema, ValidationError } from '@/types/leaveTypes';
import { prisma } from '../database/prisma';

/**
 * Creates a leave application request in the database.
 * Handles validation, member lookup, and creation with robust error handling
 * for transaction issues when using FerretDB.
 */
export const addRequestLeave = async (
  schoolID: string,
  reason: string | undefined,
  startTime: Date,
  endTime: Date
) => {
  try {
    // Validate input data
    const validatedData = studentSchema.parse({
      schoolID,
      reason,
      startTime,
      endTime,
    });

    // Find member data
    const member = await prisma.member.findUnique({
      where: { schoolID: validatedData.schoolID },
    });

    if (!member) {
      throw new Error('nodata');
    }

    // Check if the student already has a leave request (since schoolID is primary key, only one record per student)
    const existingRequest = await prisma.leaveApplicationForm.findUnique({
      where: { schoolID: validatedData.schoolID },
    });

    if (existingRequest) {
      console.log(
        `[INFO] Leave request already exists for ${member.name}, updating...`
      );

      // Update existing record
      try {
        const updatedRequest = await prisma.leaveApplicationForm.update({
          where: { schoolID: validatedData.schoolID },
          data: {
            name: member.name,
            discordID: member.discordID || null,
            leaveReason: validatedData.reason,
            startDate: validatedData.startTime,
            endDate: validatedData.endTime,
          },
        });
        console.log(`[SUCCESS] Leave request updated for ${member.name}`);
        return updatedRequest;
      } catch (updateErr: any) {
        // Handle update transaction errors
        if (
          updateErr.code === 'P2010' &&
          updateErr.message?.includes('commitTransaction')
        ) {
          // Wait and check if update was actually completed
          await new Promise((resolve) => setTimeout(resolve, 200));
          const updatedMember = await prisma.leaveApplicationForm.findUnique({
            where: { schoolID: validatedData.schoolID },
          });
          if (
            updatedMember &&
            updatedMember.startDate.getTime() ===
              validatedData.startTime.getTime()
          ) {
            console.log(
              `[SUCCESS] Leave request for ${member.name} was actually updated despite transaction error.`
            );
            return updatedMember;
          } else {
            throw updateErr;
          }
        } else {
          throw updateErr;
        }
      }
    }

    // Create new leave request
    try {
      const leaveRequest = await prisma.leaveApplicationForm.create({
        data: {
          schoolID: validatedData.schoolID,
          name: member.name,
          discordID: member.discordID || null,
          leaveReason: validatedData.reason,
          startDate: validatedData.startTime,
          endDate: validatedData.endTime,
        },
      });
      console.log(
        `[SUCCESS] Leave request created for ${member.name} (${schoolID})`
      );
      return leaveRequest;
    } catch (createErr: any) {
      // Handle create transaction errors (FerretDB compatibility)
      if (
        createErr.code === 'P2010' &&
        createErr.message?.includes('commitTransaction')
      ) {
        console.log(
          `[WARNING] Transaction error detected, verifying creation...`
        );

        // Wait and check if creation was actually completed
        await new Promise((resolve) => setTimeout(resolve, 200));
        const createdRequest = await prisma.leaveApplicationForm.findUnique({
          where: { schoolID: validatedData.schoolID },
        });

        if (createdRequest) {
          console.log(
            `[SUCCESS] Leave request for ${member.name} was actually created despite transaction error.`
          );
          return createdRequest;
        } else {
          console.error(
            `[ERROR] Leave request creation failed for ${member.name}`
          );
          throw createErr;
        }
      } else if (createErr.code === 'P2002') {
        // Handle duplicate key error
        console.log(
          `[INFO] Duplicate leave request detected for ${member.name}, fetching existing record...`
        );
        const existingRequest = await prisma.leaveApplicationForm.findUnique({
          where: { schoolID: validatedData.schoolID },
        });

        if (existingRequest) {
          console.log(
            `[INFO] Returning existing leave request for ${member.name}`
          );
          return existingRequest;
        } else {
          throw createErr;
        }
      } else {
        throw createErr;
      }
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && 'issues' in error) {
      const validationErrors: ValidationError[] = (error as any).issues.map(
        (issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })
      );
      throw new Error(
        `Validation failed: ${validationErrors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
      );
    }

    // Handle specific business logic errors
    if (error instanceof Error && error.message === 'nodata') {
      console.error(`[ERROR] Member not found: ${schoolID}`);
      throw error;
    }

    // Log unexpected errors
    console.error(`[ERROR] Unexpected error in addRequestLeave:`, error);
    throw error;
  }
};
