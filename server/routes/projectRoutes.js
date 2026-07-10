import express from 'express';
import multer from 'multer';
import projectController from '../controllers/projectController.js';
import fs from 'fs';
import path from 'path';

const { createProject, fetchProjects, editProject, getProjectsByclient, getProjectActivityLogs, openDesignFile } = projectController;

const router = express.Router();



// Configure multer storage to dynamically create the documents folder
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const projectName = req.body.project_name; // Ensure the project name is in the request body
//     const dir = path.join('D:/Product_Management', projectName, 'documents');

//     // Create the documents directory if it doesn't exist
//     fs.mkdir(dir, { recursive: true }, (err) => {
//       if (err) {
//         console.error('Error creating documents directory:', err);
//         return cb(err);
//       }
//       cb(null, dir); // Use the directory for file upload
//     });
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}_${file.originalname}`); // Set the filename
//   },
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectName = req.body.project_name; // Ensure the project name is in the request body
    let dir = path.join('D:/Product_Management', projectName, 'documents');

    if (file.fieldname === 'design_upload') {
      // If the file is a design file, set the destination to the 'design' folder
      dir = path.join('D:/Product_Management', projectName, 'design');
    }

    // Create the appropriate directory (documents or design)
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
        return cb(err);
      }
      cb(null, dir); // Use the directory for file upload
    });
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Set the filename
  },
});


const upload = multer({ storage }); 
// const multipleUpload = upload.array('doc_upload', 10);
const multipleUpload = upload.fields([
  { name: 'doc_upload', maxCount: 10 },
  { name: 'design_upload', maxCount: 1 }, 
]);

// Route to create a project
// router.post('/create-project', upload.single('doc_upload'), createProject);
router.post('/create-project', multipleUpload, createProject);

// Route to get all projects
router.get('/projects', fetchProjects);

router.put('/project/:id', multipleUpload, editProject);

router.get('/project/projectsByclient', getProjectsByclient);

router.get('/project/project-logs/:projectId', getProjectActivityLogs);

// router.get('/open-file/:projectName/:fileName', openDesignFile);



export default router;
