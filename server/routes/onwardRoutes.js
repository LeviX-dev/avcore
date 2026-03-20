import express from "express";
import { getExecutionLeads, getClosedLeadsDataExe } from "../controllers/onwardController.js";

const router = express.Router();

router.get("/sujit/execution/getleads", getExecutionLeads);

// router.get("/execution/getleads/:user_id", getExecutionLeads);

router.get('/get/closed-leads', getClosedLeadsDataExe);

export default router;
