import { RequestLeaveModal } from '@/components/requestLeaveFormModal';
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
      const { classNumber, schoolID, reason } =
        RequestLeaveModal.processSubmission(interaction);

      await interaction.reply({
        content: `**Form Submitted Successfully!**\n\n**Class Number:** ${classNumber}\n**Favorite Name:** ${schoolID}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error('Error processing modal submission:', error);

      await interaction.reply({
        content:
          '❌ There was an error processing your submission. Please try again.',
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
