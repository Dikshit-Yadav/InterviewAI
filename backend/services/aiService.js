import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateQuestions = async (role, experience, interviewType) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const prompt = `
Generate 1 ${interviewType} interview questions for a ${experience} experience ${role} with followup questions.

Return strictly in JSON format like:
["Question 1", "Question 2", "Question 3"]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const data = text.replace(/```json|```/g, "").trim();

    return JSON.parse(data);

  } catch (error) {
    console.error("AI Error:", error);
    throw new Error(error.message);
  }
};

export const evaluateAnswer = async (question, answer) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const prompt = `
Question: ${question}
User Answer: ${answer}

Evaluate and return strictly JSON:
{
  "score": number (0-10),
  "strengths": "...",
  "weaknesses": "...",
  "correctAnswer": "..."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const data = text.replace(/```json|```/g, "").trim();

    return JSON.parse(data);

  } catch (error) {
    console.error("AI Evaluation Error:", error);
    throw new Error(error.message);
  }
};