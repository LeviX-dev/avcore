import express from "express";
import {
  getProductTypes,
  getBrandsByType,
  getAllModelsWithQuantity
} from "../controllers/productController.js";

const router = express.Router();

router.get("/types", getProductTypes);
router.get("/brands/:productTypeId", getBrandsByType);
router.get("/models/:brandId", getAllModelsWithQuantity);

export default router;
