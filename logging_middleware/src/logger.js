/**
 * logging_middleware/src/logger.js
 *
 * Reusable Log function — sends structured logs to the test server.
 * Uses ES6 module syntax.
 *
 * Usage:
 *   import { Log } from '../logging_middleware/src/logger.js';
 *   await Log("backend", "info", "route", "Server started on port 3000");
 */

import axios from "axios";
import "dotenv/config";

// ─── Valid field values (as per test server constraints) ─────────────────────

const VALID_STACKS = ["backend", "frontend"];

const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];

const VALID_PACKAGES = [
  // backend only
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service",
  // frontend only
  "api", "component", "hook", "page", "state", "style",
  // shared
  "auth", "config", "middleware", "utils",
];

// ─── Internal: validate all fields before sending ────────────────────────────

const validateFields = (stack, level, pkg, message) => {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack: "${stack}". Allowed: ${VALID_STACKS.join(", ")}`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level: "${level}". Allowed: ${VALID_LEVELS.join(", ")}`);
  }
  if (!VALID_PACKAGES.includes(pkg)) {
    throw new Error(`Invalid package: "${pkg}". Allowed: ${VALID_PACKAGES.join(", ")}`);
  }
  if (!message || typeof message !== "string" || message.trim() === "") {
    throw new Error("Log message must be a non-empty string.");
  }
};

// ─── Internal: print formatted log line to console ───────────────────────────

const printToConsole = (stack, level, pkg, message) => {
  const timestamp = new Date().toISOString();
  const levelPadded = level.toUpperCase().padEnd(5);
  console.log(`[${timestamp}] [${levelPadded}] [${stack}:${pkg}] ${message}`);
};

// ─── Main exported Log function ───────────────────────────────────────────────

/**
 * Log(stack, level, pkg, message)
 *
 * @param {string} stack   - "backend" | "frontend"
 * @param {string} level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg     - package name (see valid list above)
 * @param {string} message - descriptive log message
 * @returns {Promise<object|null>} - server response or null on failure
 */
export const Log = async (stack, level, pkg, message) => {
  try {
    // Validate before doing anything
    validateFields(stack, level, pkg, message);

    // Always print to console for local visibility
    printToConsole(stack, level, pkg, message);

    const token = process.env.AUTH_TOKEN;
    const logApiUrl =
      process.env.LOG_API_URL || "http://4.224.186.213/evaluation-service/logs";

    if (!token) {
      console.error("[Logger] AUTH_TOKEN missing in .env — log not sent to server.");
      return null;
    }

    // Send log to the test server
    const response = await axios.post(
      logApiUrl,
      { stack, level, package: pkg, message },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // { logID, message }

  } catch (error) {
    // Never crash the calling application due to a logger failure
    if (error.response) {
      console.error(`[Logger] Server error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("[Logger] No response from log server:", error.message);
    } else {
      console.error("[Logger] Log failed:", error.message);
    }
    return null;
  }
};