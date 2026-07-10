import express from 'express';
import { createVendor, getVendors, updateVendor, deleteVendor } from '../controllers/vendorController.js';

const router = express.Router();

router.post('/vendors', createVendor);
router.get('/vendors', getVendors);
router.get('/vendor-list', getVendors);
router.put('/vendors/:id', updateVendor);
router.delete('/vendors/:id', deleteVendor);


export default router;