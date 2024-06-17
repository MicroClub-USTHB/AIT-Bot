import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { MessageCommandBuilder } from '../../base/messageCommandBuilder';

const command: Command = {
  type: CommandTypes.MessageCommand,
  data: new MessageCommandBuilder().setName('setup').setDescription("Setup the bot's registration system"),
  execute: async (_client, message) => {
    await message.delete();

    const button = new ButtonBuilder()
      .setCustomId('register-button')
      .setStyle(ButtonStyle.Primary)
      .setEmoji(`🔒`)
      .setLabel('Register');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    await message.reply({
      content: 'Click the button to register',
      components: [row]
    });

    return true;
  }
};

export default command;
