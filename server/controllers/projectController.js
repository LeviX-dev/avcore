import fs from 'fs';
import path from 'path';
import projectModel from '../models/projectModel.js';
import multer from 'multer';
import db from '../database/db.js';

const { insertProject, getProjects, updateProject } = projectModel;
const BASE_DIR = 'D:/Product_Management';



// const createProject = async (req, res) => {
//   try {
//     console.log("Received request body:", req.body);
//     console.log("Received files:", req.files);

//     const { project_name, client_name, project_description, start_date, end_date, status, comment } = req.body;
//     const designFile = req.files['design_upload'] ? req.files['design_upload'][0] : null;

//     if (!project_name) {
//       return res.status(400).json({ message: 'Project name is required.' });
//     }

//     const projectPath = path.join(BASE_DIR, project_name);
//     const documentsPath = path.join(projectPath, 'documents');
//     const designPath = path.join(projectPath, 'design');

//     // Create the documents array to hold all file paths (excluding design_upload)
//     const documentPaths = Object.values(req.files)
//       .filter(files => Array.isArray(files)) // Ensure it's an array of files
//       .flat() // Flatten the array to make sure it handles multiple files correctly
//       .filter(file => file.fieldname !== 'design_upload') // Exclude design_upload field
//       .map(file => path.join(documentsPath, file.filename));

//     // Handle design file upload and save to the 'design' folder
//     let designFilePath = null;
//     if (designFile) {
//       fs.mkdirSync(designPath, { recursive: true });
//       designFilePath = path.join(designPath, designFile.filename);
//     }

//     const projectData = {
//       project_name,
//       client_name,
//       project_description,
//       doc_upload: documentPaths, // Use full document paths
//       design_upload: designFilePath, // Use full design path
//       start_date,
//       end_date,
//       status,
//       comment,
//     };

//     console.log("Inserting project data:", projectData);

//     const result = await insertProject(projectData);
//     console.log("Project inserted successfully:", result);

//     return res.status(200).json({ message: `Project "${project_name}" created successfully!` });
//   } catch (err) {
//     console.error('Error creating project:', err);
//     if (!res.headersSent) {
//       return res.status(500).json({ message: 'An error occurred while creating the project.' });
//     }
//   }
// };




// const createProject = async (req, res) => {
//   try {
//     console.log("Received request body:", req.body);
//     console.log("Received files:", req.files);

//     const { project_name, client_name, project_description, start_date, end_date, status, comment } = req.body;
//     const designFile = req.files['design_upload'] ? req.files['design_upload'][0] : null;

//     if (!project_name) {
//       return res.status(400).json({ message: 'Project name is required.' });
//     }

//     // Define project folders
//     const projectPath = path.join(BASE_DIR, project_name);
//     const documentsPath = path.join(projectPath, 'documents');
//     const designPath = path.join(projectPath, 'design');

//     // Create necessary directories
//     fs.mkdirSync(documentsPath, { recursive: true });
//     console.log(`Created directories: ${documentsPath}`);

//     // Collect document file paths
//     const documentPaths = Object.values(req.files)
//       .filter(files => Array.isArray(files)) 
//       .flat() 
//       .filter(file => file.fieldname !== 'design_upload') 
//       .map(file => {
//         const docPath = path.join(documentsPath, file.filename);
//         fs.copyFileSync(file.path, docPath);
//         return docPath; 
//       });

//     // Handle design file upload
//     let designFilePath = null;
//     if (designFile) {
//       fs.mkdirSync(designPath, { recursive: true });
//       designFilePath = path.join(designPath, designFile.filename);
//       fs.copyFileSync(designFile.path, designFilePath); 
//       console.log(`Design file saved: ${designFilePath}`);
//     }

//     // Prepare project data for insertion
//     const projectData = {
//       project_name,
//       client_name,
//       project_description,
//       doc_upload: documentPaths, 
//       design_upload: designFilePath, // Use full design path
//       start_date,
//       end_date,
//       status,
//       comment,
//     };

//     console.log("Inserting project data:", projectData);

