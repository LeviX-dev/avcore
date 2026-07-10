import express from 'express';
const router = express.Router();
import uploadMiddleware from '../middleware/upload.js';
import {
  getExpenseOptions,
  getExpenses,
  createExpense,
  updateExpense,
  updateExpenseStatus,
  updateDraftStatus,
  makeExpenseFromDraft,
  deleteExpense,
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  resubmitExpense,

} from '../controllers/expenseController.js';
import { getMonthlyTrendStats, getProjectWiseStats } from '../controllers/expenseStatsController.js';

// ─── Expense Options (projects, vendors, employees) ──────────────────────────
router.get('/expense/options', getExpenseOptions);

// ─── Expenses ────────────────────────────────────────────────────────────────
// GET  /api/v1/expense?status=approved|pending|rejected|draft
router.get('/expense', getExpenses);
router.post('/expense', uploadMiddleware, createExpense);
// Add this route
router.post('/expense/:id/resubmit', resubmitExpense);
router.put('/expense/:id', uploadMiddleware, updateExpense);
router.put('/expense/:id/draft-status', updateDraftStatus); // Admin: approve/reject draft_pending
router.post('/expense/:id/make-expense', makeExpenseFromDraft); // Employee: convert draft_approved to expense
router.delete('/expense/:id', deleteExpense);

// Admin approve / reject
// PATCH /api/v1/expense/:id/status  { status: 'approved'|'rejected', status_remark? }
router.patch('/expense/:id/status', updateExpenseStatus);

// ─── Expense Categories ───────────────────────────────────────────────────────
router.get('/expense/categories', getExpenseCategories);
router.post('/expense/categories', createExpenseCategory);
router.put('/expense/categories/:id', updateExpenseCategory);
router.delete('/expense/categories/:id', deleteExpenseCategory);


router.get('/stats/projects', getProjectWiseStats);
router.get('/stats/monthly-trend', getMonthlyTrendStats);


export default router;