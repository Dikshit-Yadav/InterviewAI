import ejs from "ejs";
import { fileURLToPath } from "node:url";

const emailTemplatePath = fileURLToPath(
  new URL("../ejs/registerEmailTemplate.ejs", import.meta.url)
);

const getMailjetConfig = () => {
  const { MAILJET_API_KEY, MAILJET_API_SECRET, MAILJET_FROM_EMAIL, MAILJET_FROM_NAME } =
    process.env;

  if (!MAILJET_API_KEY || !MAILJET_API_SECRET || !MAILJET_FROM_EMAIL) {
    throw new Error("Mailjet environment variables are not configured");
  }

  return {
    apiKey: MAILJET_API_KEY,
    apiSecret: MAILJET_API_SECRET,
    fromEmail: MAILJET_FROM_EMAIL,
    fromName: MAILJET_FROM_NAME || "InterviewAI",
  };
};

export const sendOtpEmail = async (email, code, purpose) => {
  const config = getMailjetConfig();
  const passwordReset = purpose === "password-reset";
  const subject = passwordReset
    ? "Reset your InterviewAI password"
    : "Verify your InterviewAI email";
  const action = passwordReset ? "reset your password" : "verify your email address";
  const html = await ejs.renderFile(emailTemplatePath, { code, action });

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      Messages: [
        {
          From: { Email: config.fromEmail, Name: config.fromName },
          To: [{ Email: email }],
          Subject: subject,
          TextPart: `Your InterviewAI code to ${action} is ${code}. It expires in 10 minutes.`,
          HTMLPart: html,
        },
      ],
    }),
  });

  const responseBody = await response.text();
  let result;
  try {
    result = responseBody ? JSON.parse(responseBody) : {};
  } catch {
    throw new Error(`Mailjet returned an invalid response (${response.status})`);
  }

  if (!response.ok) {
    const providerMessage = result.Messages?.[0]?.Errors
      ?.map((item) => item.ErrorMessage)
      .filter(Boolean)
      .join("; ");
    throw new Error(
      providerMessage
        ? `Mailjet delivery failed (${response.status}): ${providerMessage}`
        : `Mailjet delivery failed (${response.status})`
    );
  }

  if (result.Messages?.[0]?.Status !== "success") {
    const providerMessage = result.Messages?.[0]?.Errors
      ?.map((item) => item.ErrorMessage)
      .filter(Boolean)
      .join("; ");
    throw new Error(
      providerMessage
        ? `Mailjet did not accept the message: ${providerMessage}`
        : "Mailjet did not accept the message"
    );
  }
};
