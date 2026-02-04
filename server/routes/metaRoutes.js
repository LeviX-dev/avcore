import express from "express";
import { 
    getMetaLeads , 
    importMetaLeadsRoundRobin ,

 } from "../controllers/metaController.js";

const router = express.Router();

router.get("/meta-leads", getMetaLeads);

// router.post("/meta-import-test", importSingleMetaLead);


router.post("/meta-import-test", importMetaLeadsRoundRobin);



export default router;
