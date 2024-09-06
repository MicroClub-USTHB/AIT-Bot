import { Event } from '../../@types/event';
import {
  MemberPresenceData,
  MemberVoiceState,
  MemberVoiceStateData,
  MemberVoiceStateType
} from '../../@types/presence';

const event: Event<'voiceStateUpdate'> = {
  name: 'voiceStateUpdate',
  // eslint-disable-next-line complexity
  run: async (client, oldState, newState) => {
    if (oldState.channel?.partial) await oldState.channel.fetch();
    if (newState.channel?.partial) await newState.channel.fetch();
    //if (oldState.member?.partial) await oldState.member.fetch();
    if (newState.member?.partial) await newState.member.fetch();

    const isInSameChannel = oldState.channelId === newState.channelId;

    //if (isInSameChannel) return false;

    const oldChannelList = oldState.channelId ? client.presenceLists.get(oldState.channelId) : null;
    const newChannelList = newState.channelId ? client.presenceLists.get(newState.channelId) : null;

    if (isInSameChannel) {
      const member = newState.member;
      if (!member) return false;
      const memberData = newChannelList?.members.get(member.id);
      if (!memberData) return false;

      const memberLastState = memberData.states[memberData.states.length - 1].state;

      let memberNewState = memberLastState;
      if (member.voice.serverDeaf) {
        memberNewState = MemberVoiceState.ServerDeaf;
      } else if (member.voice.selfDeaf) {
        memberNewState = MemberVoiceState.SelfDeaf;
      } else if (member.voice.serverMute) {
        memberNewState = MemberVoiceState.ServerMute;
      } else if (member.voice.selfMute) {
        memberNewState = MemberVoiceState.SelfMute;
      }
      if (memberNewState === memberLastState) return false;

      const memberNewStateData: MemberVoiceStateData = {
        type: MemberVoiceStateType.Update,
        state: memberNewState,
        time: new Date()
      };

      memberData.states.push(memberNewStateData);

      return true;
    }

    if (oldChannelList && oldState.member) {
      const member = oldState.member;
      const memberData = oldChannelList?.members.get(member.id);
      if (memberData) {
        const memberLastState = memberData.states[memberData.states.length - 1].state;

        const memberNewStateData: MemberVoiceStateData = {
          type: MemberVoiceStateType.Leave,
          state: memberLastState,
          time: new Date()
        };

        memberData.states.push(memberNewStateData);
      }
    }

    if (newChannelList && newState.member) {
      const member = newState.member;

      let memberState = MemberVoiceState.Speaking;
      if (member.voice.serverDeaf) {
        memberState = MemberVoiceState.ServerDeaf;
      } else if (member.voice.selfDeaf) {
        memberState = MemberVoiceState.SelfDeaf;
      } else if (member.voice.serverMute) {
        memberState = MemberVoiceState.ServerMute;
      } else if (member.voice.selfMute) {
        memberState = MemberVoiceState.SelfMute;
      }

      const membereData: MemberPresenceData = {
        memberId: member.id,
        states: [
          {
            type: MemberVoiceStateType.Join,
            state: memberState,
            time: new Date()
          }
        ]
      };

      newChannelList.members.set(member.id, membereData);
    }

    return true;
  }
};

export default event;
