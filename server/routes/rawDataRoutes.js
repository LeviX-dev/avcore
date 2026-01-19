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
getEmployeeLeadWorkReport,
getEmployeeWiseAssignedLeadCount, deleteDocument , getQuotationPendingLeads ,
 
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
router.post('/master-data/:master_id', deleteClient);

router.post('/master-data/delete-multiple', deleteMultipleClients);

router.post('/master-data/add-single', addSingleRawData);

router.post('/upload/:master_id', uploadMiddleware, uploadDocuments); 
// routes/documents.js (or your existing routes file)

router.delete('/document/:doc_id', deleteDocument);



router.get('/documents/:master_id', getDocumentsByMasterId);

router.get('/leadstage', getLeadStage);
router.get('/quickremark', getQuickRemark);

router.get('/getcompleterawdata', getCompleteRawData);

router.get('/getinactiveleaddetails', getInactiveLeadDetails); 

router.post("/add", addReassignment);
router.post('/add/bulk', addBulkReassignment);
router.get("/history/:master_id", getReassignmentByMaster);


// 📌 🔥 NEW — DROP & CLOSED LEADS






router.get('/dashboard/drop-leads-fulldata', getDropLeadsFullData); 



router.get('/dashboard/close-leads-fulldata', getClosedLeadsFullData); 


router.get('/dashboard/miss-assign-fulldata', getMissedAssignedFullData); 


router.get('/dashboard/todays-assign-fulldata', getTodaysAssignedLeadsFullData); 



 

router.get('/dashboard/upcoming-assign-fulldata', getUpcomingAssignedFullData); 


router.get('/reports/employee-leadwork-report', getEmployeeLeadWorkReport); 

router.get('/reports/employee-detailed', getEmployeeWiseAssignedLeadCount);

router.get('/quotation-pending', getQuotationPendingLeads);

export default router;
