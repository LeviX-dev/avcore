import express from 'express';
import { getAllFollowups, getFollowupStatuses, updateFollowupById, getFollowupById } from '../controllers/followUpController.js'

const router = express.Router();

router.get('/followups', getAllFollowups);

router.get('/:id', getFollowupById)

router.get('/followup/statuses', getFollowupStatuses);

router.put('/followup/:id', updateFollowupById);

export default router;
