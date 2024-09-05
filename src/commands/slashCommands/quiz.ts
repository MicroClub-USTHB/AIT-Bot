import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionContextType
} from 'discord.js';
import { Command } from '../../@types/command';
import { CommandTypes, DiscordTimestampStyle } from '../../@types/enums';
import { generateQuiz } from '../../utils/gemini';
import { datetoDiscordTimestamp } from '../../utils/functions';

const command: Command = {
  type: CommandTypes.SlashCommand,
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Gives you an IT Quiz')
    .setContexts(InteractionContextType.Guild),
  defer: true,

  execute: async (_client, interaction) => {
    const quiz = await generateQuiz('Security and Networking', 'Master');
    let questionIndex = 0;
    let score = 0;

    do {
      const question = quiz[questionIndex];
      const remainingTime = datetoDiscordTimestamp(Date.now() + 31 * 1000, DiscordTimestampStyle.RelativeTime);
      const quizEmbed = new EmbedBuilder()
        .setTitle(question.question)
        .setDescription(
          `${question.options.map((option, index) => `**${index + 1}.** ${option}`).join('\n\n')}\n\nremaining time: ${remainingTime}`
        )

        .setFooter({
          text: `Question ${questionIndex + 1} of ${quiz.length} ${datetoDiscordTimestamp(Date.now(), DiscordTimestampStyle.RelativeTime)}`
        });
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        question.options.map((_, index) =>
          new ButtonBuilder()
            .setCustomId(`quiz-button-${index}`)
            .setLabel(`${index + 1}`)
            .setStyle(index % 2 === 0 ? ButtonStyle.Primary : ButtonStyle.Secondary)
        )
      );

      const msg = await interaction.editReply({ embeds: [quizEmbed], components: [row] });

      const answerInteraction = await msg
        .awaitMessageComponent({
          componentType: ComponentType.Button,
          filter: i => i.isButton() && i.customId.startsWith('quiz-button') && i.user.id === interaction.user.id,
          time: 30 * 1000
        })
        .catch(() => null);

      if (!answerInteraction) {
        await interaction.editReply({ content: 'You did not answer the question in time' });
        break;
      }

      const selectedOption = answerInteraction.customId.split('-').at(-1);
      console.log('selectedOption', selectedOption);

      await answerInteraction.deferReply({ ephemeral: true, fetchReply: true });

      if (!selectedOption) {
        await answerInteraction.editReply({ content: 'Please select an option' });
        continue;
      }

      if (selectedOption === question.answer.toString()) {
        await answerInteraction.editReply({ content: 'Correct!' });
        score++;
      } else {
        await answerInteraction.editReply({
          content: `Incorrect! The correct answer is ${question.options[question.answer]}`
        });
      }
      questionIndex++;
    } while (questionIndex < quiz.length);

    await interaction.editReply({
      content: `You scored ${score} out of ${quiz.length}`,
      embeds: [],
      components: []
    });

    return true;
  }
};

export default command;
