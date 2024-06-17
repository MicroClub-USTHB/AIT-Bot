import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { PicoCTF } from '../../utils/picoctf';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('picoctf')
    .setDescription('Check out the picoCTF website')
    .addSubcommand(subcommand => subcommand.setName('leaderboard').setDescription('Display the picoCTF leaderboard'))
    .setDMPermission(false),

  defer: true,

  execute: async (_client, interaction) => {
    const leaderboard = await PicoCTF.getLeaderboardWithCache();
    if (!leaderboard) {
      await interaction.editReply(`Could not fetch the picoCTF leaderboard`);
      return false;
    }

    const string = leaderboard
      .slice(0, 10)
      .map((entry, index) => {
        const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
        return `${rank}. ${entry.username} - ${entry.score}`;
      })
      .join('\n\n');

    const embed = new EmbedBuilder().setTitle('picoCTF Leaderboard').setColor(Colors.Green).setDescription(string);

    await interaction.editReply({ embeds: [embed] });
    return true;
  }
};

export default command;
