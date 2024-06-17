import { Event } from '../../@types/event';

import { ActionRow, ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

const event: Event<'interactionCreate'> = {
  name: 'interactionCreate',
  run: async (client, interaction) => {
    if (interaction.isButton() && interaction.customId === 'register-button') {
      const inputs = [
        new TextInputBuilder()
          .setCustomId('register-input-name')
          .setLabel('Name')
          .setPlaceholder('Enter your name')
          .setMaxLength(50)
          .setStyle(TextInputStyle.Short)
          .setRequired(true),
        new TextInputBuilder()
          .setCustomId('register-input-email')
          .setLabel('Email')
          .setPlaceholder('Enter your Email')
          .setMaxLength(50)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ].map(input => new ActionRowBuilder<TextInputBuilder>().setComponents(input));

      const modal = new ModalBuilder().setTitle('Register').setCustomId('register-modal').addComponents(inputs);
      await interaction.showModal(modal);

      return true;
    } else if (interaction.isModalSubmit() && interaction.customId === 'register-modal') {
      const name = interaction.fields.getTextInputValue('register-input-name');
      const email = interaction.fields.getTextInputValue('register-input-email');
      await interaction.deferReply({
        ephemeral: true
      });
      await interaction.editReply({
        content: 'Thank you for registering!'
      });

      console.log(interaction.user.username, name, email);

      const channel = await client.channels.fetch('1247660594308448307');

      const embed = new EmbedBuilder().setTitle('New Registration').setDescription(`Name: ${name}\nEmail: ${email}`);
      /*
      await interaction.reply({
        content: `Name: ${name}\nEmail: ${email}`,
        ephemeral: true
      });*/

      return true;
    }

    return true;
  }
};

export default event;
