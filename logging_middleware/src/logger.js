

import axios from "axios";
import "dotenv/config";

//Valid field values 

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


const printToConsole = (stack, level, pkg, message) => {
  const timestamp = new Date().toISOString();
  const levelPadded = level.toUpperCase().padEnd(5);
  console.log(`[${timestamp}] [${levelPadded}] [${stack}:${pkg}] ${message}`);
};

// Main exported Log function 

export const Log = async (stack, level, pkg, message) => {
  try {
    validateFields(stack, level, pkg, message);

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

    return response.data; 

  } catch (error) {
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