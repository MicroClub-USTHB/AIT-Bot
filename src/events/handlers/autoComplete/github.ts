import { Event } from '../../../@types/event';
import { Search } from '../../../utils/search';

const event: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  run: async (client, interaction) => {
    if (!interaction.isAutocomplete()) return false;
    if (interaction.commandName !== 'github') return false;
    const subcommand = interaction.options.getSubcommand() as 'user' | 'repository';
    const focusedOption = interaction.options.getFocused(true);
    let data: string[] | null = null;

    if (subcommand === 'user' || (subcommand === 'repository' && focusedOption.name === 'username')) {
      data = await Search.githubUserAutoComplete(focusedOption.value.trim());
    } else if (subcommand === 'repository') {
      const currentUsername = interaction.options.getString('username');
      if (!currentUsername) {
        data = await Search.githubRepositoryGlobalAutoComplete(focusedOption.value.trim());
      } else {
        data = await Search.githubRepositoryByUserAutoComplete(currentUsername, focusedOption.value.trim());
      }
    }

    if (!data) {
      await interaction.respond([]);
      return false;
    }

    const choices = data.map(d => ({ name: d, value: d })).slice(0, 25);

    await interaction.respond(choices);

    return true;
  }
};
export default event;
