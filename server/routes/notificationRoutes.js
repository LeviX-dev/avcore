import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('', getNotifications);
router.put('/mark-read/:id', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification); // admin only

export default router;