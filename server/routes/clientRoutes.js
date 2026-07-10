import express from 'express';
import { createClient,getProductsByCategoryId} from '../controllers/clientController.js';

const router = express.Router();

router.post('/api/sujit', createClient);
router.get('/products-by-cat-id/:cat_id', getProductsByCategoryId);



export default router;




