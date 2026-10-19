# Backend logging

The API uses Pino for structured JSON logs written to standard output.

- HTTP requests are logged with a request ID, method, path (without query parameters), and response status.
- Successful requests use `info`, client errors use `warn`, and server errors use `error`.
- Startup, MongoDB connection, OAuth, AI-provider, and handled controller failures use structured log records.
- Request bodies, headers, cookies, passwords, tokens, and OAuth client secrets are not included in request logs; configured sensitive fields are redacted.
- The default level is `debug` outside production and `info` in production. Set `LOG_LEVEL` to override it (for example, `warn` or `error`).

The process manager or hosting platform should collect and retain stdout/stderr. The API does not write log files itself.
