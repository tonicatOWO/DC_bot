import {
  ApplicationCommandOptionType,
  Attachment,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Discord, Guard, Slash, SlashOption } from 'discordx';
import { validateCsv } from '@services/csvValidator';
import { importMembersFromCSV } from '@services/csvService';
import { adminGuard, hasRoleGuard } from '@/guards';

@Discord()
export class SlashCommands {
  @Slash({ description: 'ping' })
  async ping(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('pong!');
  }

  @Slash({
    name: 'add-member-data',
    description: 'Upload CSV file to add member data',
  })
  @Guard(
    ...(process.env.ADMIN_ROLE_ID
      ? [hasRoleGuard(process.env.ADMIN_ROLE_ID)]
      : [adminGuard])
  )
  async addMemberData(
    @SlashOption({
      name: 'file',
      description: 'CSV file containing member data',
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    file: Attachment,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.deferReply();

    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const fileContent = await response.text();

      const validationResult = validateCsv(fileContent);

      if (!validationResult.success) {
        const errorMessages = validationResult
          .errors!.map((err) => {
            if (err.row && err.field) {
              return `- Row ${err.row}, ${err.field}: ${err.message}`;
            }
            return `- ${err.message}`;
          })
          .slice(0, 10)
          .join('\n');

        const truncatedMessage =
          validationResult.errors!.length > 10
            ? `\n... and ${validationResult.errors!.length - 10} more errors`
            : '';

        await interaction.editReply({
          content:
            `[ERROR] CSV Validation Failed\n` +
            `\`\`\`\n${errorMessages}${truncatedMessage}\n\`\`\``,
        });
        return;
      }

      await interaction.editReply(
        '[SUCCESS] File validated successfully\n[INFO] Importing data to database...'
      );

      const validatedData = await importMembersFromCSV(
        validationResult.data || []
      );

      await interaction.editReply({
        content:
          `[SUCCESS] Member Data Import Completed Successfully!\n\n` +
          `File: ${file.name}\n` +
          `Records Processed: ${validationResult.data!.length}\n` +
          `Successfully Saved: ${validatedData.length} records\n` +
          `Uploaded by: ${interaction.user.tag}\n` +
          `Completed at: <t:${Math.floor(Date.now() / 1000)}:F>`,
      });
    } catch (error: any) {
      console.error('[ERROR] add-member-data command error:', {
        error: error.message || error,
        file: file.name,
        user: interaction.user.tag,
        timestamp: new Date().toISOString(),
      });

      await interaction.editReply({
        content:
          `[ERROR] Error Processing File\n\n` +
          `File: ${file.name}\n` +
          `Error: ${error.message || 'An unexpected error occurred during processing'}\n\n` +
          `Please check your file format and try again. If the problem persists, contact an administrator.`,
      });
    }
  }
}
