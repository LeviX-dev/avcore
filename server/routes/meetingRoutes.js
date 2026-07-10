import express from 'express';
import { getMeetingSchedules, updateMeetingSchedule, getMeetingById } from '../controllers/meetingController.js';

const router = express.Router();

router.get('/schedule', getMeetingSchedules);

router.put('/update_schedule', updateMeetingSchedule); 

router.get('/:id', getMeetingById);


export default router;
