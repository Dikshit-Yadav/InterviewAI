import dotenv from "dotenv";
dotenv.config();

import { Groq } from 'groq-sdk';
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
// const genAI = groq.createClient

//generate questions
export const generateQuestions = async (role, experience, interviewType) => {
  try {
    const prompt = `
Take a mock interview for the role of ${role} with ${experience} level experience and interview type ${interviewType}.
 Conduct the interview in 3 rounds, increasing difficulty in each round:
 Round 1 (Basic): Ask fundamental questions to test core knowledge.
 Round 2 (Intermediate): Ask application-based and scenario-based questions. Include follow-up and cross-questions based on the candidate’s answers.
 Round 3 (Advanced): Ask complex, real-world, and problem-solving questions. Include strict cross-questioning, edge cases, and deep conceptual understanding. Do NOT group into rounds
- Do NOT return objects
- Return ONLY an array of strings

Return ONLY valid JSON:
{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}

No markdown. No explanation. Only JSON.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ],
       response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;

    const data = JSON.parse(text);
    // console.log(data)
    return data.questions;

  } catch (error) {
    console.error("AI Error:", error);
    throw new Error(error.message);
  }
};

//evaluate answer
export const evaluateAnswer = async (question, answer) => {
  try {
    const prompt = `
Question: ${question}
User Answer: ${answer}

Return strictly JSON:
{
  "score": number,
  "skill": "",
  "strengths": "",
  "weaknesses": "",
  "correctAnswer": ""
}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
       response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("AI Evaluation Error:", error);
    throw new Error(error.message);
  }
};

//report
export const generateFinalReportAI = async (answers) => {
  try {
    const prompt = `
Analyze the following interview answers:

${JSON.stringify(answers)}

Return strictly JSON:
{
  "summary": "",
  "techScore": number,
  "clarityScore": number,
  "confidenceScore": number,
  "strongTopics": [],
  "weakTopics": [],
  "learningPath": [],
  "tips": []
}
`;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
       response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

  } catch (error) {
    console.error("Final AI Report Error:", error);
    throw new Error(error.message);
  }
};




// export const generateQuestions = async (role, experience, interviewType) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-flash-latest",
//     });

//     const prompt = `
// Take a mock interview for the role of ${role} with ${experience} level experience and interview type ${interviewType}.
// Conduct the interview in 3 rounds, increasing difficulty in each round:
// Round 1 (Basic): Ask fundamental questions to test core knowledge.
// Round 2 (Intermediate): Ask application-based and scenario-based questions. Include follow-up and cross-questions based on the candidate’s answers.
// Round 3 (Advanced): Ask complex, real-world, and problem-solving questions. Include strict cross-questioning, edge cases, and deep conceptual understanding.

// Return strictly in JSON format like:
// ["Question 1", "Question 2", "Question 3"]
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     const data = text.replace(/```json|```/g, "").trim();

//     return JSON.parse(data);

//   } catch (error) {
//     console.error("AI Error:", error);
//     throw new Error(error.message);
//   }
// };

// export const evaluateAnswer = async (question, answer) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-flash-latest",
//     });

//     const prompt = `
// Question: ${question}
// User Answer: ${answer}

// Evaluate and return strictly JSON:
// {
//   "score": number (0-10),
//   "skill": "one main skill (e.g. JavaScript, React, DSA, System Design)",
//   "strengths": "...",
//   "weaknesses": "...",
//   "correctAnswer": "..."
// }
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     const data = text.replace(/```json|```/g, "").trim();

//     return JSON.parse(data);

//   } catch (error) {
//     console.error("AI Evaluation Error:", error);
//     throw new Error(error.message);
//   }
// };

// export const generateFinalReportAI = async (answers) => {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-flash-latest",
//     });

//     const prompt = `
// You are an expert interview evaluator.

// Analyze the following interview answers:

// ${JSON.stringify(answers)}

// Return strictly JSON:

// {
//   "summary": "overall performance summary",

//   "techScore": number (0-10),
//   "clarityScore": number (0-10),
//   "confidenceScore": number (0-10),

//   "strongTopics": ["..."],
//   "weakTopics": ["..."],

//   "learningPath": ["step1", "step2", "step3"],

//   "tips": ["tip1", "tip2"]
// }
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     const cleaned = text.replace(/```json|```/g, "").trim();

//     const jsonStart = cleaned.indexOf("{");
//     const jsonEnd = cleaned.lastIndexOf("}");

//     return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

//   } catch (error) {
//     console.error("Final AI Report Error:", error);
//     throw new Error(error.message);
//   }
// };