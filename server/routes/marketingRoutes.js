import express from 'express';
import { getFollowupController, getMktProductsContoller, updateMktProductStatus } from "../controllers/marketingController.js";

const router = express.Router();

// get follow up data 
router.get('/followup', getFollowupController);


//get marketing product data
router.get('/marketing-product', getMktProductsContoller);


// status update route
router.put("/mkt-products/:id", updateMktProductStatus);



export default router;