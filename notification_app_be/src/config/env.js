import "dotenv/config";
 
const env = {
  PORT:                 process.env.PORT || 3000,
  AUTH_TOKEN:           process.env.AUTH_TOKEN,
  LOG_API_URL:          process.env.LOG_API_URL || "http://4.224.186.213/evaluation-service/logs",
  NOTIFICATION_API_URL: process.env.NOTIFICATION_API_URL || "http://4.224.186.213/evaluation-service/notifications",
};
 
if (!env.AUTH_TOKEN) {
  console.error("[Config] AUTH_TOKEN is missing in .env");
}
 
export default env;