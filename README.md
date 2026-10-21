# InterviewAI

InterviewAI is an AI-assisted interview preparation application. Users can
practice role-specific interviews, review their resumes, generate questions
from resume content, and build a downloadable resume.

## Features

- Email registration with Mailjet verification codes, Google sign-in, and
  password reset.
- Authenticated dashboard with interview history, progress, and reports.
- Configurable mock interviews by role, experience level, and interview type.
- AI-generated interview questions, answer-dependent follow-ups, and feedback
  reports.
- Resume review with ATS-oriented recommendations and practice questions.
- Resume-based interview questions, including questions about listed projects.
- Resume builder with repeatable experience, project, and education entries,
  a preview, and browser-based PDF download.
- Light and dark themes.
- Interview answer entry by keyboard or speech recognition. The active session
  disables common copy, cut, and paste actions in the browser.

> Copy/paste restrictions are client-side browser behavior and are not a
> security boundary.

## Technology

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Zod
- **Backend:** Node.js, Express, MongoDB with Mongoose, Pino
- **AI:** Groq API
- **Email:** Mailjet API
- **Authentication:** JWT cookies and Google OAuth

## Project layout

```text
InterviewAI/
├── backend/       Express API and MongoDB services
├── frontend/      React application
└── README.md
```

Install and run the frontend and backend separately. Use two terminals from the
repository root.

## Requirements

- Node.js compatible with the installed Vite and TypeScript versions.
- npm.
- A MongoDB connection string.
- A Groq API key for AI interview and resume features.
- Mailjet API credentials and a verified sender for email verification and
  password reset.
- Google OAuth credentials if Google sign-in is required.

## Local setup

### 1. Configure the backend

Create `backend/.env` and set the following values:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-long-random-secret>

GROQ_API_KEY=<your-groq-api-key>
# Optional model overrides:
# GROQ_INTERVIEW_MODEL=openai/gpt-oss-20b
# GROQ_RESUME_MODEL=openai/gpt-oss-20b
# GROQ_EVAL_MODEL=openai/gpt-oss-20b
# GROQ_REPORT_MODEL=openai/gpt-oss-120b

MAILJET_API_KEY=<your-mailjet-api-key>
MAILJET_API_SECRET=<your-mailjet-api-secret>
MAILJET_FROM_EMAIL=<verified-sender-email>
MAILJET_FROM_NAME=InterviewAI

# Required only for Google sign-in:
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_CALLBACK_URL=<your-backend-google-callback-url>

# Optional logging level, for example: debug, info, warn, or error
LOG_LEVEL=debug
```

Configure the Google OAuth client to allow the callback URL used in
`GOOGLE_CALLBACK_URL`. Keep backend credentials private and never commit `.env`
files.

Install backend dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

The API listens on port `5000` by default (or the configured `PORT`). Its root
endpoint is `GET /`.

### 2. Configure the frontend

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
```

Install frontend dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL when it starts, typically
`http://localhost:5173`. The frontend origin must match the backend's
`CLIENT_URL` setting so credentialed API requests are allowed.

## Available scripts

Run these commands from the corresponding `frontend/` or `backend/` directory.

| Package | Command | Description |
| --- | --- | --- |
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run build` | Type-check and create a production build |
| Frontend | `npm run preview` | Serve the built frontend locally |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm test` | Run frontend Vitest tests |
| Backend | `npm run dev` | Start the API with nodemon |
| Backend | `npm start` | Start the API with Node.js |

## API overview

All endpoints are served by the backend. Protected endpoints require the
authenticated cookie.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register/send-code` | Send a registration verification code |
| `POST` | `/auth/register/verify-code` | Verify a registration code |
| `POST` | `/auth/register` | Register a verified email address |
| `POST` | `/auth/login` | Sign in with email and password |
| `GET` | `/auth/google` | Begin Google sign-in |
| `GET` | `/auth/google/callback` | Handle the Google OAuth callback |
| `GET` | `/auth/me` | Return the current authenticated user |
| `POST` | `/auth/logout` | Sign out |
| `POST` | `/auth/password/forgot` | Send a password reset code |
| `POST` | `/auth/password/reset` | Set a new password using the code |
| `GET` | `/dashboard` | Load dashboard data |
| `GET` | `/history` | Load interview history |
| `PUT` | `/profile/update` | Update the current user's profile |
| `POST` | `/interview/start` | Start a configured mock interview |
| `POST` | `/interview/start-from-resume` | Start an interview based on an uploaded resume |
| `POST` | `/interview/review-resume` | Review an uploaded resume |
| `GET` | `/interview/questions/:id` | Get questions for an interview |
| `POST` | `/interview/follow-up/:id` | Request an answer-dependent follow-up |
| `POST` | `/interview/submit/:id` | Submit interview answers |
| `POST` | `/interview/generate-report/:id` | Generate interview feedback |

Resume upload endpoints accept one PDF or DOCX file up to 5 MB.

## Privacy and security notes

- Do not commit secrets, OAuth credentials, API keys, or `.env` files.
- Resume files are processed in memory by the backend and are not saved by the
  resume upload flow. Resume content is sent to the configured AI provider for
  review or question generation.
- The resume builder keeps entered details in frontend state for preview and
  PDF printing; it does not upload them to the backend.
- Browser copy/paste restrictions can be bypassed and should not be relied on
  to protect interview content.

## Troubleshooting

- **API requests fail or CORS errors appear:** verify the frontend's
  `VITE_API_URL` and that backend `CLIENT_URL` exactly matches the frontend
  origin.
- **MongoDB connection fails:** check `MONGO_URI`, network access, and database
  availability.
- **AI features fail:** verify `GROQ_API_KEY` and check backend logs for provider
  or model errors. Optional model variables can select supported Groq models.
- **Verification or password reset email fails:** verify the Mailjet API
  credentials and ensure `MAILJET_FROM_EMAIL` is an approved sender.
- **Google sign-in fails:** verify the client ID, secret, callback URL, and
  authorized redirect URI in the Google OAuth configuration.
