import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  ModalActionRowComponentBuilder,
} from 'discord.js';

export class RequestLeaveModal {
  private static readonly LEAVEFORM_ID = 'requestLeaveForm';
  private static readonly SCHOOL_ID_FIELD = 'schoolIDField';
  private static readonly REASON_FIELD = 'reasonField';
  private static readonly START_TIME_FIELD = 'startTimeField';
  private static readonly END_TIME_FIELD = 'endTimeField';

  static create(): ModalBuilder {
    const modal = new ModalBuilder()
      .setTitle('Request Leave Form')
      .setCustomId(this.LEAVEFORM_ID);

    const schoolIDComponent = new TextInputBuilder()
      .setCustomId(this.SCHOOL_ID_FIELD)
      .setLabel('Write down your school ID')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(20);

    const reason = new TextInputBuilder()
      .setCustomId(this.REASON_FIELD)
      .setLabel('Reason for Leave')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(1000)
      .setPlaceholder(
        'Please provide detailed reason for your leave request...'
      );

    const startTime = new TextInputBuilder()
      .setCustomId(this.START_TIME_FIELD)
      .setLabel('Start Time (YYYY-MM-DD HH:mm)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('2025-09-02 09:00');

    const endTime = new TextInputBuilder()
      .setCustomId(this.END_TIME_FIELD)
      .setLabel('End Time (YYYY-MM-DD HH:mm)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('2025-09-02 17:00');

    const schoolIDRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        schoolIDComponent
      );
    const reasonRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        reason
      );
    const startTimeRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        startTime
      );
    const endTimeRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        endTime
      );

    modal.addComponents(schoolIDRow, reasonRow, startTimeRow, endTimeRow);
    return modal;
  }

  static processSubmission(interaction: ModalSubmitInteraction) {
    try {
      const schoolID = interaction.fields.getTextInputValue(
        this.SCHOOL_ID_FIELD
      );
      const reason = interaction.fields.getTextInputValue(this.REASON_FIELD);
      const startTimeStr = interaction.fields.getTextInputValue(
        this.START_TIME_FIELD
      );
      const endTimeStr = interaction.fields.getTextInputValue(
        this.END_TIME_FIELD
      );

      if (
        !schoolID.trim() ||
        !reason.trim() ||
        !startTimeStr.trim() ||
        !endTimeStr.trim()
      ) {
        throw new Error(
          'School ID, reason, start time and end time are required'
        );
      }

      const startTime = new Date(startTimeStr);
      const endTime = new Date(endTimeStr);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error(
          'Invalid date format. Please use format: YYYY-MM-DD HH:mm'
        );
      }

      return {
        schoolID: schoolID.trim(),
        reason: reason.trim(),
        startTime,
        endTime,
      };
    } catch (error) {
      console.error('Error processing modal submission:', error);
      throw error;
    }
  }
}
