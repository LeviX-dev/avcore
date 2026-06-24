import express from 'express';
import { getAssignedTeleCallerData, getReportDataByMasterId , 
    getAssignedLeads , getEmployeeAssignedSummary , getOverallAssignedLeads , 
    getLeadsCount , getOverviewReport , getOverviewReportDetails , 

 } from '../controllers/reportController.js';

const router = express.Router();
router.get("/counts-leads", getLeadsCount);

router.get("/assigned-summary", getEmployeeAssignedSummary);
router.get("/assigned-leads", getAssignedLeads);
router.get("/overall-leads", getOverallAssignedLeads);

router.get('/data', getAssignedTeleCallerData);

router.get('/:master_id', getReportDataByMasterId); 


router.get(
  "/admin/overview-report",
  getOverviewReport
);

router.get(
  "/admin/overview-report/details",
  getOverviewReportDetails
);


export default router;
