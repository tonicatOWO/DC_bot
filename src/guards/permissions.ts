import { GuardFunction } from 'discordx';
import {
  CommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';

export const adminGuard: GuardFunction<CommandInteraction> = async (
  interaction,
  client,
  next
) => {
  const member = interaction.member as GuildMember;

  if (!member?.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: '❌ 你需要管理員權限才能使用此指令',
      ephemeral: true,
    });
  }

  await next();
};

export function hasRoleGuard(
  ...roleNames: string[]
): GuardFunction<CommandInteraction> {
  return async (interaction, client, next) => {
    const member = interaction.member as GuildMember;

    if (!member) {
      return interaction.reply({
        content: '❌ 無法取得成員資訊',
        ephemeral: true,
      });
    }

    const hasRole = roleNames.some((roleName) =>
      member.roles.cache.some((role) => role.name === roleName)
    );

    if (!hasRole) {
      return interaction.reply({
        content: `❌ 你需要以下其中一個身分組: ${roleNames.join(', ')}`,
        ephemeral: true,
      });
    }

    await next();
  };
}
