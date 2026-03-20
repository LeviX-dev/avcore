import express from 'express';
import { getClosedLeadsDataExe 
} from '../controllers/completeExecutionController.js';

const router = express.Router();

// Get closed leads data only
router.get('/complete/closed-leads', getClosedLeadsDataExe); 


export default router;