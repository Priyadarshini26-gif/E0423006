import express from "express";
import env from "./config/env.js";
import schedulerRoutes from "./routes/schedulerRoutes.js";
import { Log } from "../../logging_middleware/src/logger.js";
 
const app = express();
 
 
app.use(express.json());
 
app.use(async (req, _res, next) => {
  await Log(
    "backend", "info", "middleware",
    `Incoming request: ${req.method} ${req.originalUrl}`
  );
  next(); 
});
 
app.use("/api", schedulerRoutes);
 
app.get("/health", (_req, res) => {
  res.status(200).json({
    status:  "ok",
    service: "vehicle-maintenance-scheduler",
    port:    env.PORT,
  });
});
 
 
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error:   "Route not found",
  });
});
 
app.use(async (err, _req, res, _next) => {
  await Log("backend", "error", "middleware", `Unhandled server error: ${err.message}`);
 
  res.status(500).json({
    success: false,
    error:   "Internal server error",
  });
});
  
app.listen(env.PORT, async () => {
  await Log(
    "backend", "info", "route",
    `Vehicle Maintenance Scheduler running on port ${env.PORT}`
  );
});
 
export default app;