//     // Insert project into the database
//     const result = await insertProject(projectData);
//     console.log("Project inserted successfully:", result);

//     return res.status(200).json({ message: `Project "${project_name}" created successfully!` });
//   } catch (err) {
//     console.error('Error creating project:', err);

//     // Ensure headers haven't been sent before returning error response
//     if (!res.headersSent) {
//       return res.status(500).json({ message: 'An error occurred while creating the project.' });
//     }
//   }
// };




const createProject = async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received files:", req.files);

    const { project_name, client_name, project_description, start_date, end_date, status, comment } = req.body;
    const designFile = req.files['design_upload'] ? req.files['design_upload'][0] : null;

    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    // Define project folders
    const projectPath = path.join(BASE_DIR, project_name);
    const documentsPath = path.join(projectPath, 'documents');
    const designPath = path.join(projectPath, 'design');

    // Create necessary directories
    fs.mkdirSync(documentsPath, { recursive: true });
    console.log(`Created directories: ${documentsPath}`);

    // Collect document file paths
    const documentPaths = Object.values(req.files)
      .filter(files => Array.isArray(files)) 
      .flat() 
      .filter(file => file.fieldname !== 'design_upload') 
      .map(file => {
        const docPath = path.join(documentsPath, file.filename);
        fs.copyFileSync(file.path, docPath);
        return docPath; 
      });

    // Handle design file upload
    let designFilePath = null;
    if (designFile) {
      fs.mkdirSync(designPath, { recursive: true });
      designFilePath = path.join(designPath, designFile.filename);
      fs.copyFileSync(designFile.path, designFilePath); 
      console.log(`Design file saved: ${designFilePath}`);
    }

    // Prepare project data for insertion
    const projectData = {
      project_name,
      client_name,
      project_description,
      doc_upload: documentPaths, 
      design_upload: designFilePath, 
      start_date,
      end_date,
      status,
      comment,
    };

    console.log("Inserting project data:", projectData);

    // Insert project into the database
    const result = await insertProject(projectData);
    const projectId = result.insertId; 
    console.log("Project inserted successfully:", result);

    // Insert design upload into project_activity_logs
    if (designFilePath) {
      console.log("Inserting design upload into project_activity_logs:", { project_id: projectId, design_upload: designFilePath });
      await insertProjectActivityLog({ project_id: projectId, design_upload: designFilePath });
      console.log("Design upload logged in project_activity_logs.");
    }

    return res.status(200).json({ message: `Project "${project_name}" created successfully!` });
  } catch (err) {
    console.error('Error creating project:', err);

    // Ensure headers haven't been sent before returning error response
    if (!res.headersSent) {
      return res.status(500).json({ message: 'An error occurred while creating the project.' });
    }
  }
};

