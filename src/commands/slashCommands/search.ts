import { Colors, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { Search } from '../../utils/search';
import { PackageData } from '../../@types/searchData';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a package')
    .addSubcommand(subcommand =>
      subcommand
        .setName('npm')
        .setDescription('Search for a npm package')
        .addStringOption(option =>
          option.setName('name').setDescription('The name of the npm package').setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('pypi')
        .setDescription('Search for a pypi package')
        .addStringOption(option =>
          option.setName('name').setDescription('The name of the pypi package').setRequired(true).setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('cargo')
        .setDescription('Search for a cargo crate')
        .addStringOption(option =>
          option.setName('name').setDescription('The name of the cargo crate').setRequired(true).setAutocomplete(true)
        )
    )
    .setDMPermission(false),
  defer: true,

  execute: async (_client, interaction) => {
    const subcommand = interaction.options.getSubcommand() as 'npm' | 'pypi' | 'cargo';
    const packageName = interaction.options.getString('name') as string;
    let packageInfo: PackageData | null = null;
    let color = null;
    switch (subcommand) {
      case 'npm':
        packageInfo = await Search.npm(packageName);
        color = Colors.Red;
        break;
      case 'pypi':
        packageInfo = await Search.pypi(packageName);
        color = Colors.Blue;
        break;
      case 'cargo':
        packageInfo = await Search.cargo(packageName);
        color = Colors.Yellow;
        break;
    }

    if (!packageInfo) {
      await interaction.reply(`Package not found`);
      return false;
    }

    const embed = new EmbedBuilder()
      .setThumbnail(packageInfo.icon)
      .setTitle(packageInfo.name)
      .setURL(packageInfo.url)
      .setColor(color)
      .setDescription(packageInfo.description)
      .addFields({
        name: 'Latest Version',
        value: packageInfo.version,
        inline: false
      });

    if (packageInfo.keywords.length > 0)
      embed.addFields({
        name: 'Keywords',
        value: packageInfo.keywords.map(k => `\`${k}\``).join(', '),
        inline: false
      });

    await interaction.editReply({ embeds: [embed] });
    return true;
  }
};

export default command;
