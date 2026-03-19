import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { connectDB } from "./db";
import { reconnectAllSessions, checkExpiredSubscriptions } from "./whatsapp";
import pino from "pino";

const app = express();
const httpServer = createServer(app);

// --- CORS setup (allow frontend requests) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow all domains
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// --- SILENT LOGGER FOR WHATSAPP (BAILEYS) ---
export const silentLogger = pino({ level: "silent", enabled: false });

// --- HTTP module augmentation to store rawBody ---
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// --- Parse JSON and capture raw body ---
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// --- Simple Express logger ---
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// --- Request logging middleware ---
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && !path.startsWith("/api/auth")) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// --- Main async bootstrap ---
(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    log("Connected to MongoDB", "db");

    // Register routes
    await registerRoutes(httpServer, app);

    // Express error handler
    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("Internal Server Error:", err);

      if (res.headersSent) return next(err);

      res.status(status).json({ message });
    });

    // --- START SERVER ---
    const port = parseInt(process.env.PORT || "5000", 10);

    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
      },
      () => {
        log(`Server running on port ${port}`);
      },
    );

    // --- Reconnect WhatsApp sessions after 5s ---
    setTimeout(() => {
      reconnectAllSessions();
    }, 5000);

    // --- Check expired subscriptions every hour ---
    setInterval(checkExpiredSubscriptions, 60 * 60 * 1000);

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
})();
