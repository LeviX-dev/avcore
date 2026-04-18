import express from 'express';
import {
  getDateWiseReport,
  getProjectWiseReport,
  getCategoryWiseReport,
  getVendorWiseReport,
  getPaymentModeReport,
  exportToExcel,
  exportToPDF,
  getDashboardSummary,
  getEmployeeWiseReport
} from '../controllers/expenseReportController.js';

const router = express.Router();
    
// Report endpoints
router.get('/reports/date_wise', getDateWiseReport);
router.get('/reports/project_wise', getProjectWiseReport);
router.get('/reports/category_wise', getCategoryWiseReport);
router.get('/reports/vendor_wise', getVendorWiseReport);
router.get('/reports/payment_mode', getPaymentModeReport);
router.get('/reports/employee_wise', getEmployeeWiseReport);
// Export endpoints
router.get('/reports/export/excel', exportToExcel);
router.get('/reports/export/pdf', exportToPDF);

// Dashboard
router.get('/reports/dashboard', getDashboardSummary);

export default router;