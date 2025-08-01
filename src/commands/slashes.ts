import {
  ApplicationCommandOptionType,
  Attachment,
  ChatInputCommandInteraction,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';

@Discord()
export class SlashCommands {
  @Slash({ description: 'ping' })
  async ping(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('pong!');
  }

  @Slash({
    name: 'request-leave-btn-gen',
    description: 'Generate leave request button',
  })
  async requestLeaveBtnGen(
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    await interaction.reply('Leave request received!');
  }

  @Slash({ name: 'add-member-data', description: 'upload csv file' })
  async addMemberData(
    @SlashOption({
      name: 'file',
      description: 'add member data file',
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    file: Attachment,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {}
}
