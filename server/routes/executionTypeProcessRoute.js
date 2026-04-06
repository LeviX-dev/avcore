import express from "express";
import {
  addExecutionType,
  getExecutionTypes,
  updateExecutionType,
  deleteExecutionType,

  addProcess,
  getProcessesByType,
  toggleProcessStatus,
  deleteProcess , 
  updateProcess ,
  addChecklist , getChecklists , updateChecklist ,
  addChecklistItem , getChecklistItemsByChecklist , toggleChecklistItemStatus ,updateChecklistItem ,
   deleteChecklistItem ,getPreExecutionChecklistsWithItems , getExecutionChecklistsWithItems ,



} from "../controllers/executionTypeProcessController.js";

const router = express.Router();

/*
 =================================================
 EXECUTION TYPE ROUTES
 =================================================
*/

router.post("/execution-type", addExecutionType);
router.get("/type/execution-type", getExecutionTypes);
router.put("/execution-type/:id", updateExecutionType);
router.delete("/execution-type/:id", deleteExecutionType);


/*
 =================================================
 PROCESS ROUTES
 =================================================
*/

router.post("/process", addProcess);
router.get("/process/by-type/:typeId", getProcessesByType);
router.put("/process/toggle-status/:id", toggleProcessStatus);
router.delete("/process/:id", deleteProcess);
router.put("/process/:id", updateProcess);


/*
========================================
CHECKLIST ROUTES
========================================
*/
router.post("/checklist", addChecklist)
router.get("/sujit/checklist", getChecklists)
router.put("/checklist/:id", updateChecklist)

/*
========================================
CHECKLIST ITEM ROUTES
========================================
*/
router.post("/checklist-item", addChecklistItem)
router.get("/checklist-item/by-checklist/:checklistId", getChecklistItemsByChecklist)
router.put("/checklist-item/:id", updateChecklistItem)  // New route for updating item
router.put("/checklist-item/toggle-status/:id", toggleChecklistItemStatus)
router.delete("/checklist-item/:id", deleteChecklistItem)  // New route for deleting item

router.get("/sujit/pre-execution-checklists", getPreExecutionChecklistsWithItems);
router.get("/sujit/execution-checklists", getExecutionChecklistsWithItems);
export default router;
