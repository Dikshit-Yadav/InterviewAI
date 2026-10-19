import {
  createInterviewSession,
  fetchInterviewQuestions,
  submitAnswerService,
  generateReportService,
} from "../services/interviewServices.js";

export const startInterview = async (req, res) => {
  try {
    const { role, experience, interviewType } = req.body;

    const session = await createInterviewSession(
      req.user.id,
      role,
      experience,
      interviewType
    );

    res.status(200).json({
      message: "Interview started",
      interviewId: session._id,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    const questions = await fetchInterviewQuestions(id);

    res.status(200).json(questions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { questionId, interviewId, answer } = req.body;

    const result = await submitAnswerService(
      questionId,
      interviewId,
      answer
    );

    res.status(200).json(result);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await generateReportService(id);

    res.status(200).json(report);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};