// routes/avCoreDocumentRoutes.js
import express from "express";
import { 
  getAVCoreDocuments, 
  uploadAVCoreDocument, 
  deleteAVCoreDocument,
  updateDocumentStatus
} from '../controllers/avCoreDocumentController.js';
import uploadMiddleware from '../middleware/upload.js';

const router = express.Router();

// Add a test route first to verify router is working
router.get("/test-av", (req, res) => {
  res.json({ 
    success: true, 
    message: "AV Core Documents router is working!",
    timestamp: new Date().toISOString()
  });
});

// AV Core Document routes
router.get("/av/av-core-documents", getAVCoreDocuments);
router.post("/av-core-documents/upload", uploadMiddleware, uploadAVCoreDocument);
router.put("/av-core-documents/:id/status", updateDocumentStatus);
router.delete("/av-core-documents/:id", deleteAVCoreDocument);

console.log("AV Core Document routes registered:");
console.log("  - GET /api/av-core-documents");
console.log("  - POST /api/av-core-documents/upload");
console.log("  - PUT /api/av-core-documents/:id/status");
console.log("  - DELETE /api/av-core-documents/:id");
console.log("  - GET /api/test-av");

export default router;