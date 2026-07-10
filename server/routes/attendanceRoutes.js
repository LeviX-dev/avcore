import express from 'express';
import {
  checkIn,
  checkOut,
  autoCheckoutAt8PM , 
  getTodayStatus ,
  getAttendanceReport,
} from '../controllers/attendanceController.js';
import db from '../database/db.js';
import { createAttendanceCore } from "../attendance-core/index.js";

const core = createAttendanceCore(db /*, { SHIFT_GRACE_MINUTES: 15 } */);

const a = core.attendance;
const router = express.Router();

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// for cron / manual trigger
router.post('/auto-checkout', autoCheckoutAt8PM);

router.get('/status', getTodayStatus);

router.get('/report', getAttendanceReport);





// ---- Reads ----
router.get("/by-date", a.getAttendanceByDate);
router.get("/details/:employee_id", a.getAttendanceDetails);
router.get("/summary-by-date", a.getAttendanceSummaryByDate);
router.get("/range", a.getAttendanceRange);
router.get("/by-month", a.getAttendanceByMonth);
router.get("/daily-summary", a.getDailyAttendanceSummary);
router.get("/today-shift", a.getTodayShift);
router.get("/today-holiday", a.getTodayHoliday);

// ---- Dashboard ----
router.get("/dashboard/stats", a.getDashboardStats);
router.get("/dashboard/monthly", a.getDashboardMonthlyStats);
router.get("/dashboard/20-day-trend", a.getDashboard20DayTrend);

// ---- Self-service check-in/out ----
router.post("/checkin2", a.addCheckin);
router.post("/checkout2", a.updateCheckout);
router.post("/append", a.appendAttendanceController);

// ---- Admin full add/update/delete ----
router.post("/add", a.addAttendanceNewController);
router.put("/update", a.updateAttendanceController);
router.delete("/:id", a.deleteAttendanceController);
router.delete("/log/:log_id", a.deleteLogController);

// ---- Bulk generation ----
router.post("/generate-year", a.generateYearAttendance);

export default router;

export { core };
