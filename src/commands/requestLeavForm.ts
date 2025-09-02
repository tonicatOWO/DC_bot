import { RequestLeaveModal } from '@/components/requestLeaveFormModal';
import { addRequestLeave } from '@/lib/services/leaveService';
import {
  CommandInteraction,
  MessageFlags,
  ModalSubmitInteraction,
} from 'discord.js';
import { Discord, Slash, ModalComponent } from 'discordx';

@Discord()
class RequestLeaveForm {
  @Slash({
    name: 'request-leave',
    description: 'Open request leave form modal',
  })
  showModal(interaction: CommandInteraction): void {
    const modal = RequestLeaveModal.create();
    interaction.showModal(modal);
  }

  @ModalComponent({ id: 'requestLeaveForm' })
  async handleRequestLeaveForm(
    interaction: ModalSubmitInteraction
  ): Promise<void> {
    try {
      const { schoolID, reason, startTime, endTime } =
        RequestLeaveModal.processSubmission(interaction);

      const requestLeave = await addRequestLeave(
        schoolID,
        reason,
        startTime,
        endTime
      );

      console.log(requestLeave);

      await interaction.reply({
        content: `Leave request submitted successfully!\nStudent ID: ${schoolID}\nReason: ${reason}`,
      });
    } catch (error) {
      console.error('Error processing modal submission:', error);

      let errorMessage =
        'An error occurred while submitting leave request. Please try again later.';

      if (error instanceof Error) {
        if (error.message === 'nodata') {
          errorMessage =
            'Member data not found for this student ID. Please verify the student ID is correct.';
        } else if (error.message.includes('Validation failed')) {
          errorMessage =
            'Validation failed. Please check if the input format is correct.';
        }
      }

      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
