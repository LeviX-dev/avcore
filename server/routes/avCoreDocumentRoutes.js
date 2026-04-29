import express from "express";
import { 
  getAVCoreDocuments, 
  uploadAVCoreDocument, 
  deleteAVCoreDocument 
} from '../controllers/avCoreDocumentController.js';
import uploadMiddleware from '../middleware/upload.js';

const router = express.Router();

// AV Core Document routes
router.get("/av-core-documents", getAVCoreDocuments);
router.post("/av-core-documents/upload", uploadMiddleware, uploadAVCoreDocument);
router.delete("/av-core-documents/:id", deleteAVCoreDocument);

export default router;