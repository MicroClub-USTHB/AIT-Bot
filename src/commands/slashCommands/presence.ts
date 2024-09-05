import { ChannelType, SlashCommandBuilder, Collection, EmbedBuilder, AttachmentBuilder, InteractionContextType } from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes } from '../../@types/enums';
import { ChannelPresenceList, MemberPresenceData } from '../../@types/client';
import { formatDuration } from '../../utils/functions';

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
            .setRequired(false)
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
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .setContexts(InteractionContextType.Guild),
  defer: true,
  ephemeral: true,
  devOnly: true,

  execute: async (client, interaction) => {
    const member = await interaction.guild?.members
      .fetch({
        user: interaction.user.id
      })
      .catch(() => null);
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>('channel') || member?.voice.channel;

    if (!channel) {
      await interaction.editReply('Channel not found');
      return false;
    }

    if (channel.partial) await channel.fetch();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      if (client.presenceLists.has(channel.id)) {
        await interaction.editReply(`Presence list for ${channel.name} already exists,stop it first`);
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

      channelList.members.sort((a, b) => b.totalTime - a.totalTime || b.joinedTimes - a.joinedTimes);

      const presenceTime = formatDuration(endTime.getTime() - channelList.startTime.getTime());
      const averageTime = channelList.members.reduce((acc, data) => acc + data.totalTime, 0) / channelList.members.size;
      const variance =
        channelList.members.reduce((acc, data) => acc + Math.pow(data.totalTime - averageTime, 2), 0) /
        channelList.members.size;

      const embed = new EmbedBuilder()
        .setTitle('Presence List')
        .setDescription(`Presence list for ${channel}`)
        .addFields(
          { name: 'Total Members', value: channelList.members.size.toString(), inline: true },
          { name: 'Total Time', value: `${presenceTime}`, inline: true },
          {
            name: 'Average Time',
            value: formatDuration(averageTime)
          },
          {
            name: 'Difference from Average Time',
            value: formatDuration(variance)
          }
        );

      let i = 1;
      const csvFile = `N,Id,Username,Total_Time,Joined_Times,Left_Times\n${channelList.members
        .map(
          (data, memberId) =>
            `${i++},${memberId},${interaction.guild?.members.cache.get(memberId)?.user.username || 'Not Found'},${formatDuration(data.totalTime)},${data.joinedTimes},${data.leftTimes}`
        )
        .join('\n')}`;

      const jsonFile = JSON.stringify(
        channelList.members.map(data => ({
          id: data.memberId,
          username: interaction.guild?.members.cache.get(data.memberId)?.user.username || 'Not Found',
          time: formatDuration(data.totalTime),
          joined: data.joinedTimes,
          left: data.leftTimes
        })),
        null,
        2
      );

      const csvAttachment = new AttachmentBuilder(Buffer.from(csvFile))
        .setName('presence.csv')
        .setDescription('Presence list in CSV format');

      const jsonAttachment = new AttachmentBuilder(Buffer.from(jsonFile))
        .setName('presence.json')
        .setDescription('Presence list in JSON format');

      await interaction.editReply({ embeds: [embed], files: [csvAttachment, jsonAttachment] });
      client.presenceLists.delete(channel.id);
    }

    return true;
  }
};

export default command;
