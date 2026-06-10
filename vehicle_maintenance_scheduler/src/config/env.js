import "dotenv/config";
 
const env = {
  PORT: process.env.PORT || 4000,
 
  AUTH_TOKEN: process.env.AUTH_TOKEN,
 
  // Test server API URLs
  LOG_API_URL:     process.env.LOG_API_URL     || "http://4.224.186.213/evaluation-service/logs",
  DEPOT_API_URL:   process.env.DEPOT_API_URL   || "http://4.224.186.213/evaluation-service/depots",
  VEHICLE_API_URL: process.env.VEHICLE_API_URL || "http://4.224.186.213/evaluation-service/vehicles",
};
 
if (!env.AUTH_TOKEN) {
  console.error("[Config] WARNING: AUTH_TOKEN is missing in .env — all API calls will fail.");
}
 
export default env;