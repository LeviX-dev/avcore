
import express from "express";
import { getTotalLeadCount, getAssignedLeadCount, getfollowups, 
    getMeetingScheduled, getcategory, getProducts,getConvertedLeads,
     getTotalCampaignCount, getInactiveLeadCount , getTodaysAssignedLeads ,
     getUpcomingAssignedCount , getMissedAssignedCount ,
          getDropLeads,          // 🔥 Added
  getClosedLeads  ,
    getLeadStageSummary ,
getCategorySummary ,
getReferenceSummary ,
getBudgetRangeSummary,


     } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard/lead-count", getTotalLeadCount);
router.get("/master-data/assigned-count", getAssignedLeadCount);

router.get("/master-data/todays-assigned-count", getTodaysAssignedLeads);


router.get("/master-data/upcoming-assigned-count", getUpcomingAssignedCount); 


router.get("/master-data/missed-assigned-count", getMissedAssignedCount); 


router.get("/master-data/fllowups", getfollowups);
router.get("/master-data/meeting-scheduled", getMeetingScheduled);
router.get("/master-data/category", getcategory);
router.get("/master-data/product", getProducts);
router.get("/master-data/converted-leads", getConvertedLeads);

router.get("/master-data/campaign-count", getTotalCampaignCount);


router.get('/leads/inactive-count', getInactiveLeadCount);

router.get('/leads/drop', getDropLeads);
router.get('/leads/closed', getClosedLeads); 

router.get('/lead-summary', getLeadStageSummary);
router.get('/category-summary', getCategorySummary);
router.get('/reference-summary', getReferenceSummary);

router.get(
  '/budget-range-summary',
  getBudgetRangeSummary
);


export default router;















// import express from 'express';
// import { getClients, getParts, getProducts, getCompletedParts,getPartsInProgress, getPartsOnHold, getPartsUnderReview, getPendingParts } from './../controllers/dashboardController.js';

// const router = express.Router();

// router.get('/total-clients', getClients);
// router.get('/total-parts', getParts);
// router.get('/total-products', getProducts);
// router.get('/completed-parts', getCompletedParts);
// router.get('/pending-parts', getPendingParts);
// router.get('/parts-under-review', getPartsUnderReview);
// router.get('/parts-in-progress', getPartsInProgress);
// router.get('/parts-on-hold', getPartsOnHold);




// export default router;
