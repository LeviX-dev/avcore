import express from 'express';
import uploadMiddleware from '../middleware/upload.js';
import {
  submitTopupRequest,
  getMyTopupRequests,
  getMyWalletBalance,
  getMyTransactions,
  getTransactionDetail,
  getAllTopupRequests,
  approveTopupRequest,
  rejectTopupRequest,
  getAllUsersWithWallet,
  getUserTransactions,
  manualAdjustWallet,
  getUsersList,
  getAllWalletTransactions
} from '../controllers/walletController.js';

const router = express.Router();

// --- USER ROUTES ---
router.post('/topup-request', uploadMiddleware, submitTopupRequest);
router.get('/topup-requests', getMyTopupRequests);
router.get('/balance', getMyWalletBalance);
router.get('/transactions', getMyTransactions);
router.get('/transactions/:id', getTransactionDetail);
router.get('/users-list', getUsersList);

// --- ADMIN ROUTES ---
router.get('/admin/wallet/topup-requests', getAllTopupRequests);
router.put('/admin/wallet/topup-requests/:id/approve', approveTopupRequest);
router.put('/admin/wallet/topup-requests/:id/reject', rejectTopupRequest);
router.get('/admin/wallet/users', getAllUsersWithWallet);
router.get('/admin/wallet/users/:id/transactions', getUserTransactions);
router.post('/admin/wallet/users/:id/adjust', manualAdjustWallet);

// After other admin routes:
router.get('/admin/wallet/all-transactions', getAllWalletTransactions);
export default router;
