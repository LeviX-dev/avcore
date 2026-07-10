import express from "express";
import { createCampaign, getAllCampaigns, updateCampaign , createStudent , 
    getAllStudents , assignCampLeads } from "../controllers/campaignController.js";

const router = express.Router();

router.post("/create", createCampaign);
router.get("/all", getAllCampaigns);
router.put("/update/:id", updateCampaign); // ✅ New update route


router.post("/create-form", createStudent);
router.get("/get-all", getAllStudents);


router.post("/assign-camp", assignCampLeads);



export default router;
