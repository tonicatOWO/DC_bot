import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
} from 'discord.js';

export class RequestLeaveModal {
  private static readonly CUSTOM_ID = 'requestLeaveForm';
  private static readonly CLASS_NUMBER_FIELD = 'classNumberField';
  private static readonly SchoolID_FIELD = 'haikuField';

  static create(): ModalBuilder {
    const modal = new ModalBuilder()
      .setTitle('Request Leave Form')
      .setCustomId(this.CUSTOM_ID);

    const classNumberComponent = new TextInputBuilder()
      .setCustomId(this.CLASS_NUMBER_FIELD)
      .setLabel('Class Number')
      .setStyle(TextInputStyle.Short);

    const schoolIDComponent = new TextInputBuilder()
      .setCustomId(this.SchoolID_FIELD)
      .setLabel('Write down your school ID')
      .setStyle(TextInputStyle.Short);

    const reason = new TextInputBuilder()
      .setCustomId('reasonField')
      .setLabel('Reason for Leave')
      .setStyle(TextInputStyle.Paragraph);

    const classRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      classNumberComponent
    );
    const schoolIDRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      schoolIDComponent
    );
    const reasonRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      reason
    );
    modal.addComponents(classRow, schoolIDRow, reasonRow);
    return modal;
  }

  static processSubmission(interaction: ModalSubmitInteraction) {
    const classNumber = interaction.fields.getTextInputValue(
      this.CLASS_NUMBER_FIELD
    );
    const schoolID = interaction.fields.getTextInputValue(this.SchoolID_FIELD);
    const reason = interaction.fields.getTextInputValue('reasonField');
    return { classNumber, schoolID, reason };
  }
}
