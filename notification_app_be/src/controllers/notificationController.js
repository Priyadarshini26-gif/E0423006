import { Log } from "../../../logging_middleware/src/logger.js";
import { fetchNotifications, getTopNNotifications } from "../services/notificationService.js";
  
export const getAllNotifications = async (req, res) => {
  await Log("backend", "info", "controller", "Received request: GET /api/v1/notifications");
 
  try {
    const notifications = await fetchNotifications();
 
    const { type } = req.query;
    const filtered = type
      ? notifications.filter((n) => n.Type.toLowerCase() === type.toLowerCase())
      : notifications;
 
    await Log("backend", "info", "controller", `Returning ${filtered.length} notifications`);
 
    return res.status(200).json({
      success: true,
      data: { notifications: filtered, total: filtered.length },
    });
 
  } catch (error) {
    await Log("backend", "error", "controller", `getAllNotifications failed: ${error.message}`);
 
    return res.status(500).json({ success: false, error: error.message });
  }
};
  
export const getPriorityNotifications = async (req, res) => {
  const n = parseInt(req.query.n, 10) || 10;
 
  await Log("backend", "info", "controller",
    `Received request: GET /api/v1/notifications/priority?n=${n}`
  );
 
  try {
    const topN = await getTopNNotifications(n);
 
    await Log("backend", "info", "controller", `Returning top ${topN.length} priority notifications`);
 
    return res.status(200).json({
      success: true,
      data: { count: topN.length, notifications: topN },
    });
 
  } catch (error) {
    await Log("backend", "error", "controller", `getPriorityNotifications failed: ${error.message}`);
 
    return res.status(500).json({ success: false, error: error.message });
  }
};