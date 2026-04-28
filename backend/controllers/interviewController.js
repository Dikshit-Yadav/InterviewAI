import InterviewSession from "../models/InterviewSession.js";
import Question from "../models/Question.js";
import Report from "../models/Report.js";
import { generateQuestions, evaluateAnswer } from "../services/aiService.js";
import Answer from "../models/Answer.js";

export const startInterview = async (req, res) => {
  try {
    const { role, experience, interviewType } = req.body;

    if (!role || !experience || !interviewType) {
      return res.status(400).json({ message: "All fields required" });
    }

    const session = await InterviewSession.create({
      userId: req.user.id,
      role,
      experience,
      interviewType,
    });

    console.log(session);


    // grnerate questions from AI
    const questions = await generateQuestions(role, experience, interviewType);

    const questionDocs = questions.map((q, index) => ({
      interviewId: session._id,
      questionText: q,
      order: index + 1,
    }));

    await Question.insertMany(questionDocs);

    res.status(200).json({
      message: "Interview started",
      interviewId: session._id,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getQuestions = async (req, res) => {
  try{
  const { id } = req.params;
  const questions = await Question.find({ interviewId: id }).sort({ order: 1 });

  res.json(questions);
} catch (err) {
  res.status(500).json({ message: err.message });
}
};

export const submitAnswer = async (req, res) => {
  try {
    const { questionId, interviewId, answer } = req.body;

    const question = await Question.findById(questionId);

    const evaluation = await evaluateAnswer(
      question.questionText,
      answer
    );

    const saved = await Answer.create({
      questionId,
      interviewId,
      userAnswer: answer,
      aiEvaluation: evaluation,
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const answers = await Answer.find({ interviewId: id });

    if (!answers.length) {
      return res.status(400).json({ message: "No answers found" });
    }

    const totalScore = answers.reduce(
      (sum, a) => sum + (a.aiEvaluation?.score || 0),
      0
    );

    const avgScore = totalScore / answers.length;

    const strengths = answers.map(a => a.aiEvaluation?.strengths).join(" ");
    const weaknesses = answers.map(a => a.aiEvaluation?.weaknesses).join(" ");

    const report = await Report.create({
      interviewId: id,
      totalScore,
      averageScore: avgScore,
      strengths,
      weaknesses,
      suggestions: "Practice more and focus on weak areas.",
    });
    console.log(report)
    res.json(report);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};