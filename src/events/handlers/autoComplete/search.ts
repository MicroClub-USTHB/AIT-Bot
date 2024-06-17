import { Event } from '../../../@types/event';
import { Search } from '../../../utils/search';

const event: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  run: async (client, interaction) => {
    if (!interaction.isAutocomplete()) return false;
    if (interaction.commandName !== 'search') return false;
    const subcommand = interaction.options.getSubcommand() as 'npm' | 'pypi' | 'cargo';
    const query = interaction.options.getFocused() as string;
    let data: string[] | null = null;
    switch (subcommand) {
      case 'npm':
        data = await Search.npmAutoComplete(query);
        break;
      case 'pypi':
        data = await Search.pypiAutoComplete(query);
        break;
      case 'cargo':
        data = await Search.cargoAutoComplete(query);
        break;
    }

    const choices = data.map(d => ({ name: d, value: d })).slice(0, 25);

    if (!choices.length) return false;

    await interaction.respond(choices);

    return true;
  }
};
export default event;
