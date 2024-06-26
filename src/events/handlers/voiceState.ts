import { Event } from '../../@types/event';

const event: Event<'voiceStateUpdate'> = {
  name: 'voiceStateUpdate',
  run: async (client, oldState, newState) => {
    if (oldState.channel?.partial) await oldState.channel.fetch();
    if (newState.channel?.partial) await newState.channel.fetch();

    if (oldState.member?.partial) await oldState.member.fetch();
    if (newState.member?.partial) await newState.member.fetch();

    const oldChannelList = oldState.channelId ? client.presenceLists.get(oldState.channelId) : null;
    const newChannelList = newState.channelId ? client.presenceLists.get(newState.channelId) : null;

    if (oldChannelList && oldState.member) {
      const memberData = oldState.member ? oldChannelList.members.get(oldState.member.id) : null;
      if (memberData) {
        memberData.lastLeftTime = new Date();

        if (memberData.lastJoinedTime)
          memberData.totalTime += memberData.lastLeftTime.getTime() - memberData.lastJoinedTime.getTime();

        memberData.lastJoinedTime = null;
        memberData.leftTimes++;
      }
    }

    if (newChannelList && newState.member) {
      const memberData = newChannelList.members.get(newState.member.id);
      if (memberData) {
        memberData.lastJoinedTime = new Date();
        memberData.lastLeftTime = null;
        memberData.joinedTimes++;
      } else {
        const memberData = {
          memberId: newState.member.id,
          lastJoinedTime: new Date(),
          lastLeftTime: null,
          totalTime: 0,
          joinedTimes: 1,
          leftTimes: 0
        };
        newChannelList.members.set(memberData.memberId, memberData);
      }
    }

    return true;
  }
};

export default event;
