import express from "express";
import * as c from "../controllers/scheduleSystemController.js";

const router = express.Router();

router.post("/schedule", c.createSchedule);
router.get("/get/schedules", c.getAllSchedules);
router.get("/schedule/:id", c.getScheduleById);
router.delete("/schedule/:id", c.deleteSchedule);
router.put("/schedule/:id", c.updateSchedule);


router.post("/schedule/mapping", c.saveScheduleMapping);
router.get("/get/schedule/:scheduleId/mapping-details", c.getScheduleMappingWithDetails);

router.get("/get/types", c.getTypes);
router.get("/types/:typeId/processes", c.getProcessesByType);

router.put("/schedule/:id/status", c.updateScheduleStatus);


export default router;
