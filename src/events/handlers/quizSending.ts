import { Event } from '../../@types/event';
import schedule from 'node-schedule';
import { randomElement, randomNumber } from '../../utils/functions';
import { generateQuiz } from '../../utils/gemini';

const event: Event<'ready'> = {
  name: 'ready',
  run: async client => {
    //every day at 00:00

    function scheduleQuiz() {
      const randomHour = randomNumber(9, 22);
      const randomMinute = randomNumber(0, 59);
      const rule = new schedule.RecurrenceRule();
      rule.hour = randomHour;
      rule.minute = randomMinute;
      rule.second = 0;
      rule.tz = 'Africa/Algiers';

      const randomLevel = randomElement(client.config.quiz.levels);
      schedule.scheduleJob(rule, async () => {
        for (const quizConfig of client.config.quiz.channels) {
          const channel = client.channels.cache.get(quizConfig.channelId);

          if (!channel) {
            console.error(`Channel with id ${quizConfig.channelId} not found`);
            continue;
          }

          const quiz = await generateQuiz(quizConfig.field, randomLevel);
          const randomQuestion = randomElement(quiz);
        }
      });
    }

    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;
    rule.tz = 'Africa/Algiers';

    const job = schedule.scheduleJob(rule, scheduleQuiz);

    return true;
  }
};

export default event;
