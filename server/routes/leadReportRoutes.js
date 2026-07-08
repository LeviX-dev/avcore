import express from 'express';

import { 
  getLeadWiseReport, 
  getLeadWiseReportSummary 
} from '../controllers/leadReportController.js';

const router = express.Router(); // ✅ correct

router.get('/lead-wise-report', getLeadWiseReport);
router.get('/lead-wise-report/summary', getLeadWiseReportSummary);

export default router;