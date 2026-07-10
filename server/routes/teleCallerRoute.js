import express from 'express';
import { fetchTaleCallerData, updateTaleCallerData, getTeleCallerStatus, getCategories, getProductsByCategory, getRawDataStatus } from '../controllers/teleCallerController.js';

const router = express.Router();

router.get('/talecallerdata', fetchTaleCallerData);

router.get('/tcstatus', getTeleCallerStatus);

router.put('/edittelecaller', updateTaleCallerData);

router.get('/categories', getCategories);

router.get('/products/:cat_id', getProductsByCategory);

router.get('/rawdatastatus', getRawDataStatus);

export default router;
