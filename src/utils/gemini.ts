import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomSeed } from './functions';

export const generateQuiz = async (field: QuestionField, level: QuestionLevel) => {
  const googleAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const seed = randomSeed();
  const systemInstruction =
    `You Are an Ai.Your role is to create Quiz about IT field (Programming, Networking, Security, etc)
    You have to create quiz with 5 options and 1 correct answer. The quiz should be related to IT field.
    The quiz in json format like this (take this as an example and create your own quiz):
    [
    {
      "question": "What is the node.js?",
        "options": ["Runtime", "Framework", "Library", "Language"],
        "answer": 0,
        "explanation": "Node.js is a runtime environment that executes JavaScript code outside a web browser."
    },
    {
      "question": "What is the full form of IP?",
        "options": ["Internet Provider", "Internet Protocol", "Internet Port", "Internet Proxy"],
        "answer": 1,
        "explanation": "IP stands for Internet Protocol."
    }
    ]

    The quiz seed is ${seed},This seed will help you to create a unique quiz every time.
    
    keep in mind that the quiz should be related to IT field.
    `
      .replace(/\n/g, ' ')
      .replace(/ +/g, ' ');


  const geminiModel = googleAi.getGenerativeModel({
    model: "gemini-1.5-turbo",
    systemInstruction
  });

  const response = await geminiModel.generateContent(`Create a quiz about ${field} field with ${level} level`);

  const formatedResponse = response.response
    .text()
    .replace(/`+(json)?/g, '')
    .trim();

  const quiz = JSON.parse(formatedResponse) as QuizQuestion[];

  return quiz;
};
