import { ChannelType, SlashCommandBuilder, Collection, EmbedBuilder } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { ChannelPresenceList, MemberPresenceData } from '../../@types/client';
import moment from 'moment';
const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('presence')
    .setDescription('Make a presence list')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start channel presence list')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to start presence list')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('Stop channel presence list')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to stop presence list')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .setDMPermission(false),
  defer: true,
  ephemeral: true,

  execute: async (client, interaction) => {
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>('channel', true);
    if (channel.partial) await channel.fetch();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      if (client.presenceLists.has(channel.id)) {
        await interaction.editReply(`Presence list for ${channel.name} already exists`);
        return false;
      }

      const channelList: ChannelPresenceList = {
        channelId: channel.id,
        guildId: channel.guildId,
        startTime: new Date(),
        members: new Collection()
      };

      for (const member of channel.members.values()) {
        const membereData: MemberPresenceData = {
          memberId: member.id,
          lastJoinedTime: new Date(),
          lastLeftTime: null,
          totalTime: 0,
          joinedTimes: 1,
          leftTimes: 0
        };
        channelList.members.set(member.id, membereData);
      }

      client.presenceLists.set(channel.id, channelList);

      await interaction.editReply(`Started presence list for ${channel}`);
    } else if (subcommand === 'stop') {
      const channelList = client.presenceLists.get(channel.id);
      if (!channelList) {
        await interaction.editReply(`Presence list for ${channel.name} does not exist`);
        return false;
      }
      const endTime = new Date();

      for (const memberData of channelList.members.values()) {
        if (!memberData.lastJoinedTime) continue;
        memberData.lastLeftTime = new Date();
        memberData.totalTime += memberData.lastLeftTime.getTime() - memberData.lastJoinedTime.getTime();
        memberData.lastJoinedTime = null;
        memberData.leftTimes++;
      }

      const presenceTime = moment.duration(endTime.getTime() - channelList.startTime.getTime()).humanize();

      const embed = new EmbedBuilder()
        .setTitle('Presence List')
        .setDescription(`Presence list for ${channel}`)
        .addFields(
          { name: 'Total Members', value: channel.members.size.toString(), inline: true },
          { name: 'Total Time', value: `${presenceTime}`, inline: true },
          {
            name: 'Members',
            value: channelList.members
              .map((data, memberId) => `<@${memberId}> - ${moment.duration(data.totalTime).humanize()}`)
              .join('\n')
          }
        );
      await interaction.editReply({ embeds: [embed] });
      client.presenceLists.delete(channel.id);
    }

    return true;
  }
};

export default command;
