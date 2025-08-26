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
      content: 'You need administrator permissions to use this command',
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
        content: 'Unable to retrieve member information',
        ephemeral: true,
      });
    }
    const hasRole = roleNames.some((roleName) =>
      member.roles.cache.some(
        (role) => role.name === roleName || role.id === roleName
      )
    );

    if (!hasRole) {
      return interaction.reply({
        content: `You need one of the following roles: ${roleNames.join(', ')}`,
        ephemeral: true,
      });
    }

    await next();
  };
}
