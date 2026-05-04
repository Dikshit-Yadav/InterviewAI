import InterviewSession from "../models/InterviewSession.js";
import Report from "../models/Report.js";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import { generateQuestions, evaluateAnswer, generateFinalReportAI } from "../services/aiService.js";

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
      skill: evaluation.skill,
    });

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const answers = await Answer.find({ interviewId: id })
      .populate("questionId")
      .sort({ createdAt: 1 });
      console.log(answers.length);


    if (answers.length<= 0) {
      return res.status(400).json({ message: "No answers found" });
    }

    const totalScore = answers.reduce(
      (sum, a) => sum + (a.aiEvaluation?.score || 0),
      0
    );

    const averageScore = totalScore / answers.length;

    const formattedAnswers = answers.map((a) => ({
      questionId: a.questionId?._id,
      question: a.questionId?.questionText,
      userAnswer: a.userAnswer,
      aiEvaluation: a.aiEvaluation,
    }));

    const aiReport = await generateFinalReportAI(formattedAnswers);

    const report = await Report.create({
      interviewId: id,

      totalScore,
      averageScore,

      techScore: aiReport.techScore,
      clarityScore: aiReport.clarityScore,
      confidenceScore: aiReport.confidenceScore,

      summary: aiReport.summary,

      strongTopics: aiReport.strongTopics,
      weakTopics: aiReport.weakTopics,

      learningPath: aiReport.learningPath,
      tips: aiReport.tips,

      answers: formattedAnswers,
    });

    res.json(report);

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ message: err.message });
  }
};