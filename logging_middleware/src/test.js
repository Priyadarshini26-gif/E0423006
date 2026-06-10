
import { Log } from "./logger.js";

const runTests = async () => {
  console.log("=== Logging Middleware Tests ===\n");

  // Valid log levels
  await Log("backend", "info",  "route",      "Server started on port 3000");
  await Log("backend", "debug", "db",         "Database connection established");
  await Log("backend", "warn",  "handler",    "Request payload exceeds recommended size");
  await Log("backend", "error", "handler",    "Received string, expected boolean");
  await Log("backend", "fatal", "db",         "Critical database connection failure");

  // Invalid inputs 
  console.log("\n--- Invalid inputs (expect validation errors) ---");
  await Log("mobile",   "info",    "handler", "Invalid stack");
  await Log("backend",  "verbose", "handler", "Invalid level");
  await Log("backend",  "info",    "unknown", "Invalid package");

  console.log("\n=== Tests Complete ===");
};

runTests();