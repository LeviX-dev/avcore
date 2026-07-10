import express from 'express';
const router = express.Router();
import {
  requestTopUp,
  approveStage1,
  approveAccountant,
  rejectTopUp,
  cancelTopUp,        // ✅ ADD THIS
  getTopUpRequests,
  getTopUpRequestById
} from '../controllers/topUpController.js';

// ─── Employee Routes ──────────────────────────────────────────────────────────

// Request a top-up
router.post('/topup/request', requestTopUp);

// Get my top-up requests (or all based on role)
router.get('/topup/requests', getTopUpRequests);

// Cancel my own top-up request
router.patch('/topup/:id/cancel', cancelTopUp);  // ✅ ADD THIS

// ─── Stage 1: PM/HR Approve ──────────────────────────────────────────────────

// PM or HR approves Stage 1
router.patch('/topup/:id/approve-stage1', approveStage1);

// ─── Stage 2: Accountant Approve ─────────────────────────────────────────────

// Accountant final approval
router.patch('/topup/:id/approve-accountant', approveAccountant);

// ─── Reject ──────────────────────────────────────────────────────────────────

// Reject top-up request (PM/HR/Accountant)
router.patch('/topup/:id/reject', rejectTopUp);

// ─── Get Single Request ──────────────────────────────────────────────────────

// Get single top-up request
router.get('/topup/:id', getTopUpRequestById);

export default router;