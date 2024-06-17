import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').setDMPermission(false),
  defer: true,

  execute: async (_client, interaction) => {
    await interaction.editReply(`Pong!`);
    return true;
  }
};

export default command;
