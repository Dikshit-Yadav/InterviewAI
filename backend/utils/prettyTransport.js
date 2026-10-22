import pretty from "pino-pretty";

export default function prettyTransport(options) {
  return pretty({
    ...options,
    messageFormat: (log, messageKey) => {
      const fields = [
        `pid=${log.pid}`,
        `hostname=${log.hostname}`,
        `service=${log.service}`,
        `environment=${log.environment}`,
      ];

      if (log.req) {
        fields.push(
          `req.id=${log.req.id}`,
          `req.method=${log.req.method}`,
          `req.url=${log.req.url}`,
          `req.query=${JSON.stringify(log.req.query)}`,
          `req.remoteAddress=${log.req.remoteAddress}`,
          `req.userAgent=${JSON.stringify(log.req.userAgent)}`,
          `res.statusCode=${log.res?.statusCode}`,
          `responseTime=${log.responseTime}ms`,
        );
      }

      return `${fields.join(" ")} msg=${JSON.stringify(log[messageKey] ?? "")}`;
    },
  });
}
