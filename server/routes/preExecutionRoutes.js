import express from 'express';
import { 
  getPreExecutionLeadsData,
  getSchedulesForDropdown,
  createExecutionStart,
  getAllStartedExecutions,
  deleteExecutionStart,
  getScheduleMappingWithDetails,
  getExecutionPrefill,
  updateExecution,
  updateExecutionLeads,
  getExecutionHistory,
  getExecutionLogsForLead,
  getExecutionLogs,
  getExecutionById,
  getAllChecklistsWithItems,  // This is now added
  saveChecklistSelections,     // New function
  getChecklistSelections,      // New function
  checkLeadHasChecklistItems   // New function
} from '../controllers/preExecutionController.js';

const router = express.Router();

// Existing routes
router.get('/closed-leads', getPreExecutionLeadsData);
router.get('/schedules', getSchedulesForDropdown);
router.get("/schedule-mapping/:scheduleId", getScheduleMappingWithDetails);
router.post('/start', createExecutionStart);
router.put('/update/:execution_id', updateExecution);
router.get('/all', getAllStartedExecutions);
router.delete('/:id', deleteExecutionStart);
router.get("/prefill/:masterId", getExecutionPrefill);
router.post('/update-leads/:execution_id', updateExecutionLeads);
router.get('/history/:execution_id', getExecutionHistory);
router.get('/logs/:leadId', getExecutionLogsForLead);
router.get("/execution-logs/:execution_id", getExecutionLogs);
router.get("/checklists", getAllChecklistsWithItems);  // This will now work
router.get("/:execution_id", getExecutionById);

// NEW ROUTES for checklist functionality (Run button enable/disable)
router.get('/check-items/:master_id', checkLeadHasChecklistItems);
router.post('/save-checklist/:master_id', saveChecklistSelections);
router.get('/get-checklist/:master_id', getChecklistSelections);

export default router;