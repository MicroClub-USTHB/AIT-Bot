import { DiscordTimestampStyle } from '../@types/enums';
import moment from 'moment';
export function formatString(str: string, record: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return record[key] || match;
  });
}

export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

export function camelCase(str: string, firstCapital = false): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
      return index === 0 && !firstCapital ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function datetoDiscordTimestamp(date: Date | number, type = DiscordTimestampStyle.Default): string {
  const timestamp = date instanceof Date ? date.getTime() : date;
  return `<t:${Math.floor(timestamp / 1000)}${type === DiscordTimestampStyle.Default ? '' : `:${type}`}>`;
}

export function formatDuration(duration: number, format = 'HH:mm:ss.SSS'): string {
  return moment.utc(duration).format(format);
}

export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
