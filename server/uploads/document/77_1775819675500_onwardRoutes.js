import express from "express";
import { getExecutionLeads, getLatestQuotationByMasterId, generateMRN, getExecutionLeadDetails, getMRNListByMasterId, getMRNDetailsByNumber, getMRNDetailsById, getVerificationPendingMRNs,  verifyMRN, getVerifiedMRNs,getApprovalItems, approveMRN , getPurchaseItemsByMRN, getApprovedMRNs, issueMRNItems, getIssueItems, getMRNsForIssueAndPurchase, getMRNLogs, approvePurchaseRequest, createPurchaseOrder, receivePurchaseOrder, issueMRN, getVendors, getGeneratedPOList, getCompletedMRNs } from "../controllers/onwardController.js";

import { uploadBillImages } from '../middleware/billUpload.js';

const router = express.Router();

router.get('/exectuted/leads', getExecutionLeads);

router.get("/getquotationofmrn/:master_id", getLatestQuotationByMasterId);

router.post("/generate-mrn", generateMRN);

router.get("/execution-lead/:master_id", getExecutionLeadDetails);

router.get("/mrn-list/:master_id", getMRNListByMasterId);

router.get("/mrn-details/:mrn_number", getMRNDetailsByNumber);

// router.post('/issue-items', issueItemsController);

router.get('/mrn-details-by-id/:mrn_id', getMRNDetailsById);

// router.post('/send-for-purchase', sendForPurchaseController);

router.get("/verification/pending", getVerificationPendingMRNs);
// router.get("/waiting/issuedmrn", getWaitingForIssuedMRNs);

router.post("/verify-mrn", verifyMRN);

router.get('/verified/leads', getVerifiedMRNs);

router.get("/approval/items", getApprovalItems);

router.post("/approve-mrn", approveMRN);

router.get("/issuable/mrn", getMRNsForIssueAndPurchase);

//this is for issue popup
router.get("/approve/mrn", getApprovedMRNs);

router.post("/issue-mrn", issueMRNItems);

router.get("/issue/mrn", getIssueItems);

router.get("/mrn/logs/:mrn_id", getMRNLogs);

router.get("/purchase/items", getPurchaseItemsByMRN);

router.post("/purchase-request/approve", approvePurchaseRequest);

router.post("/purchase-order/create", createPurchaseOrder);

router.get("/get/vendors", getVendors);

router.get("/purchase/orders", getGeneratedPOList);

router.post("/purchase-order/receive", uploadBillImages , receivePurchaseOrder);

router.post("/mrn/issue", issueMRN);

router.get("/completed/mrns", getCompletedMRNs);
  

// router.post('/processmrncontroller', processMRNController);

// router.post("/verify-mrnnnn", verifyController);

export default router;
