// walletService.js
import db from '../database/db.js';

/**
 * Core wallet operations: debit, credit, hold, reversal
 * All mutations use DB transactions for safety
 * NEVER update wallet_balance without a matching wallet_transactions row
 */

export const WalletService = {
  /**
   * Credit wallet (topup, reversal, manual)
   */
  async creditWallet({ userId, amount, initiatedBy, referenceType, referenceId = null, remarks = null, adminNote = null, status = 'approved' }) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // Get current balance
      const [[user]] = await conn.query('SELECT wallet_balance, total_credited FROM users WHERE user_id = ?', [userId]);
      if (!user) throw new Error('User not found');
      const balanceBefore = parseFloat(user.wallet_balance);
      const balanceAfter = balanceBefore + parseFloat(amount);
      // Insert transaction
      await conn.query(
        `INSERT INTO wallet_transactions
          (user_id, initiated_by, transaction_type, reference_type, reference_id, amount, balance_before, balance_after, status, remarks, admin_note)
         VALUES (?, ?, 'credit', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, initiatedBy, referenceType, referenceId, amount, balanceBefore, balanceAfter, status, remarks, adminNote]
      );
      // Update user wallet
      await conn.query(
        'UPDATE users SET wallet_balance = ?, total_credited = total_credited + ? WHERE user_id = ?',
        [balanceAfter, amount, userId]
      );
      await conn.commit();
      return { success: true, balance: balanceAfter };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Debit wallet (expense deduction, manual)
   */
  async debitWallet({ userId, amount, initiatedBy, referenceType, referenceId = null, remarks = null, adminNote = null, status = 'approved' }) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // Get current balance
      const [[user]] = await conn.query('SELECT wallet_balance, total_debited FROM users WHERE user_id = ?', [userId]);
      if (!user) throw new Error('User not found');
      const balanceBefore = parseFloat(user.wallet_balance);
      // ALLOW NEGATIVE BALANCE: Remove insufficient balance check
      const balanceAfter = balanceBefore - parseFloat(amount);
      // Insert transaction
      await conn.query(
        `INSERT INTO wallet_transactions
          (user_id, initiated_by, transaction_type, reference_type, reference_id, amount, balance_before, balance_after, status, remarks, admin_note)
         VALUES (?, ?, 'debit', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, initiatedBy, referenceType, referenceId, amount, balanceBefore, balanceAfter, status, remarks, adminNote]
      );
      // Update user wallet
      await conn.query(
        'UPDATE users SET wallet_balance = ?, total_debited = total_debited + ? WHERE user_id = ?',
        [balanceAfter, amount, userId]
      );
      await conn.commit();
      return { success: true, balance: balanceAfter };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Hold wallet (direct expense, pending approval)
   */
  async holdWallet({ userId, amount, initiatedBy, referenceType, referenceId = null, remarks = null, adminNote = null, status = 'pending' }) {
    if (amount <= 0) throw new Error('Amount must be positive');
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      // Get current balance
      const [[user]] = await conn.query('SELECT wallet_balance FROM users WHERE user_id = ?', [userId]);
      if (!user) throw new Error('User not found');
      const balanceBefore = parseFloat(user.wallet_balance);
      // ALLOW NEGATIVE BALANCE: Remove insufficient balance check
      const balanceAfter = balanceBefore - parseFloat(amount);
      // Insert hold transaction (status: pending)
      await conn.query(
        `INSERT INTO wallet_transactions
          (user_id, initiated_by, transaction_type, reference_type, reference_id, amount, balance_before, balance_after, status, remarks, admin_note)
         VALUES (?, ?, 'hold', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, initiatedBy, referenceType, referenceId, amount, balanceBefore, balanceAfter, status, remarks, adminNote]
      );
      // Deduct wallet immediately
      await conn.query(
        'UPDATE users SET wallet_balance = ? WHERE user_id = ?',
        [balanceAfter, userId]
      );
      await conn.commit();
      return { success: true, balance: balanceAfter };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Reversal (refund on rejection)
   */
  async reversal({ userId, amount, initiatedBy, referenceType, referenceId = null, remarks = null, adminNote = null, status = 'approved' }) {
    // reversal is a credit
    return this.creditWallet({ userId, amount, initiatedBy, referenceType, referenceId, remarks, adminNote, status });
  }
};

export default WalletService;