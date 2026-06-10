import { Log } from "../../../logging_middleware/src/logger.js";
 
const errorHandler = async (err, req, res, _next) => {
  await Log(
    "backend", "error", "middleware",
    `Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`
  );
 
  const statusCode = err.statusCode || 500;
 
  return res.status(statusCode).json({
    success: false,
    error:   err.message || "Internal server error",
  });
};
 
export default errorHandler;