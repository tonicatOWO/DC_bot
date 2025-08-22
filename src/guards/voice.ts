import { GuardFunction } from 'discordx';
import { CommandInteraction, GuildMember } from 'discord.js';

export const voiceChannelGuard: GuardFunction<CommandInteraction> = async (
  interaction,
  client,
  next
) => {
  if (!interaction.guild) {
    return interaction.reply({
      content: '❌ 此指令只能在伺服器中使用',
      ephemeral: true,
    });
  }

  const member = interaction.member as GuildMember;
  if (!member?.voice.channel) {
    return interaction.reply({
      content: '❌ 你必須在語音頻道中才能使用此指令',
      ephemeral: true,
    });
  }

  await next();
};
