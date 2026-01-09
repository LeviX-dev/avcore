import  mysql from 'mysql2';
import db from '../database/db.js';


const insertProject = (projectData) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO projects (
        project_name, client_name, project_description, doc_upload, 
        start_date, end_date, status, comment, design_upload
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const { 
      project_name, client_name, project_description, doc_upload, 
      start_date, end_date, status, comment, design_upload
    } = projectData;

    db.query(
      sql, 
      [
        project_name, client_name, project_description, JSON.stringify(doc_upload), 
        start_date, end_date, status, comment, design_upload
      ], 
      (err, result) => {
        if (err) {
          console.error("Error in SQL query:", err);
          return reject(err);
        }
        resolve(result);
      }
    );
  });
};









const getProjects = async () => {
  const sql = 'SELECT * FROM projects';
  const [results] = await db.query(sql); 
  return results;
};



const updateProject = async (projectId, projectData) => {
  const sql = `
    UPDATE projects 
    SET 
      project_name = ?, 
      client_name = ?, 
      project_description = ?, 
      doc_upload = ?, 
      start_date = ?, 
      end_date = ?, 
      status = ?, 
      comment = ?, 
      updated_at = NOW(),
      design_upload = ?
    WHERE project_id = ?
  `;

  const {
    project_name,
    client_name,
    project_description,
    doc_upload,
    start_date,
    end_date,
    status,
    comment,
    design_upload
  } = projectData;

  const params = [
    project_name,
    client_name,
    project_description,
    JSON.stringify(doc_upload), // Store full paths as JSON array
    start_date,
    end_date,
    status,
    comment,
    design_upload,
    projectId
  ];

  try {
    const [result] = await db.query(sql, params);
    return result;
  } catch (error) {
    console.error('SQL update error:', error);
    throw error;
  }
};



const getProjectsGroupedByclient = async () => {
  const sql = `
    SELECT client_name, JSON_ARRAYAGG(JSON_OBJECT(
      'project_id', project_id,
      'project_name', project_name,
      'project_description', project_description,
      'doc_upload', doc_upload,
      'start_date', start_date,
      'end_date', end_date,
      'status', status,
      'comment', comment,
      'created_at', created_at,
      'updated_at', updated_at,
      'design_upload', design_upload
    )) AS projects
    FROM projects
    GROUP BY client_name
  `;
  const [result] = await db.query(sql);
  return result.map(row => ({
    client_name: row.client_name,
    projects: row.projects,
  }));
};



export default { insertProject, getProjects, updateProject, getProjectsGroupedByclient };
