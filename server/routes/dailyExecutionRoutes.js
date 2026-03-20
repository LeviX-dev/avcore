import express from "express";
import { 
  getDailyExecutionProcesses,
  uploadExecutionDocuments,
  getExecutionDocuments,
  updateDocumentManagerStatus , getManagerDocumentDashboard , getDocumentDetails ,
  getManagerProcesses ,deleteExecutionDocument ,updateExecutionDocument , 
} from "../controllers/dailyExecutionController.js";
import uploadMiddleware from '../middleware/upload.js';

const router = express.Router();

// TEST
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Daily Execution API OK",
    session: req.session?.user
  });
});

// ✅ CURRENT USER PROCESSES
router.get("/my-processes", getDailyExecutionProcesses);

// Document upload and retrieval
router.post("/upload/:execution_id/:process_id", uploadMiddleware, uploadExecutionDocuments);
router.get("/upload/:execution_id/:process_id", getExecutionDocuments);



// ✅ NEW: Update document manager status (Admin only)
router.put("/document/:document_id/status", updateDocumentManagerStatus);
router.delete("/document/:document_id", deleteExecutionDocument);
router.put("/document/:document_id", uploadMiddleware, updateExecutionDocument);


router.get("/dashboard", getManagerDocumentDashboard);

// GET: Single document details
router.get("/document/:document_id", getDocumentDetails);

router.get("/manager-processes", getManagerProcesses);



export default router;