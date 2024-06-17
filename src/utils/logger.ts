import chalk from 'chalk';

import { AnyEvent } from '../@types/event';
import { CommandTypes } from '../@types/enums';
import { Command } from '../@types/command';
import { User } from 'discord.js';

class Logger {
  public static logEventRegistered(event: AnyEvent): void {
    console.log(
      `${chalk.blue.underline.bold('Event:')} ${chalk.red.bold(event.name)} ${chalk.magenta('has been registered successfully')}\n`
    );
  }
  public static logCommandRegistered(command: Command): void {
    console.log(
      `${chalk.green.underline.bold.bold('Command:')} ${chalk.red.bold(
        command.data.name
      )} ${chalk.blue(CommandTypes[command.type])} ${chalk.magenta('has been registered successfully')}\n`
    );
  }

  public static logError(error: Error): void {
    console.log(
      `${chalk.red.underline.bold('Error:')} ${chalk.green.bold(
        error.name
      )} ${chalk.red.bold(error.message)}\n${chalk.white(error.stack)}`
    );
  }

  public static logCommandUsed(command: Command, user: User) {
    const message = `- ${chalk.greenBright(command.data.name)} ${chalk.red(
      CommandTypes[command.type]
    )} was used by ${chalk.greenBright(`${user.displayName} (${user.username})`)}`;
    console.log(message);
  }
}

export { Logger };
