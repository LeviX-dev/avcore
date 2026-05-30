// routes/downloadCenterRoutes.js
import express from 'express';
import fileUpload from 'express-fileupload';
import {
    getDownloadItems,
    addDownloadItem,
    toggleStatus,
    downloadFile,
    downloadLatestApk
} from '../controllers/downloadCenterController.js';

const router = express.Router();

// Configure file upload for APK files only
const uploadMiddleware = fileUpload({
    createParentPath: true,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for APK files
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached',
    safeFileNames: true,
    preserveExtension: true,
});

// Routes - NOTE: No /apk prefix here
router.get('/download-center', getDownloadItems);
router.post('/download-center', uploadMiddleware, addDownloadItem);
router.patch('/download-center/:id/status', toggleStatus);
router.get('/download-center/download/:id', downloadFile);
router.get('/download-center/apk/latest', downloadLatestApk);

export default router;