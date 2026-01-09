import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadMiddleware = fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, //50MB
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached',
  safeFileNames: true,
  preserveExtension: true,
});

export default uploadMiddleware;