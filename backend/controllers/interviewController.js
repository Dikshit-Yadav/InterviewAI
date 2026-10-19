import {
  createInterviewSession,
  fetchInterviewQuestions,
  generateReportService,
  submitInterviewService,
  assertInterviewOwner,
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

    await assertInterviewOwner(req.user.id, id);
    const questions = await fetchInterviewQuestions(id);

    res.status(200).json(questions);

  } catch (error) {
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
    res.status(err.status || 400).json({ message: err.message });
  }
};
