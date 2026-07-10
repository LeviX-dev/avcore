import express from 'express';
import { getAllModelsWithBrand, getStockList, syncStockByProduct, updateStockQuantity,  } from '../controllers/modelController.js';

const router = express.Router();

router.get('/models/full', getAllModelsWithBrand);
router.post("/stock/sync", syncStockByProduct);
router.get("/stock/list", getStockList);
router.post('/stock/update-quantity', updateStockQuantity);

export default router;
