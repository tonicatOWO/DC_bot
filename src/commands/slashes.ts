import type { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';

@Discord()
export class SlashCommands {
  @Slash({ description: 'ping' })
  async ping(interaction: CommandInteraction): Promise<void> {
    await interaction.reply('pong!');
  }

  @Slash({ description: 'request_leave' })
  async requestLeave(interaction: CommandInteraction): Promise<void> {
    await interaction.reply('Leave request received!');
  }
}
