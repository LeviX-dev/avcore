import express from 'express';
import { getClosedLeadsDataExe  ,getProcessesByLead, saveProcess , getProcessLogs , 
  updateProcessStatusOnly ,
} from '../controllers/executionController.js';

const router = express.Router();

// Get closed leads data only
router.get('/sujit/get/closed-leads', getClosedLeadsDataExe); 

// Get all processes for a lead
router.get("/execution/processes/:leadId", getProcessesByLead);

// Save (Insert or Update)
router.post("/execution/save-process", saveProcess);

router.put(
  "/execution/update-process-status",
  updateProcessStatusOnly
);

router.get(
  "/execution/process-logs/:leadId/:processId",
  getProcessLogs
);

export default router;