const insertProjectActivityLog = ({ project_id, design_upload }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO project_activity_logs (project_id, design_upload, timestamp)
      VALUES (?, ?, ?)
    `;

    const timestamp = new Date(); // Current timestamp
    console.log("Inserting into project_activity_logs:", { project_id, design_upload, timestamp });

    db.query(sql, [project_id, design_upload, timestamp], (err, result) => {
      if (err) {
        console.error("Error inserting into project_activity_logs:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
};







const fetchProjects = async (req, res) => {
  try {
    const projects = await getProjects();
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects.' });
  }
};



const editProject = async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Files:', req.files);

  const projectId = req.params.id;
  const { project_name, client_name, project_description, start_date, end_date, status, comment } = req.body;

  const projectData = {
    project_name,
    client_name,
    project_description: project_description || '',
    start_date: start_date || null,
    end_date: end_date || null,
    status,
    comment: comment || '',
    doc_upload: [],
    design_upload: null
  };

  try {
    // Fetch current `doc_upload` data from the database
    const [currentProject] = await db.query('SELECT doc_upload FROM projects WHERE project_id = ?', [projectId]);
    let currentDocUpload = [];
    if (currentProject[0]?.doc_upload) {
      try {
        currentDocUpload = JSON.parse(currentProject[0].doc_upload);
      } catch (parseError) {
        console.error('Failed to parse doc_upload as JSON:', parseError);
      }
    }

    const uploadedFiles = req.files || [];
    const newDocUploads = [];

    // Handle design file with versioning
    if (req.files['design_upload']) {
      const designFile = req.files['design_upload'][0];
      const designFolder = path.join(BASE_DIR, project_name, 'design');

      if (!fs.existsSync(designFolder)) fs.mkdirSync(designFolder, { recursive: true });

      const baseName = path.parse(designFile.originalname).name;
      const extension = path.parse(designFile.originalname).ext;
      let version = 1;

      const existingFiles = fs.readdirSync(designFolder);
      existingFiles.forEach(file => {
        const match = file.match(/^V(\d+)_/);
        if (match) {
          const existingVersion = parseInt(match[1], 10);
          if (existingVersion >= version) {
            version = existingVersion + 1;
          }
        }
      });

      const newDesignFileName = `V${version}_${baseName}${extension}`;
      const newDesignFilePath = path.join(designFolder, newDesignFileName);
      fs.renameSync(designFile.path, newDesignFilePath);

      projectData.design_upload = newDesignFilePath; 
      console.log('Updated design_upload file path:', projectData.design_upload);

      // Insert activity log for the design upload
      const logSql = `
        INSERT INTO project_activity_logs (project_id, design_upload) 
        VALUES (?, ?)
      `;
      await db.query(logSql, [projectId, newDesignFilePath]);
    }

    // Add other document files if any
    if (uploadedFiles['doc_upload']) {
      uploadedFiles['doc_upload'].forEach(file => {
        const filePath = path.join(BASE_DIR, project_name, 'documents', file.filename);
        newDocUploads.push(filePath);

        // Move file to the documents directory
        const docFolder = path.join(BASE_DIR, project_name, 'documents');
        if (!fs.existsSync(docFolder)) fs.mkdirSync(docFolder, { recursive: true });
        fs.renameSync(file.path, filePath);
      });
    }

    const updatedDocUpload = [...currentDocUpload, ...newDocUploads];
    projectData.doc_upload = updatedDocUpload; 
    console.log('Updated doc_upload array:', projectData.doc_upload);

    // Perform the database update
    const result = await updateProject(projectId, projectData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.status(200).json({ message: 'Project updated successfully.' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project.' });
  }
};



const getProjectsByclient = async (req, res) => {
  try {
    const projects = await projectModel.getProjectsGroupedByclient();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects by client:', error);
    res.status(500).json({ message: 'Error fetching projects by client' });
  }
};


const getProjectActivityLogs = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: 'Project ID is required.' });
  }

  // SQL query to fetch logs for the given project
  const query = `
    SELECT pal.id, pal.project_id, pal.design_upload, pal.timestamp
    FROM project_activity_logs pal
    WHERE pal.project_id = ?
    ORDER BY pal.timestamp DESC
  `;

  try {
    const [logs] = await db.query(query, [projectId]);

    if (logs.length === 0) {
      return res.status(404).json({ message: 'No activity logs found for this project.' });
    }

    res.status(200).json({
      message: 'Project activity logs retrieved successfully.',
      logs,
    });
  } catch (err) {
    console.error('Error fetching project activity logs:', err);
    res.status(500).json({ message: 'Error fetching project activity logs.' });
  }
};



// const openDesignFile = (req, res) => {
//   const { projectName, fileName } = req.params;
//   console.log("Project Name (Backend):", req.params.projectName);
//   console.log("File Name (Backend):", req.params.fileName);
  


//   // Define the path to the file
//   const filePath = path.join('D:', 'Product_Management', projectName, fileName);

//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({ message: 'File not found' });
//   }

//   // Use exec to open the file in the default application
//   exec(`start "" "${filePath}"`, (err) => {
//     if (err) {
//       console.error('Error opening file:', err);
//       return res.status(500).json({ message: 'Error opening file' });
//     }
//     res.status(204).send(); // Return 204 No Content if successful
//   });
// };



export default { createProject, fetchProjects, editProject, getProjectsByclient, getProjectActivityLogs
  //  openDesignFile 
  };
