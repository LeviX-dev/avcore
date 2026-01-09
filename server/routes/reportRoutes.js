import express from 'express';
import { getAssignedTeleCallerData, getReportDataByMasterId } from '../controllers/reportController.js';

const router = express.Router();


router.get('/data', getAssignedTeleCallerData);


router.get('/:master_id', getReportDataByMasterId);

export default router;
