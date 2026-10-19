import {
  createInterviewSession,
  fetchInterviewQuestions,
  generateReportService,
  submitInterviewService,
  assertInterviewOwner,
} from "../services/interviewServices.js";
import logger from "../utils/logger.js";

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
    logger.error({ err: error, requestId: req.id }, "Could not start interview");
    res.status(400).json({ message: error.message });
  }
};


export const getQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    await assertInterviewOwner(req.user.id, id);
    const questions = await fetchInterviewQuestions(id);

    res.status(200).json(questions);

  } catch (error) {
    if ((error.status || 500) >= 500) {
      logger.error({ err: error, requestId: req.id }, "Could not load interview questions");
    }
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    await assertInterviewOwner(req.user.id, id);
    const report = await generateReportService(id);

    res.status(200).json(report);

  } catch (err) {
    if ((err.status || 400) >= 500) {
      logger.error({ err, requestId: req.id }, "Could not generate interview report");
    }
    res.status(err.status || 400).json({ message: err.message });
  }
};
export const submitInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const report = await submitInterviewService(req.user.id, id, answers);

    res.status(200).json(report);

  } catch (err) {
    if ((err.status || 400) >= 500) {
      logger.error({ err, requestId: req.id }, "Could not submit interview");
    }
    res.status(err.status || 400).json({ message: err.message });
  }
};
