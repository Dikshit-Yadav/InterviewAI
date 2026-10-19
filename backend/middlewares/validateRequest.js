export const validateRequest = ({ body, params, query } = {}) =>
  (req, res, next) => {
    const errors = [];

    for (const [source, schema] of Object.entries({ body, params, query })) {
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            path: [source, ...issue.path].join("."),
            message: issue.message,
          }))
        );
        continue;
      }

      if (source === "body") {
        req.body = result.data;
      }
    }

    if (errors.length) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    return next();
  };
