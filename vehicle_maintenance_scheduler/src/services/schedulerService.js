import axios from "axios";
import env from "../config/env.js";
import { Log } from "../../../logging_middleware/src/logger.js";
 
const getAuthHeaders = () => ({
  "Authorization": `Bearer ${env.AUTH_TOKEN}`,
  "Content-Type":  "application/json",
});
 
export const fetchDepots = async () => {
  await Log("backend", "info", "service", "Fetching depots from test server");
 
  try {
    const response = await axios.get(env.DEPOT_API_URL, {
      headers: getAuthHeaders(),
    });
 
    const { depots } = response.data;
 
    await Log("backend", "info", "service", `Successfully fetched ${depots.length} depots`);
 
    return depots;
 
  } catch (error) {
    await Log("backend", "error", "service", `Failed to fetch depots: ${error.message}`);
    throw new Error("Unable to fetch depots from the test server");
  }
};
 
export const fetchVehicles = async () => {
  await Log("backend", "info", "service", "Fetching vehicles from test server");
 
  try {
    const response = await axios.get(env.VEHICLE_API_URL, {
      headers: getAuthHeaders(),
    });
 
    const { vehicles } = response.data;
 
    await Log("backend", "info", "service", `Successfully fetched ${vehicles.length} vehicle tasks`);
 
    return vehicles;
 
  } catch (error) {
    await Log("backend", "error", "service", `Failed to fetch vehicles: ${error.message}`);
    throw new Error("Unable to fetch vehicles from the test server");
  }
};
 
const knapsack = (vehicles, capacity) => {
  const n = vehicles.length;
 
  const dp = Array.from(
    { length: n + 1 },
    () => new Array(capacity + 1).fill(0)
  );
 
  for (let i = 1; i <= n; i++) {
    const { Duration, Impact } = vehicles[i - 1]; 
 
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
 
      if (Duration <= w) {
        const valueIfIncluded = dp[i - 1][w - Duration] + Impact;
 
        if (valueIfIncluded > dp[i][w]) {
          dp[i][w] = valueIfIncluded;
        }
      }
    }
  }
 
  const selectedTasks = [];
  let remainingCapacity = capacity;
 
  for (let i = n; i > 0; i--) {
    if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
      selectedTasks.push(vehicles[i - 1]);
      remainingCapacity -= vehicles[i - 1].Duration;
    }
  }
 
  return {
    selectedTasks,
    totalImpact:   dp[n][capacity],
    totalDuration: selectedTasks.reduce((sum, task) => sum + task.Duration, 0),
  };
};
 
export const runScheduler = async () => {
  await Log("backend", "info", "service", "Starting vehicle maintenance scheduler");
 
  const [depots, vehicles] = await Promise.all([fetchDepots(), fetchVehicles()]);
 
  await Log(
    "backend", "debug", "service",
    `Running knapsack for ${depots.length} depots with ${vehicles.length} vehicle tasks`
  );
 
  const results = depots.map((depot) => {
    const { ID, MechanicHours } = depot;
 
    const { selectedTasks, totalImpact, totalDuration } = knapsack(vehicles, MechanicHours);
 
    return {
      depotId:        ID,
      mechanicHours:  MechanicHours,          // total budget
      totalDuration,                           // hours used
      hoursRemaining: MechanicHours - totalDuration,
      totalImpact,                             // score achieved
      tasksScheduled: selectedTasks.length,
      selectedTasks,
    };
  });
 
  await Log("backend", "info", "service", `Scheduler completed for all ${depots.length} depots`);
 
  return results;
};
 