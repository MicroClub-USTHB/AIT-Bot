import { DiscordTimestampStyle } from '../@types/enums';

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

export function datetoDiscordTimestamp(date: Date, type = DiscordTimestampStyle.Default): string {
  const timestamp = date.getTime();
  return `<t:${Math.floor(timestamp / 1000)}${type === DiscordTimestampStyle.Default ? '' : `:${type}`}>`;
}
