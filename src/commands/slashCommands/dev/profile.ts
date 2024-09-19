import { AttachmentBuilder, InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { Image } from '../../../utils/image';
import { Command } from '../../../@types/command';
import { CommandTypes } from '../../../@types/enums';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('profile command')
    .setContexts(InteractionContextType.Guild)
    .addUserOption(option => option.setName('user').setDescription('user').setRequired(false)),
  defer: true,
  devOnly: true,
  execute: async (client, interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;
    const member = await interaction.guild?.members
      .fetch({
        user,
        withPresences: true
      })
      .catch(() => null);
    if (!member) {
      interaction.editReply({ content: 'User not found!' });
      return false;
    }

    const profile = await Image.getProfile(member);
    const attachment = new AttachmentBuilder(profile, {
      name: `profile-${member.id}.png`
    });

    await interaction.editReply({ files: [attachment] });

    return true;
  }
};

export default command;
export { command };
