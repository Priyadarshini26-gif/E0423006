import { Router } from "express";
import {
  getAllNotifications,
  getPriorityNotifications,
} from "../controllers/notificationController.js";
 
const router = Router();
 
router.get("/", getAllNotifications);
 
router.get("/priority", getPriorityNotifications);
 
export default router;