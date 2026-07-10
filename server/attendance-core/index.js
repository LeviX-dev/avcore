import { createAttendanceController, generateTodayAttendance, markTodayWeekOffAttendances } from "../controllers/attendance.controller.js";
import { createLiveTrackingController } from "../controllers/liveTracking.controller.js";

const DEFAULT_CONFIG = {
  ENABLE_GEOFENCE_VALIDATION: true,
  DEFAULT_GEOFENCE_RADIUS_METRES: 500,
  DEFAULT_SHIFT_START: "09:00",
  DEFAULT_SHIFT_END: "18:00",
  SHIFT_GRACE_MINUTES: 15,
  ENABLE_LIVE_TRACKING: true,
  MAX_STOP_CANDIDATE_POINTS: 20,
};

const resolveExecuteQuery = (input) => {
  if (typeof input === "function") {
    return input;
  }

  if (input && typeof input.execute === "function") {
    return async (query, params) => {
      const [rows] = await input.execute(query, params);
      return rows;
    };
  }

  if (input && typeof input.query === "function") {
    return async (query, params) => {
      const [rows] = await input.query(query, params);
      return rows;
    };
  }

  throw new Error("createAttendanceCore requires a database pool or an executeQuery function");
};

export const createAttendanceCore = (executeQueryOrDb, config = {}) => {
  const executeQuery = resolveExecuteQuery(executeQueryOrDb);
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const attendance = createAttendanceController(executeQuery, mergedConfig);
  const liveTracking = createLiveTrackingController(executeQuery, mergedConfig);

  const jobs = {
    generateTodayAttendance: () => generateTodayAttendance(executeQuery),
    markTodayWeekOffAttendances: (attendanceDate) => markTodayWeekOffAttendances(executeQuery, attendanceDate),
  };

  return { attendance, liveTracking, jobs };
};
