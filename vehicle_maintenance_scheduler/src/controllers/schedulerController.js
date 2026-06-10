import { Log } from "../../../logging_middleware/src/logger.js";
import {
  runScheduler,
  fetchDepots,
  fetchVehicles,
} from "../services/schedulerService.js";
 

export const getSchedule = async (req, res) => {
  await Log("backend", "info", "controller", "Request received: GET /api/schedule");
 
  try {
    const results = await runScheduler();
 
    await Log(
      "backend", "info", "controller",
      `Returning schedule for ${results.length} depots`
    );
 
    return res.status(200).json({
      success: true,
      message: "Optimal maintenance schedule computed successfully",
      data:    results,
    });
 
  } catch (error) {
    await Log("backend", "error", "controller", `getSchedule failed: ${error.message}`);
 
    return res.status(500).json({
      success: false,
      error:   error.message,
    });
  }
};
 
export const getDepots = async (req, res) => {
  await Log("backend", "info", "controller", "Request received: GET /api/depots");
 
  try {
    const depots = await fetchDepots();
 
    return res.status(200).json({
      success: true,
      data:    depots,
    });
 
  } catch (error) {
    await Log("backend", "error", "controller", `getDepots failed: ${error.message}`);
 
    return res.status(500).json({
      success: false,
      error:   error.message,
    });
  }
};
 
export const getVehicles = async (req, res) => {
  await Log("backend", "info", "controller", "Request received: GET /api/vehicles");
 
  try {
    const vehicles = await fetchVehicles();
 
    return res.status(200).json({
      success: true,
      data:    vehicles,
    });
 
  } catch (error) {
    await Log("backend", "error", "controller", `getVehicles failed: ${error.message}`);
 
    return res.status(500).json({
      success: false,
      error:   error.message,
    });
  }
};