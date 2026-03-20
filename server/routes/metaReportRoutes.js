import express from "express";
import {
    storeMetaLeadsForReport,
    getMetaLeadsReport,
    getMetaCities,
    triggerMetaStore,
    getMetaSummary,
    getMetaLeadDetails
} from "../controllers/metaReportController.js";

const router = express.Router();

// Get paginated Meta leads report (for your React component)
router.get("/sujit/meta-leads", getMetaLeadsReport);

// Get summary statistics
router.get("/sujit/meta-summary", getMetaSummary);

// Get distinct cities for filter
router.get("/sujit/meta-cities", getMetaCities);

// Get single lead details
router.get("/sujit/meta-lead/:id", getMetaLeadDetails);

// Manually trigger storing Meta leads
router.post("/meta-store", triggerMetaStore);

// Alternative endpoint for manual store
router.post("/meta-store-leads", storeMetaLeadsForReport);

export default router;