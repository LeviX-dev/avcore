import db from '../database/db.js';

export const WalletService = {
  /**
   * Process top-up with Accountant: Debit from Accountant, Credit to Employee
   * Uses users table for wallet balances
   */
  async processTopUpWithAccountant(topUpRequest, accountantId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { employee_id, amount, id } = topUpRequest;

      // 1. Get Accountant's current balance
      const [accountantRows] = await connection.query(
        'SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE',
        [accountantId]
      );

      if (!accountantRows.length) {
        throw new Error('Accountant not found');
      }

      const accountantBalanceBefore = Number(accountantRows[0].wallet_balance);

      // if (accountantBalanceBefore < amount) {
      //   throw new Error(`Insufficient balance in Accountant's wallet. Available: ₹${accountantBalanceBefore.toLocaleString('en-IN')}`);
      // }

      // 2. Get Employee's current balance
      const [employeeRows] = await connection.query(
        'SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE',
        [employee_id]
      );

      if (!employeeRows.length) {
        throw new Error('Employee not found');
      }

      const employeeBalanceBefore = Number(employeeRows[0].wallet_balance);

      // 3. Debit from Accountant's Wallet
      await connection.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance - ?,
             total_debited = total_debited + ?
         WHERE user_id = ?`,
        [amount, amount, accountantId]
      );

      // 4. Credit to Employee's Wallet
      await connection.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance + ?,
             total_credited = total_credited + ?
         WHERE user_id = ?`,
        [amount, amount, employee_id]
      );

      // 5. Record Accountant Wallet Transaction (DEBIT)
      const [accountantTx] = await connection.query(
        `INSERT INTO wallet_transactions (
          user_id, initiated_by, transaction_type, 
          reference_type, reference_id, amount, 
          balance_before, balance_after, status, remarks
        ) VALUES (?, ?, 'debit', 'top_up_debit', ?, ?, ?, ?, 'approved', ?)`,
        [
          accountantId,
          accountantId,
          id,
          amount,
          accountantBalanceBefore,
          accountantBalanceBefore - amount,
          `Top-up debit: ₹${amount.toLocaleString('en-IN')} for Employee #${employee_id}`
        ]
      );

      // 6. Record Employee Wallet Transaction (CREDIT)
      const [employeeTx] = await connection.query(
        `INSERT INTO wallet_transactions (
          user_id, initiated_by, transaction_type, 
          reference_type, reference_id, amount, 
          balance_before, balance_after, status, remarks
        ) VALUES (?, ?, 'credit', 'top_up_credit', ?, ?, ?, ?, 'approved', ?)`,
        [
          employee_id,
          accountantId,
          id,
          amount,
          employeeBalanceBefore,
          employeeBalanceBefore + amount,
          `Top-up credited: ₹${amount.toLocaleString('en-IN')} from Accountant #${accountantId}`
        ]
      );

      // 7. Update top_up_request with transaction IDs
      await connection.query(
        `UPDATE top_up_requests 
         SET accountant_wallet_transaction_id = ?,
             employee_wallet_transaction_id = ?
         WHERE id = ?`,
        [accountantTx.insertId, employeeTx.insertId, id]
      );

      await connection.commit();

      // Get updated balances
      const [updatedAccountant] = await connection.query(
        'SELECT wallet_balance FROM users WHERE user_id = ?',
        [accountantId]
      );

      const [updatedEmployee] = await connection.query(
        'SELECT wallet_balance FROM users WHERE user_id = ?',
        [employee_id]
      );

      return {
        success: true,
        accountantTransactionId: accountantTx.insertId,
        employeeTransactionId: employeeTx.insertId,
        accountantBalanceAfter: Number(updatedAccountant[0].wallet_balance),
        employeeBalanceAfter: Number(updatedEmployee[0].wallet_balance)
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Credit wallet (for top-ups, manual adjustments)
   */
  async creditWallet({ userId, amount, initiatedBy, referenceType, referenceId, remarks, adminNote, status = 'approved' }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // ✅ Get current balance with FOR UPDATE to lock the row
      const [userRows] = await connection.query(
        'SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE',
        [userId]
      );

      if (!userRows.length) {
        throw new Error('User not found');
      }

      const balanceBefore = Number(userRows[0].wallet_balance);

      await connection.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance + ?,
             total_credited = total_credited + ?
         WHERE user_id = ?`,
        [amount, amount, userId]
      );

      await connection.query(
        `INSERT INTO wallet_transactions (
          user_id, initiated_by, transaction_type,
          reference_type, reference_id, amount,
          balance_before, balance_after, status, remarks, admin_note
        ) VALUES (?, ?, 'credit', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          initiatedBy,
          referenceType,
          referenceId || null,
          amount,
          balanceBefore,
          balanceBefore + amount,
          status || 'approved',
          remarks || null,
          adminNote || null
        ]
      );

      await connection.commit();

      return { success: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Debit wallet (for expenses, manual adjustments)
   */
async debitWallet({ userId, amount, initiatedBy, referenceType, referenceId, remarks, adminNote, status = 'approved' }) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ✅ FOR UPDATE locks the row to prevent race conditions
    const [userRows] = await connection.query(
      'SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE',
      [userId]
    );



      if (!userRows.length) {
        throw new Error('User not found');
      }

      const balanceBefore = Number(userRows[0].wallet_balance);

      // if (balanceBefore < amount) {
      //   throw new Error(`Insufficient balance. Available: ₹${balanceBefore.toLocaleString('en-IN')}`);
      // }

      await connection.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance - ?,
             total_debited = total_debited + ?
         WHERE user_id = ?`,
        [amount, amount, userId]
      );

      await connection.query(
        `INSERT INTO wallet_transactions (
          user_id, initiated_by, transaction_type,
          reference_type, reference_id, amount,
          balance_before, balance_after, status, remarks, admin_note
        ) VALUES (?, ?, 'debit', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          initiatedBy,
          referenceType,
          referenceId || null,
          amount,
          balanceBefore,
          balanceBefore - amount,
          status || 'approved',
          remarks || null,
          adminNote || null
        ]
      );

      await connection.commit();

      return { success: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Reversal (for rejected expenses)
   */
  async reversal({ userId, amount, initiatedBy, referenceType, referenceId, remarks, adminNote, status = 'approved' }) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // ✅ Get current balance with FOR UPDATE to lock the row
      const [userRows] = await connection.query(
        'SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE',
        [userId]
      );

      if (!userRows.length) {
        throw new Error('User not found');
      }

      const balanceBefore = Number(userRows[0].wallet_balance);

      await connection.query(
        `UPDATE users 
         SET wallet_balance = wallet_balance + ?,
             total_credited = total_credited + ?
         WHERE user_id = ?`,
        [amount, amount, userId]
      );

      await connection.query(
        `INSERT INTO wallet_transactions (
          user_id, initiated_by, transaction_type,
          reference_type, reference_id, amount,
          balance_before, balance_after, status, remarks, admin_note
        ) VALUES (?, ?, 'reversal', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          initiatedBy,
          referenceType,
          referenceId || null,
          amount,
          balanceBefore,
          balanceBefore + amount,
          status || 'approved',
          remarks || null,
          adminNote || null
        ]
      );

      await connection.commit();

      return { success: true };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};