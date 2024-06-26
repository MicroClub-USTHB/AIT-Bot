import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { MessageCommandBuilder } from '../../base/messageCommandBuilder';

const command: Command = {
  type: CommandTypes.MessageCommand,
  data: new MessageCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  execute: async (client, message) => {
    const now = Date.now();
    const msg = await message.reply('Pong!').catch(err => null);
    if (!msg) return false;

    const ping = msg.createdTimestamp - now;

    await msg.edit(`Pong!\n\`\`\`Discord API: ${client.ws.ping}ms\nLatency: ${ping}ms\`\`\``).catch(err => null);

    return true;
  }
};

export default command;
