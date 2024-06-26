enum CommandTypes {
  SlashCommand = 1,
  UserContextMenuCommand,
  MessageContextMenuCommand,
  MessageCommand
}
enum DiscordTimestampStyle {
  Default = '',
  ShortTime = 't',
  LongTime = 'T',
  ShortDate = 'd',
  LongDate = 'D',
  ShortDateOrTime = 'f',
  LongDateOrTime = 'F',
  RelativeTime = 'R'
}

export { CommandTypes, DiscordTimestampStyle };
