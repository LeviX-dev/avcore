// import fileUpload from 'express-fileupload';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadMiddleware = fileUpload({
//   createParentPath: true,
//   limits: { fileSize: 50 * 1024 * 1024 }, //50MB
//   abortOnLimit: true,
//   responseOnLimit: 'File size limit has been reached',
//   safeFileNames: true,
//   preserveExtension: true,
// });

// export default uploadMiddleware; 




import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

const tempDir = path.join(process.cwd(), 'temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const uploadMiddleware = fileUpload({
  createParentPath: true,

  useTempFiles: true,

  tempFileDir: tempDir,

  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },

  abortOnLimit: true,

  responseOnLimit: 'File size limit reached',

  safeFileNames: true,

  preserveExtension: true,

  debug: true,
});

export default uploadMiddleware;