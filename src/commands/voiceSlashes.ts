import { Discord, Slash, SlashOption, Guard, GuardFunction } from 'discordx';
import {
  ChannelType,
  ApplicationCommandOptionType,
  GuildChannel,
  CommandInteraction,
} from 'discord.js';
import { joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import { voiceChannelGuard } from '../guards/index.js';

@Discord()
export class VoiceCommands {
  private connections = new Map<string, VoiceConnection>();

  @Slash({
    name: 'join',
    description: 'Join voice channel',
  })
  @Guard(voiceChannelGuard)
  async joinVoice(
    @SlashOption({
      name: 'channel',
      description: 'The voice channel to join',
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildVoice],
    })
    channel: GuildChannel,
    interaction: CommandInteraction
  ): Promise<void> {
    const guild = interaction.guild!;

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      this.connections.set(guild.id, connection);

      await interaction.reply(`Joined voice channel **${channel.name}**`);
    } catch (error) {
      console.error('Voice channel join error:', error);
      await interaction.reply({
        content: 'An error occurred while joining the voice channel',
        ephemeral: true,
      });
    }
  }

  @Slash({
    name: 'leave',
    description: 'Leave voice channel',
  })
  @Guard(voiceChannelGuard)
  async leaveVoice(interaction: CommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const connection = this.connections.get(guild.id);

    if (!connection) {
      await interaction.reply({
        content: 'Bot is not currently in a voice channel',
        ephemeral: true,
      });
      return;
    }

    connection.destroy();
    this.connections.delete(guild.id);

    await interaction.reply('Left voice channel');
  }

  @Slash({
    name: 'voice-status',
    description: 'Check bot voice channel status',
  })
  async voiceStatus(interaction: CommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const connection = this.connections.get(guild.id);

    if (!connection) {
      await interaction.reply('Not connected to any voice channel');
      return;
    }

    await interaction.reply('Bot is currently connected to a voice channel');
  }
}
