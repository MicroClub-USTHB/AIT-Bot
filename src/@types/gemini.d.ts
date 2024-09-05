declare interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

type QuestionField =
  | 'IT General'
  | 'Security and Networking'
  | 'Web Development (Backend and Frontend)'
  | 'Mobile Development'
  | 'Data Science and Artificial Intelligence';

type QuestionLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
