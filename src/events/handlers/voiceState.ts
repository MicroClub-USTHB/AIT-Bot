import { GuildMember, VoiceState } from 'discord.js';
import { Event } from '../../@types/event';
import {
  ChannelPresenceList,
  MemberPresenceData,
  MemberVoiceState,
  MemberVoiceStateType
} from '../../@types/presence';

const event: Event<'voiceStateUpdate'> = {
  name: 'voiceStateUpdate',
  run: async (client, oldState, newState) => {
    // Fetch partial states
    await Promise.all([
      oldState.channel?.partial && oldState.channel.fetch(),
      newState.channel?.partial && newState.channel.fetch(),
      newState.member?.partial && newState.member.fetch()
    ]);

    const isInSameChannel = oldState.channelId === newState.channelId;
    const oldChannelList = oldState.channelId ? client.presenceLists.get(oldState.channelId) : null;
    const newChannelList = newState.channelId ? client.presenceLists.get(newState.channelId) : null;

    // Handle same channel updates
    if (isInSameChannel && newState.member) {
      const member = newState.member;
      const memberData = newChannelList?.members.get(member.id);
      if (!memberData) return false;

      const memberLastState = memberData.states[memberData.states.length - 1].state;
      const memberNewState = getUpdatedMemberState(member.voice, memberLastState);

      if (memberNewState === memberLastState) return false;

      memberData.states.push({
        type: MemberVoiceStateType.Update,
        state: memberNewState,
        time: new Date()
      });

      return true;
    }

    // Handle member leaving the old channel
    if (oldChannelList && oldState.member) {
      updateMemberStateOnLeave(oldChannelList, oldState.member);
    }

    // Handle member joining the new channel
    if (newChannelList && newState.member) {
      updateMemberStateOnJoin(newChannelList, newState.member);
    }

    return true;
  }
};

// Utility function to determine the updated voice state
function getUpdatedMemberState(voice: VoiceState, currentState: MemberVoiceState) {
  if (voice.serverDeaf) return MemberVoiceState.ServerDeaf;
  if (voice.selfDeaf) return MemberVoiceState.SelfDeaf;
  if (voice.serverMute) return MemberVoiceState.ServerMute;
  if (voice.selfMute) return MemberVoiceState.SelfMute;
  return currentState;
}

// Handle member leaving a channel
function updateMemberStateOnLeave(channelList: ChannelPresenceList, member: GuildMember) {
  const memberData = channelList.members.get(member.id);
  if (memberData) {
    memberData.states.push({
      type: MemberVoiceStateType.Leave,
      state: memberData.states[memberData.states.length - 1].state,
      time: new Date()
    });
  }
}

// Handle member joining a channel
function updateMemberStateOnJoin(channelList: ChannelPresenceList, member: GuildMember) {
  const memberState = getUpdatedMemberState(member.voice, MemberVoiceState.Speaking);
  const memberData: MemberPresenceData = {
    memberId: member.id,
    states: [
      {
        type: MemberVoiceStateType.Join,
        state: memberState,
        time: new Date()
      }
    ]
  };
  channelList.members.set(member.id, memberData);
}

export default event;
