import db from '../database/db.js';

/**
 * Get all notifications for the logged-in user
 * with unread count and pagination.
 */
export const getNotifications = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userId = user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Count unread
    const [[unreadResult]] = await db.query(
      `SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
    const unreadCount = unreadResult.unread_count;

    // Fetch paginated notifications
    const [notifications] = await db.query(
      `SELECT id, title, message, link, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Total count for pagination
    const [[totalResult]] = await db.query(
      `SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total: totalResult.total,
          page,
          limit,
          totalPages: Math.ceil(totalResult.total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark a single notification as read.
 */
export const markAsRead = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const userId = user.id;

    const [result] = await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

/**
 * Mark all notifications as read for the user.
 */
export const markAllAsRead = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userId = user.id;
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

/**
 * Internal helper: Create a notification for a specific user.
 * Used by other controllers.
 */
export const createNotification = async (userId, title, message, link = null) => {
  try {


    console.log("------ notification is creating -------")
    await db.query(
      `INSERT INTO notifications (user_id, title, message, link, is_read) VALUES (?, ?, ?, ?, 0)`,
      [userId, title, message, link]
    );
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * (Optional) Delete a notification (admin only).
 */
export const deleteNotification = async (req, res) => {
  try {
    const user = req.session?.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { id } = req.params;
    await db.query(`DELETE FROM notifications WHERE id = ?`, [id]);

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete' });
  }
};


export const sendFollowUpReminders = async () => {
  try {
    console.log(' Checking follow-up reminders...', new Date().toISOString());

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8);
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
    const endTime = fiveMinutesLater.toTimeString().slice(0, 8);

    const [leads] = await db.query(
      `
      SELECT 
        rd.master_id,
        rd.name,
        rd.followup_time,
        rd.followup_date,
        lr.assignedTo,
        u.user_id AS assigned_user_id
      FROM raw_data rd
      LEFT JOIN (
        SELECT r1.*, ROW_NUMBER() OVER (PARTITION BY master_id ORDER BY id DESC) rn
        FROM reassignment r1
      ) lr ON rd.master_id = lr.master_id AND lr.rn = 1
      LEFT JOIN users u ON u.name = lr.assignedTo
      WHERE rd.followup_date = CURDATE()
        AND rd.lead_stage NOT IN ('Drop', 'Closed Deal')
        AND rd.followup_time IS NOT NULL
        AND rd.followup_time BETWEEN ? AND ?
    `,
      [currentTime, endTime]
    );

    if (leads.length === 0) {
      console.log('No follow-ups in the next 5 minutes.');
      return;
    }

    console.log(` Found ${leads.length} leads with upcoming follow-ups.`);

    for (const lead of leads) {
      if (!lead.assigned_user_id) continue;

      // ✅ Unique link per lead (prevents duplicates)
      const link = `/master-data?lead=${lead.master_id}`;

      // ✅ Check if a reminder for this exact lead was sent in the last 10 minutes
      const [existing] = await db.query(
        `
        SELECT id FROM notifications
        WHERE user_id = ?
          AND link = ?
          AND created_at > NOW() - INTERVAL 10 MINUTE
        LIMIT 1
      `,
        [lead.assigned_user_id, link]
      );

      if (existing.length > 0) {
        console.log(` Reminder already sent for lead ${lead.master_id} (${lead.name})`);
        continue;
      }

      const title = ' Follow‑up Reminder';
      const message =
        `You have a follow‑up with "${lead.name}" in 5 minutes. ` +
        `Please prepare for the call (scheduled at ${lead.followup_time}).`;

      await createNotification(lead.assigned_user_id, title, message, link);
      console.log(` Reminder sent to ${lead.assignedTo} for lead ${lead.master_id}`);
    }
  } catch (error) {
    console.error(' Error in sendFollowUpReminders:', error);
  }
};