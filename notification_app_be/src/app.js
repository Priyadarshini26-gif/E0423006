import express from "express";
import env from "./config/env.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { Log } from "../../logging_middleware/src/logger.js";
 
const app = express();
 
app.use(express.json());
 
app.use(async (req, _res, next) => {
  await Log("backend", "info", "middleware", `${req.method} ${req.url}`);
  next();
});
 
app.use("/api/v1/notifications", notificationRoutes);
 
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "notification-app-be" });
});
 
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});
 
app.use(async (err, _req, res, _next) => {
  await Log("backend", "error", "middleware", `Unhandled error: ${err.message}`);
  res.status(500).json({ success: false, error: "Internal server error" });
});
 
app.listen(env.PORT, async () => {
  await Log("backend", "info", "route", `Notification App BE running on port ${env.PORT}`);
});
 
export default app;