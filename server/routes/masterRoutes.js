
import express from 'express';
import { categoryList, createCategory,updateCategoryController, 
    removeCategory , addProductFull,updateProductFull, getProductsFull,
    getReferencesController, addReferenceController, deleteReferenceController, 
    deleteProductEntity, updateReferenceController, addAreaController,
    getAreaController,deleteAreaController,updateAreaController 
, addProductTypeOnly , addBrandToProduct , addModelToBrand ,getProductTypeDetails ,updateBrand,
createKit , getKits , getProductsByCategory , getKitById , updateKit , toggleKitStatus , 
 getProductsAndKitsByCategory ,  createQuotation ,  getQuotationByMasterId , 
getQuotationRevisionsByMasterId , updateQuotationWithRevision , getQuotationForEdit  , 
getLatestQuotation , customisedCategoryList ,  getAllCategories ,


} from '../controllers/masterController.js';
import uploadMiddleware from '../middleware/upload.js';

const router = express.Router();


// ---------------------------- Category -------------------------------

router.post('/category', createCategory);
router.get('/category', categoryList);
router.get('/customised-categories', customisedCategoryList);
router.delete('/category/:cat_id', removeCategory);
router.put("/category/:cat_id", updateCategoryController);
router.get('/all-categories', getAllCategories);


// --------------------------- Product ---------------------------

router.post('/product', uploadMiddleware ,  addProductFull);
router.get('/product', getProductsFull);
router.put('/product/:product_type_id', uploadMiddleware, updateProductFull);
router.delete('/product/:entity/:id', deleteProductEntity);



// Separate routes for step-by-step product creation
router.post('/product/type', addProductTypeOnly); // Step 1: Add only product type
router.post('/product/:product_type_id/brand', addBrandToProduct); // Step 2: Add brand to product
router.post('/product/brand/:brand_id/model', uploadMiddleware, addModelToBrand); // Step 3: Add model to brand
router.get('/product/:product_type_id/details', getProductTypeDetails); // Get specific product type with details
router.put('/brand/:brand_id', updateBrand);

// --------------------- References -------------------------- 

router.post('/reference', addReferenceController); // Add reference
router.get('/reference', getReferencesController); // Fetch references
router.delete('/reference/:id', deleteReferenceController); // Delete reference
router.put("/reference/:id", updateReferenceController); //Update reference


// --------------------- Area -------------------------- 

router.post('/area', addAreaController); // Add Area
router.get('/area', getAreaController); // Fetch Area
router.delete('/area/:id', deleteAreaController); // Delete Area
router.put('/area/:id', updateAreaController); //Update Area

// router.post("/addcity", addCityController); 




router.post('/kit', createKit);
router.get('/allkit', getKits);
router.get('/products/category/:cat_id', getProductsByCategory);
router.get('/kit/:id', getKitById);
router.put('/kit/:id', updateKit);
router.put('/kit/:id/status', toggleKitStatus);
router.get('/category-products-kits/:cat_id', getProductsAndKitsByCategory);

router.post('/quotation', createQuotation);

// router.get('/quotation/:master_id', getQuotationByMasterId);
router.get('/quotation/:master_id/:revision', getQuotationByMasterId);

router.get('/revisions/:master_id', getQuotationRevisionsByMasterId);

router.put('/quotation/:qt_id', updateQuotationWithRevision);

router.get('/quotation/:qt_id/revision/:revision', getQuotationForEdit);



router.get('/quotation/latest/:master_id', getLatestQuotation);



router.post('/quotation', createQuotation);

// router.get('/quotation/:master_id', getQuotationByMasterId);
router.get('/quotation/:master_id/:revision', getQuotationByMasterId);

router.get('/revisions/:master_id', getQuotationRevisionsByMasterId);

router.put('/quotation/:qt_id', updateQuotationWithRevision);

router.get('/quotation/:qt_id/revision/:revision', getQuotationForEdit);



export default router;