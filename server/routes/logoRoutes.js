import express from 'express';
import {
  logoUploadMiddleware,
  uploadLogo,
  getLogos,
  getActiveLogo,
  setActiveLogo,
  updateLogo,
  deleteLogo
} from '../controllers/logoController.js';

const router = express.Router();

// Logo routes
router.post('/upload', logoUploadMiddleware, uploadLogo);
router.get('/list', getLogos);
router.get('/active', getActiveLogo);
router.post('/set-active/:id', setActiveLogo);
router.put('/update/:id', updateLogo);
router.delete('/delete/:id', deleteLogo);

export default router;