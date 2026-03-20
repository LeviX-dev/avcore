import express from 'express';
import { getClosedLeadsDataExe  ,getProcessesByLead, saveProcess , getProcessLogs , 
} from '../controllers/executionController.js';

const router = express.Router();

// Get closed leads data only
router.get('/get/closed-leads', getClosedLeadsDataExe); 

// Get all processes for a lead
router.get("/execution/processes/:leadId", getProcessesByLead);

// Save (Insert or Update)
router.post("/execution/save-process", saveProcess);

router.get(
  "/execution/process-logs/:leadId/:processId",
  getProcessLogs
);

export default router;