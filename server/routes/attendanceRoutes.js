import express from 'express';
import {
  checkIn,
  checkOut,
  autoCheckoutAt8PM , 
  getTodayStatus ,
  getAttendanceReport,
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// for cron / manual trigger
router.post('/auto-checkout', autoCheckoutAt8PM);

router.get('/status', getTodayStatus);

router.get('/report', getAttendanceReport);



export default router;
