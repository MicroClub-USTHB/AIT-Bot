import { Client } from './base/client';
import { ActivityType, AllowedMentionsTypes, GatewayIntentBits, Partials, PresenceUpdateStatus } from 'discord.js';
import { config as envConfig } from 'dotenv';
import process from 'process';
import chalk from 'chalk';
envConfig();

import './api/app';
import './utils/prototype';
import { Logger } from './utils/logger';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User, Partials.GuildMember],

  allowedMentions: {
    parse: [AllowedMentionsTypes.Role, AllowedMentionsTypes.User],
    repliedUser: true
  },
  failIfNotExists: false,

  presence: {
    activities: [
      {
        name: 'IT Best Section',
        type: ActivityType.Watching
      }
    ],
    status: PresenceUpdateStatus.DoNotDisturb
  }
});

client.init({
  token: process.env.TOKEN,
  commandsDirName: 'commands',
  eventsDirName: 'events',
  debug: true
});

process.on('unhandledRejection', error => {
  Logger.logError(error as Error);
});

process.on('uncaughtException', error => {
  Logger.logError(error as Error);
});

process.on('SIGINT', async () => {
  console.log(chalk.red.bold('\nShutting down...'));
  process.exit(0);
});

export { client };
