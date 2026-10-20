import mammoth from "mammoth";
import pdf from "pdf-parse";

const MAX_RESUME_TEXT_LENGTH = 25_000;

export const extractResumeText = async (file) => {
  if (!file) {
    throw Object.assign(new Error("Choose a PDF or DOCX resume"), { status: 400 });
  }

  let text;
  if (file.mimetype === "application/pdf") {
    if (!file.buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      throw Object.assign(new Error("The uploaded file is not a valid PDF"), { status: 400 });
    }
    try {
      const result = await pdf(file.buffer);
      text = result.text;
    } catch {
      throw Object.assign(new Error("Could not read this PDF. Try a text-based PDF."), {
        status: 400,
      });
    }
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    if (!file.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) {
      throw Object.assign(new Error("The uploaded file is not a valid DOCX"), { status: 400 });
    }
    try {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    } catch {
      throw Object.assign(new Error("Could not read this DOCX file"), { status: 400 });
    }
  } else {
    throw Object.assign(new Error("Upload a PDF or DOCX resume"), { status: 400 });
  }

  const cleanedText = (typeof text === "string" ? text : "")
    .replace(/\0/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
  if (cleanedText.length < 100) {
    throw Object.assign(
      new Error("Could not read enough text from this resume. Try a text-based PDF or DOCX."),
      { status: 400 }
    );
  }

  return cleanedText.slice(0, MAX_RESUME_TEXT_LENGTH);
};
