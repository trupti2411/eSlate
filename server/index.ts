import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { securityHeaders, auditMiddleware } from "./security";
import { execSync } from "child_process";

const app = express();

// Initialize global file storage
global.uploadedFiles = global.uploadedFiles || new Map();

app.use(securityHeaders);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(auditMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Graceful shutdown handlers
process.on("SIGTERM", () => {
  log("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  log("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

// Catch unhandled promise rejections to prevent silent crashes
process.on("unhandledRejection", (reason, promise) => {
  log(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});

function freePort(port: number) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
    if (pids) {
      pids.split("\n").forEach((pid) => {
        const pidNum = parseInt(pid.trim(), 10);
        if (pidNum && pidNum !== process.pid) {
          try {
            process.kill(pidNum, "SIGKILL");
            log(`Killed stale process ${pidNum} on port ${port}`);
          } catch {}
        }
      });
    }
  } catch {}
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 80 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} in use — clearing stale process and retrying...`);
      freePort(port);
      setTimeout(() => {
        server.close();
        server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
          log(`serving on port ${port}`);
        });
      }, 1000);
    } else {
      log(`Server error: ${err.message}`);
      throw err;
    }
  });

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
