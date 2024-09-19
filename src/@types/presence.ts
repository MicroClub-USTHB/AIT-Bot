import { Collection } from 'discord.js';
export enum MemberVoiceStateType {
  Join,
  Update,
  Leave
}

export enum MemberVoiceState {
  Speaking,
  SelfMute,
  ServerMute,
  SelfDeaf,
  ServerDeaf
}

export declare interface MemberVoiceStateData {
  type: MemberVoiceStateType;
  state: MemberVoiceState;
  time: Date;
}

export declare interface MemberPresenceData {
  memberId: string;
  states: MemberVoiceStateData[];
}

export declare interface ChannelPresenceList {
  channelId: string;
  guildId: string;
  startTime: Date;
  members: Collection<string, MemberPresenceData>;
}

// Declare and export interfaces for final data
export declare interface FinalMemberData {
  memberId: string;
  totalTime: number;
  serverMuteTotalTime: number;
  serverDeafTotalTime: number;
  selfMuteTotalTime: number;
  selfDeafTotalTime: number;
  joinedTimes: number;
  leftTimes: number;
  mutedTotalTime: number; // serverMuteTotalTime + selfMuteTotalTime
  deafenedTotalTime: number; // serverDeafTotalTime + selfDeafTotalTime
  totalHearingTime: number; // totalTime - deafenedTotalTime
  joinedAt: Date;
  leftAt: Date;
}

export declare interface FinalPresenceData {
  channelId: string;
  guildId: string;
  startTime: Date;
  endTime: Date;
  members: FinalMemberData[];
}
