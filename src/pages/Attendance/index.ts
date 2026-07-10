// Main container component - use this for routing
export { default } from './AttendanceContainer';

// Individual components (if needed separately)
export { default as CheckInOut } from './CheckInOut';
export { default as AttendanceReport } from './AttendanceReport';
export { default as Dashboard } from './Dashboard';
export { default as AdminManagement } from './AdminManagement';
export { default as ShiftHolidayManagement } from './ShiftHolidayManagement';

// Service for API calls
export { default as attendanceService  } from './attendanceService';
