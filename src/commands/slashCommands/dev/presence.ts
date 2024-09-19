import {
  ChannelType,
  SlashCommandBuilder,
  Collection,
  EmbedBuilder,
  AttachmentBuilder,
  InteractionContextType,
  VoiceBasedChannel,
  GuildMember
} from 'discord.js';
import { Command } from '../../../@types/command';
import { CommandTypes } from '../../../@types/enums';
import { ChannelPresenceList, MemberPresenceData } from '../../../@types/client';
import { formatDuration } from '../../../utils/functions';
import { FinalMemberData, FinalPresenceData, MemberVoiceState, MemberVoiceStateType } from '../../../@types/presence';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('presence')
    .setDescription('Manage presence list')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start channel presence list')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Select voice channel')
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
            .setDescription('Select voice channel')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    )
    .setContexts(InteractionContextType.Guild),
  defer: true,
  ephemeral: true,
  devOnly: true,

  execute: async (client, interaction) => {
    const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>('channel') || member?.voice.channel;

    if (!channel) {
      await interaction.editReply('Channel not found');
      return false;
    }

    if (channel.partial) await channel.fetch();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      if (client.presenceLists.has(channel.id)) {
        await interaction.editReply(`Presence list for ${channel.name} already exists. Stop it first.`);
        return false;
      }

      const channelList: ChannelPresenceList = createChannelPresenceList(channel);
      for (const member of channel.members.values()) {
        await member.fetch(true);
        if (member.voice.channelId) addMemberToChannelList(channelList, member);
      }

      client.presenceLists.set(channel.id, channelList);
      await interaction.editReply(`Started presence list for ${channel}`);
    } else if (subcommand === 'stop') {
      const channelList = client.presenceLists.get(channel.id);
      if (!channelList) {
        await interaction.editReply(`Presence list for ${channel.name} does not exist.`);
        return false;
      }

      finalizePresenceList(channelList);
      const finalData = generateFinalData(channelList);

      const presenceTime = formatDuration(new Date().getTime() - finalData.startTime.getTime());
      const totalMembers = finalData.members.length;

      const embed = new EmbedBuilder()
        .setTitle('Presence List')
        .setDescription(`Presence list for ${channel.name}`)
        .addFields(
          { name: 'Total Members', value: `${totalMembers}`, inline: true },
          { name: 'Total Time', value: presenceTime, inline: true }
        );

      const [csvFile, jsonFile] = generatePresenceFiles(finalData);
      await interaction.editReply({ embeds: [embed], files: [csvFile, jsonFile] });
      client.presenceLists.delete(channel.id);
    }

    return true;
  }
};

function createChannelPresenceList(channel: VoiceBasedChannel): ChannelPresenceList {
  return {
    channelId: channel.id,
    guildId: channel.guildId,
    startTime: new Date(),
    members: new Collection()
  };
}

function addMemberToChannelList(channelList: ChannelPresenceList, member: GuildMember) {
  const memberState = determineMemberVoiceState(member);
  const memberData: MemberPresenceData = {
    memberId: member.id,
    states: [{ type: MemberVoiceStateType.Join, state: memberState, time: new Date() }]
  };
  channelList.members.set(member.id, memberData);
}

function determineMemberVoiceState(member: GuildMember) {
  if (member.voice.serverDeaf) return MemberVoiceState.ServerDeaf;
  if (member.voice.selfDeaf) return MemberVoiceState.SelfDeaf;
  if (member.voice.serverMute) return MemberVoiceState.ServerMute;
  if (member.voice.selfMute) return MemberVoiceState.SelfMute;
  return MemberVoiceState.Speaking;
}

function finalizePresenceList(channelList: ChannelPresenceList) {
  for (const memberData of channelList.members.values()) {
    const lastState = memberData.states[memberData.states.length - 1];
    if (lastState.type !== MemberVoiceStateType.Leave) {
      memberData.states.push({
        type: MemberVoiceStateType.Leave,
        state: lastState.state,
        time: new Date()
      });
    }
  }
}

function generateFinalData(channelList: ChannelPresenceList): FinalPresenceData {
  const members = channelList.members
    .map(data => ({
      memberId: data.memberId,
      totalTime: calculateTotalTime(data),
      serverMuteTotalTime: calculateStateTime(data, MemberVoiceState.ServerMute),
      serverDeafTotalTime: calculateStateTime(data, MemberVoiceState.ServerDeaf),
      selfMuteTotalTime: calculateStateTime(data, MemberVoiceState.SelfMute),
      selfDeafTotalTime: calculateStateTime(data, MemberVoiceState.SelfDeaf),
      joinedTimes: countStateTypeOccurrences(data, MemberVoiceStateType.Join),
      leftTimes: countStateTypeOccurrences(data, MemberVoiceStateType.Leave),
      leftAt: data.states[data.states.length - 1].time,
      joinedAt: data.states[0].time
    }))
    .map(member => ({
      ...member,
      mutedTotalTime: member.serverMuteTotalTime + member.selfMuteTotalTime,
      deafenedTotalTime: member.serverDeafTotalTime + member.selfDeafTotalTime
    }))
    .map(member => ({
      ...member,
      totalHearingTime: member.totalTime - member.deafenedTotalTime
    }));

  return {
    channelId: channelList.channelId,
    guildId: channelList.guildId,
    startTime: channelList.startTime,
    endTime: new Date(),
    members
  };
}

function calculateTotalTime(data: MemberPresenceData) {
  return data.states.reduce((acc, state, index, array) => {
    if (state.type === MemberVoiceStateType.Leave) {
      const joinState = array.find((s, i) => i < index && s.type === MemberVoiceStateType.Join);
      if (joinState) acc += state.time.getTime() - joinState.time.getTime();
    }
    return acc;
  }, 0);
}

function calculateStateTime(data: MemberPresenceData, stateType: MemberVoiceState) {
  return data.states.reduce((acc, state, index, array) => {
    if (state.state === stateType) {
      const nextState = array.find(
        (s, i) => i > index && (s.state !== stateType || s.type === MemberVoiceStateType.Leave)
      );
      if (nextState) acc += nextState.time.getTime() - state.time.getTime();
    }
    return acc;
  }, 0);
}

function countStateTypeOccurrences(data: MemberPresenceData, type: MemberVoiceStateType) {
  return data.states.filter(state => state.type === type).length;
}

function generatePresenceFiles(finalData: FinalPresenceData) {
  const jsonFile = new AttachmentBuilder(Buffer.from(JSON.stringify(finalData, null, 2)))
    .setName('presence.json')
    .setDescription('Presence list in JSON format');

  const csvFile = new AttachmentBuilder(Buffer.from(generateCSV(finalData.members)))
    .setName('presence.csv')
    .setDescription('Presence list in CSV format');

  return [csvFile, jsonFile];
}

function generateCSV(finalMembersData: FinalMemberData[]) {
  let i = 1;
  let csv = `N,Id,Total Hearing Time,Total Muted Time,Total Deafened Time,Total Time,Joined Times,Left Times\n`;
  for (const member of finalMembersData) {
    csv += `${i++},${member.memberId},${formatDuration(member.totalHearingTime)},${formatDuration(member.mutedTotalTime)},${formatDuration(member.deafenedTotalTime)},${formatDuration(member.totalTime)},${member.joinedTimes},${member.leftTimes}\n`;
  }

  return csv;
}

export default command;
