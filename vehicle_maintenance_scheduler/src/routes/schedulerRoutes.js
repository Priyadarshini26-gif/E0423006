import { Router } from "express";
import {
  getSchedule,
  getDepots,
  getVehicles,
} from "../controllers/schedulerController.js";
 
const router = Router();
 
router.get("/schedule", getSchedule);
 
router.get("/depots",   getDepots);
router.get("/vehicles", getVehicles);
 
export default router;
