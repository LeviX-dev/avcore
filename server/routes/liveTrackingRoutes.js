
import { Router } from "express";
import { core } from "./attendanceRoutes.js";

const router = Router();
const lt = core.liveTracking;

router.post("/heartbeat", lt.liveTrackingHeartbeat);
router.get("/history/:employee_id", lt.getLiveTrackingHistory);
router.get("/active", lt.getActiveLiveTracking);
router.get("/session/:employee_id", lt.getCurrentSessionTracking);
router.get("/route/:employee_id", lt.getHistoricalRoute);
router.get("/shift-status", lt.getLiveTrackingShiftStatus);

export default router;
