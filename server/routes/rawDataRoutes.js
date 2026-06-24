import express from 'express';
import multer from 'multer';
import {
  getAllRawData,
  importRawData,
  updateRawData,
  deleteClient, deleteMultipleClients  ,addSingleRawData  , uploadDocuments ,
   getDocumentsByMasterId, getLeadStage, getQuickRemark, getCompleteRawData, getInactiveLeadDetails
   ,addReassignment ,  getReassignmentByMaster , addBulkReassignment , 

getDropLeadsFullData, 
getClosedLeadsFullData ,
getMissedAssignedFullData ,
getTodaysAssignedLeadsFullData ,
getUpcomingAssignedFullData, 
getEmployeeLeadWorkReport, deleteDocument , getQuotationPendingLeads , 
getDemoLeadsFullData  ,  getQuotationFollowupLeadsFullData , getDashboardLeadOverview , 
getSimpleLeadReport , getLeadHistory , getEmployeeLeadsWithHistory ,getAssignedMissTodaysLeadsFullData ,
 
getEmployeeWorkReport , getEmployeeWorkReportFilters , 
getEmployeeLeadList ,getEmployeeDetailedReport  ,getQuotationClosedLeads ,
  toggleFavorite, 
    getFavorites, 
    checkFavorite,
    getFavoritesBatch ,
  updateLocationLink ,
updateContactNumbersOnly ,  checkDuplicateLeadContact , 
getBudgetRanges , 

} from '../controllers/rawDataController.js';
import uploadMiddleware from '../middleware/upload.js';

const router = express.Router();
const upload = multer();


// Add route for fetching users
router.get('/master-data', getAllRawData);

// Add this route
// router.get('/other-inputs/:master_id', getOtherInputs);

router.post('/master-data/import', upload.single('file'), importRawData);
router.put('/master-data/:master_id', updateRawData); 

router.put('/master-data/:master_id/contact-numbers', updateContactNumbersOnly);

router.get('/budget-ranges', getBudgetRanges);



// DELETE single - use DELETE method with URL parameter
router.delete('/master-data/:master_id', deleteClient);

// DELETE multiple - use POST with body
router.post('/master-data/delete-multiple', deleteMultipleClients);



router.post('/sujit-master-data/add-single', addSingleRawData);

router.post(
  "/sujit-master-data/check-duplicate-contact",
  checkDuplicateLeadContact
);


router.post('/upload/:master_id', uploadMiddleware, uploadDocuments); 
router.put('/update-location/:master_id', updateLocationLink);

// routes/documents.js (or your existing routes file)

router.delete('/document/:doc_id', deleteDocument);

router.get('/documents/:master_id', getDocumentsByMasterId);

router.get('/leadstage', getLeadStage);
router.get('/quickremark', getQuickRemark);

router.get('/getcompleterawdata', getCompleteRawData);

// for fev 
router.post('/favorites/toggle/:master_id', toggleFavorite);
router.get('/favorites', getFavorites);
router.get('/favorites/check/:master_id', checkFavorite);
router.post('/favorites/batch', getFavoritesBatch);


router.get('/getinactiveleaddetails', getInactiveLeadDetails); 

router.post("/add", addReassignment);
router.post('/add/bulk', addBulkReassignment);
router.get("/history/:master_id", getReassignmentByMaster);


// 📌 🔥 NEW — DROP & CLOSED LEADS

router.get('/dashboard/drop-leads-fulldata', getDropLeadsFullData); 


router.get('/dashboard/close-leads-fulldata', getClosedLeadsFullData); 


router.get('/dashboard/demo-leads-fulldata', getDemoLeadsFullData);

// router.get('/dashboard/quotation-pending-leads-fulldata', getQuotationPendingLeadsFullData);

router.get('/dashboard/quotation-followup-leads-fulldata', getQuotationFollowupLeadsFullData);



router.get('/dashboard/miss-assign-fulldata', getMissedAssignedFullData); 


router.get('/dashboard/todays-assign-fulldata', getTodaysAssignedLeadsFullData); 


router.get('/dashboard/upcoming-assign-fulldata', getUpcomingAssignedFullData); 


router.get('/reports/employee-leadwork-report', getEmployeeLeadWorkReport);  

router.get('/reports/leadworks-report', getDashboardLeadOverview); 

router.get("/simple-lead-report", getSimpleLeadReport);

router.get("/lead-history/:master_id", getLeadHistory);


router.get("/reports/employee-detailed", getEmployeeDetailedReport);

router.get("/reports/employee-leads/:employee/:type", getEmployeeLeadList);

router.get("/reports/employee-leads/:employee", getEmployeeLeadsWithHistory);


router.get('/quotation-pending', getQuotationPendingLeads);


router.get('/dashboard/assigned-miss-todays-leads-fulldata', getAssignedMissTodaysLeadsFullData);


router.get("/employee-work-report", getEmployeeWorkReport);

router.get('/employee-work-report/filters', getEmployeeWorkReportFilters);

router.get('/getQuotationClosedLeads', getQuotationClosedLeads); 




export default router;
