import express from "express";
import {
  getPriceList,
  uploadPriceList,
  deletePriceList
} from "../controllers/avcorePriceListController.js";

import uploadMiddleware from "../middleware/upload.js";

const router = express.Router();

router.get("/av/avcore-pricelist", getPriceList);
router.post("/avcore-pricelist/upload", uploadMiddleware, uploadPriceList);
router.delete("/avcore-pricelist/:id", deletePriceList);

export default router;