
import express from 'express';
import {
  getEmployeeWiseStats,
  getCategoryWiseStats,
  getVendorWiseStats,
  getProjectWiseStats,
  getMonthlyTrendStats,
} from '../controllers/expenseStatsController.js';

const router = express.Router();

router.get('/employees', getEmployeeWiseStats);
router.get('/categories', getCategoryWiseStats);
router.get('/vendors', getVendorWiseStats);
router.get('/projects', getProjectWiseStats);
router.get('/monthly-trend', getMonthlyTrendStats);

export default router;