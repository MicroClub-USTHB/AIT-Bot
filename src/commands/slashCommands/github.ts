import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { Search } from '../../utils/search';
import { datetoDiscordTimestamp } from '../../utils/functions';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Search in github')
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Search for a github user')
        .addStringOption(option =>
          option
            .setName('username')
            .setDescription('The username of the github user')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('repository')
        .setDescription('Search for a github repository')

        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('The full name of the github repository username/repo')
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addStringOption(option =>
          option
            .setName('username')
            .setDescription('The username of the github repository owner')
            .setRequired(false)
            .setAutocomplete(true)
        )
    )

    .setDMPermission(false),
  defer: true,

  execute: async (_client, interaction) => {
    const subcommand = interaction.options.getSubcommand() as 'user' | 'repository';

    if (subcommand === 'user') {
      const username = interaction.options.getString('username') as string;
      const userData = await Search.githubUser(username);
      if (!userData) {
        await interaction.reply('User not found');
        return false;
      }

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setAuthor({
          name: userData.username,
          iconURL: userData.avatar,
          url: userData.url
        })
        .setFields(
          {
            name: 'Bio',
            value: userData.bio || 'No bio',
            inline: false
          },
          {
            name: 'Followers',
            value: userData.followers.toString(),
            inline: true
          },
          {
            name: 'Following',
            value: userData.following.toString(),
            inline: true
          },
          {
            name: 'Public Repositories',
            value: userData.repositories.toString(),
            inline: true
          },
          {
            name: 'Total Stars',
            value: userData.stars?.toString() || 'n/a',
            inline: true
          },
          {
            name: 'Starred Repositories Count',
            value: userData.starred?.toString() || 'n/a',
            inline: true
          }
        )
        .setFooter({ text: `Joined Github on` })
        .setTimestamp(userData.creationDate);

      await interaction.editReply({ embeds: [embed] });
    } else if (subcommand === 'repository') {
      const name = interaction.options.getString('name') as string;
      const repoData = await Search.githubRepository(name);
      if (!repoData) {
        await interaction.reply('Repository not found');
        return false;
      }

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setAuthor({
          name: repoData.name,
            url: repoData.url,
          iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        })
        .setFields(
          {
            name: 'Description',
            value: repoData.description || 'No description',
            inline: false
          },
          {
            name: 'Languages',
            value: repoData.languages?.map(l => `${l.name} (${l.percentage.toFixed(2)}%)`).join(', ') || 'No languages',
            inline: true
          },
          {
            name: 'Stars',
            value: `${repoData.stars || 'n/a'}`,
            inline: true
          },
          {
            name: 'Forks',
            value: `${repoData.forks || 0}`,
            inline: true
          },
          {
            name: 'Open Issues',
            value: `${repoData.issues ||0}`,
            inline: true
          },
          {
            name: 'License',
            value: repoData.license || 'No license',
            inline: true
          },
          {
            name: 'Owner',
            value: repoData.username,
            inline: true
          },
          {
            name: 'First Push',
            value: datetoDiscordTimestamp(repoData.firstPush),
            inline: true
          },
          {
            name: 'Last Update',
            value: datetoDiscordTimestamp(repoData.lastUpdate),
            inline: true
          }
        )
        .setFooter({ text: `Created on` })
        .setTimestamp(repoData.creationDate);

      await interaction.editReply({ embeds: [embed] });
    }

    return true;
  }
};

export default command;
