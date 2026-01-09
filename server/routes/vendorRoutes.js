import express from 'express';
import { createVendor, getVendors , updateVendor} from '../controllers/vendorController.js';

const router = express.Router();

router.post('/vendors', createVendor);

router.get('/vendor-list', getVendors);

router.put('/vendors/:id', updateVendor);


export default router;