export const QuizConfig = {
  channels: [
    {
      field: 'IT General',
      channelId: '728009660707111075'
    },

    {
      field: 'Web Development (Backend and Frontend)',
      channelId: '1179415065351438336'
    },
    {
      field: 'Mobile Development',
      channelId: '1179415449369317427'
    },
    {
      field: 'Data Science and Artificial Intelligence',
      channelId: '1179415515928739872'
    },
    {
      field: 'Security and Networking',
      channelId: '1179415270389993522'
    }
  ] as { field: QuestionField; channelId: string }[],

  levels: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'] as QuestionLevel[]
} as const;
