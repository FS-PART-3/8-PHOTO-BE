import pino from "pino";

const logger = pino({
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
});

export default logger;
