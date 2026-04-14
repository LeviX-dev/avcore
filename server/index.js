import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import dotenv from 'dotenv'; 
import session from 'express-session';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import masterRoutes from './routes/masterRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import rawDataRoutes from "./routes/rawDataRoutes.js";
import assignRoutes from "./routes/assignRoutes.js";
import teleCallerRoute from './routes/teleCallerRoute.js';
import followupRoute from './routes/followupRoute.js';
import meetingRoutes from './routes/meetingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import UploadRoutes from './routes/uploadRoutes.js';
import campaignRoutes from "./routes/campaignRoutes.js";

import dynamicSidebarRoutes from "./routes/dynamicSidebarRoutes.js";
import metaRoutes from "./routes/metaRoutes.js"; 

import attendanceRoutes from "./routes/attendanceRoutes.js";

import cron from "node-cron";
import { importMetaLeadsRoundRobin } from "./controllers/metaController.js";
import { storeMetaLeadsForReport } from "./controllers/metaReportController.js";


import executionTypeRoute from "./routes/executionTypeProcessRoute.js";
// import processExecutionRoute from "./routes/processExecutionRoute.js";
import scheduleSystemRoutes from './routes/scheduleSystemRoutes.js';

import preExecutionRoutes from './routes/preExecutionRoutes.js';
import executionRoutes from './routes/executionRoutes.js';

import completeExecutionRoutes from './routes/completeExecutionRoutes.js';


import modelRoutes from "./routes/modelRoutes.js";
import productRoutes from './routes/productRoutes.js'

import onwardRoutes from './routes/onwardRoutes.js'

import dailyExecutionRoutes from "./routes/dailyExecutionRoutes.js";
import metaReportRoutes from "./routes/metaReportRoutes.js";

import { checkTimeLogout } from './middleware/sessionExpiry.js';

import expenseRoutes from './routes/expenseRoutes.js';
import vendorRoutes from './routes/vendoExpRoutes.js';
import walletRoutes from './routes/walletRoutes.js'; 




import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORRECT STATIC FILE SERVING - Files are in server/uploads/
const uploadsDir = path.join(__dirname, 'uploads'); // NOT '../uploads'

console.log('Server directory:', __dirname);
console.log('Uploads directory path:', uploadsDir);

// Check if uploads directory exists and list contents
if (fs.existsSync(uploadsDir)) {
  console.log('Uploads directory exists');
  try {
    const imageDir = path.join(uploadsDir, 'image');
    const documentsDir = path.join(uploadsDir, 'documents');
    
    if (fs.existsSync(imageDir)) {
      const imageFiles = fs.readdirSync(imageDir);
      console.log('Found image files:', imageFiles.length);
    } else {
      console.log('Image directory does not exist');
    }
    
    if (fs.existsSync(documentsDir)) {
      const documentFiles = fs.readdirSync(documentsDir);
      console.log('Found document files:', documentFiles.length);
    } else {
      console.log('Documents directory does not exist');
    }
  } catch (error) {
    console.log('Error reading uploads directory:', error.message);
  }
} else {
  console.log('Uploads directory does not exist, creating...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the CORRECT uploads directory
app.use('/uploads', express.static(uploadsDir)); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(checkTimeLogout);


// Debug route to check file accessibility
app.get('/debug-files', (req, res) => {
  const testFiles = [
    'image/1_1764168172111_mau.jpg',
    'documents/1_1764167866054_AARYATRANSSOLUTIONSPvtLtd.pdf'
  ];
  
  const results = testFiles.map(file => {
    const filePath = path.join(uploadsDir, file);
    const url = `http://localhost:${PORT}/uploads/${file}`;
    const exists = fs.existsSync(filePath);
    
    return {
      file,
      path: filePath,
      url,
      exists,
      accessible: exists ? 'Should be accessible' : 'File not found'
    };
  });
  
  res.json({
    serverDir: __dirname,
    uploadsDir,
    staticFiles: results
  });
});

// CORS configuration
app.use(cors({
  origin: ['https://react3.myospaz.in', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use((req, res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRETE, 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// Routes
app.use('/api', userRoutes); 
app.use('/api', projectRoutes);
app.use('/api', clientRoutes);
app.use('/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', masterRoutes);
app.use('/api', marketingRoutes);
app.use("/api", rawDataRoutes);
app.use('/api', assignRoutes);
app.use("/api", teleCallerRoute);
app.use("/api", followupRoute);
app.use('/api/meeting', meetingRoutes);
app.use('/api/report', reportRoutes);
app.use('/api', UploadRoutes)

app.use('/api/dynamic', dynamicSidebarRoutes)
app.use("/api/campaign", campaignRoutes);

app.use("/api/sujit", metaRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use('/api', executionTypeRoute);
// app.use('/api', processExecutionRoute);
app.use('/api', scheduleSystemRoutes);
app.use('/api/execution', preExecutionRoutes);

app.use('/api', executionRoutes);

app.use('/api', completeExecutionRoutes);


app.use("/api", modelRoutes);

app.use("/api/product",productRoutes)
app.use('/api', onwardRoutes)

app.use("/api/daily-execution", dailyExecutionRoutes);


app.use("/api/report", metaReportRoutes);


app.use('/api/wallet', walletRoutes);
app.use('/api', expenseRoutes);
app.use('/api', vendorRoutes);


// ✅ ADD CRON HERE
// cron.schedule("* * * * *", async () => {
//   console.log("⏱ Meta auto-import running...");
//   await importMetaLeadsRoundRobin({}, {});
// });


cron.schedule("*/5 * * * *", async () => {
  console.log("⏱ Meta auto-import and storage running at:", new Date().toISOString());
  
  // Store leads in report table (using new controller)
  try {
    console.log("📊 Storing Meta leads for reporting...");
    const result = await storeMetaLeadsForReport({}, {});
    console.log("✅ Meta leads stored successfully:", {
      inserted: result?.inserted || 0,
      duplicates: result?.duplicates || 0,
      skipped: result?.skipped || 0
    });
  } catch (error) {
    console.error("❌ Error storing Meta leads in report table:", error.message);
  }
  
  // Import to CRM (using existing controller)
  try {
    console.log("📞 Importing Meta leads to CRM...");
    const result = await importMetaLeadsRoundRobin({}, {});
    console.log("✅ Meta leads imported to CRM successfully");
  } catch (error) {
    console.error("❌ Error importing Meta leads to CRM:", error.message);
  }
});


app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`Static files served from: http://localhost:${PORT}/uploads/`);
});