import { Collection } from 'discord.js';

declare interface StartOptions {
  token: string;
  eventsDirName: string;
  commandsDirName: string;
  debug?: boolean;
}

declare interface ChannelPresenceList {
  channelId: string;
  guildId: string;
  startTime: Date;
  members: Collection<string, MemberPresenceData>;
}

declare interface MemberPresenceData {
  memberId: string;
  lastJoinedTime: Date | null;
  lastLeftTime: Date | null;
  totalTime: number;
  joinedTimes: number;
  leftTimes: number;
}
