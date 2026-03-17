import pino from "pino";

// Silent logger for Baileys (no output)
export const silentLogger = pino({
  level: "silent",
  enabled: false,   // Ensure nothing is printed
});
