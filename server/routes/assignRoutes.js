// routes/assignRoutes.js
import express from 'express';
import { assignLeads  , getAvailableCatArea } from '../controllers/assignController.js';

const router = express.Router();

router.post('/assign', assignLeads);  

router.get('/available-cat-area', getAvailableCatArea);


export default router;