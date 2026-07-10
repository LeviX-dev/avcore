// ======================== attendance-core/services/liveTracking.service.js ========================
// Business logic extracted from liveTrackingHeartbeat's controller body so it
// can be unit-tested and reused without an Express req/res in the way.

import { haversineDistanceMetres, computeCentroid } from "../utils/geo.js";
import { isCurrentlyInShift } from "../shift/shiftResolver.js";
import { locationTrackingStrategy } from "../strategies/locationTrackingStrategy.js";

/**
 * Process a single heartbeat ping. Returns a plain result object; throws on
 * hard failures (employee not found, wrong method) so the controller can map
 * those to HTTP status codes.
 */
export const processHeartbeat = async (executeQuery, config, payload) => {
  const {
    employee_id,
    latitude,
    longitude,
    attendance_log_id,
    accuracy,
    speed,
    heading,
    altitude,
    battery_level,
    device_info,
    ip_address,
  } = payload;

  if (!config.ENABLE_LIVE_TRACKING) {
    return { status: "ok", reason: "live_tracking_disabled" };
  }

  if (!employee_id || latitude == null || longitude == null) {
    const err = new Error("employee_id, latitude, and longitude are required");
    err.statusCode = 400;
    throw err;
  }

  const [empData] = await executeQuery(
    `SELECT e.id, e.attendance_method, e.location_id, e.company_id,
            CONCAT(e.first_name, ' ', e.last_name) AS full_name,
            g.latitude AS office_lat, g.longitude AS office_lon, g.radius AS office_radius
     FROM employees e
     LEFT JOIN geo_locations g ON e.location_id = g.id
     WHERE e.id = ?`,
    [employee_id],
  );

  if (!empData) {
    const err = new Error("Employee not found");
    err.statusCode = 404;
    throw err;
  }

  if (empData.attendance_method !== "location_tracking") {
    const err = new Error("Live tracking not enabled for this employee");
    err.statusCode = 403;
    err.attendance_method = empData.attendance_method;
    throw err;
  }

  const shiftGate = await isCurrentlyInShift(executeQuery, employee_id, config);
  if (!shiftGate.inShift) {
    return { status: "ok", reason: "outside_shift" };
  }

  let currentLogId = attendance_log_id;
  if (!currentLogId) {
    const [openLog] = await executeQuery(
      `SELECT id FROM attendance_logs
       WHERE employee_id = ? AND clock_out IS NULL
       ORDER BY clock_in DESC LIMIT 1`,
      [employee_id],
    );
    if (openLog) currentLogId = openLog.id;
  }

  const { isInsideGeofence, distanceFromOffice } = locationTrackingStrategy.computeGeofenceInfo({
    latitude,
    longitude,
    officeLat: empData.office_lat,
    officeLon: empData.office_lon,
    officeRadius: empData.office_radius,
    config,
  });

  // ── Throttle check — scoped to this employee's current log (or today if none) ──
  let lastPoint;
  if (currentLogId) {
    [lastPoint] = await executeQuery(
      `SELECT id, latitude, longitude, created_at, stop_id
       FROM employee_live_tracking
       WHERE employee_id = ? AND attendance_log_id = ?
       ORDER BY created_at DESC LIMIT 1`,
      [employee_id, currentLogId],
    );
  } else {
    [lastPoint] = await executeQuery(
      `SELECT id, latitude, longitude, created_at, stop_id
       FROM employee_live_tracking
       WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(created_at) = CURDATE()
       ORDER BY created_at DESC LIMIT 1`,
      [employee_id],
    );
  }

  let distanceFromLast = 0.0;
  if (lastPoint) {
    distanceFromLast = haversineDistanceMetres(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(lastPoint.latitude),
      parseFloat(lastPoint.longitude),
    );
    const secondsSinceLastUpdate = (new Date() - new Date(lastPoint.created_at)) / 1000;
    const significantMovement = distanceFromLast >= config.SIGNIFICANT_MOVEMENT_METRES;

    if (secondsSinceLastUpdate < config.MIN_UPDATE_INTERVAL_SECONDS && !significantMovement) {
      return {
        status: "throttled",
        seconds_until_next_update: Math.ceil(config.MIN_UPDATE_INTERVAL_SECONDS - secondsSinceLastUpdate),
        employee_id,
        location: { latitude, longitude },
        is_inside_geofence: isInsideGeofence,
        distance_from_office: distanceFromOffice ? Math.round(distanceFromOffice) : null,
      };
    }
  }

  const insertResult = await executeQuery(
    `INSERT INTO employee_live_tracking (
      employee_id, attendance_log_id, latitude, longitude, ip_address,
      accuracy, speed, heading, altitude, is_inside_geofence,
      distance_from_office, distance_from_last, battery_level, device_info
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      employee_id,
      currentLogId || null,
      latitude,
      longitude,
      ip_address || null,
      accuracy || null,
      speed || null,
      heading || null,
      altitude || null,
      isInsideGeofence,
      distanceFromOffice ? Math.round(distanceFromOffice * 100) / 100 : null,
      Math.round(distanceFromLast * 100) / 100,
      battery_level || null,
      device_info || null,
    ],
  );
  const currentInsertId = insertResult.insertId;

  await detectAndHandleStop(executeQuery, config, {
    employee_id,
    currentLogId,
    currentInsertId,
    latitude,
    longitude,
  });

  return {
    status: "ok",
    employee_id,
    location: { latitude, longitude },
    is_inside_geofence: isInsideGeofence,
    distance_from_office: distanceFromOffice ? Math.round(distanceFromOffice) : null,
    ip_address: ip_address || null,
  };
};

/**
 * Stop detection: extends an already-active stop, or grows/closes a new
 * stationary cluster anchored at its centroid. Isolated from processHeartbeat
 * so the clustering algorithm can be tested independently of the DB insert path.
 */
const detectAndHandleStop = async (executeQuery, config, { employee_id, currentLogId, currentInsertId, latitude, longitude }) => {
  const recentPrevPoints = await executeQuery(
    `SELECT id, latitude, longitude, created_at, stop_id
     FROM employee_live_tracking
     WHERE employee_id = ?
       AND id != ?
       AND (attendance_log_id = ? OR (attendance_log_id IS NULL AND DATE(created_at) = CURDATE()))
     ORDER BY created_at DESC LIMIT ?`,
    [employee_id, currentInsertId, currentLogId || null, config.MAX_STOP_CANDIDATE_POINTS],
  );

  const previousPoint = recentPrevPoints[0];

  if (previousPoint && previousPoint.stop_id !== null) {
    // ── A stop is already active: extend it if still within radius ──
    const [stopEvent] = await executeQuery(
      `SELECT id, latitude, longitude, start_time FROM employee_tracking_stops WHERE id = ?`,
      [previousPoint.stop_id],
    );
    if (!stopEvent) return;

    const distFromStopCenter = haversineDistanceMetres(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(stopEvent.latitude),
      parseFloat(stopEvent.longitude),
    );

    if (distFromStopCenter < config.STOP_RADIUS_METRES) {
      const now = new Date();
      const durationSec = Math.max(0, Math.floor((now - new Date(stopEvent.start_time)) / 1000));
      await executeQuery(
        `UPDATE employee_tracking_stops SET end_time = ?, duration_seconds = ? WHERE id = ?`,
        [now, durationSec, stopEvent.id],
      );
      await executeQuery(`UPDATE employee_live_tracking SET stop_id = ? WHERE id = ?`, [
        stopEvent.id,
        currentInsertId,
      ]);
    }
    return;
  }

  // ── No stop active: grow a candidate cluster from the most recent points ──
  const candidatePoints = [];
  let clusterCentroid = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };

  for (const p of recentPrevPoints) {
    if (p.stop_id !== null) break; // hit an already-classified stop

    const testCentroid = computeCentroid([
      ...candidatePoints,
      p,
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
    ]);
    const distFromCentroid = haversineDistanceMetres(
      parseFloat(p.latitude),
      parseFloat(p.longitude),
      testCentroid.latitude,
      testCentroid.longitude,
    );

    if (distFromCentroid < config.STOP_RADIUS_METRES) {
      candidatePoints.push(p);
      clusterCentroid = testCentroid;
    } else {
      break;
    }
  }

  if (candidatePoints.length === 0) return;

  const earliestPoint = candidatePoints[candidatePoints.length - 1];
  const now = new Date();
  const durationSec = Math.floor((now - new Date(earliestPoint.created_at)) / 1000);

  if (durationSec < config.STOP_MIN_DURATION_SECONDS) return;

  const stopInsert = await executeQuery(
    `INSERT INTO employee_tracking_stops
      (employee_id, attendance_log_id, latitude, longitude, start_time, end_time, duration_seconds)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      employee_id,
      currentLogId || null,
      clusterCentroid.latitude,
      clusterCentroid.longitude,
      new Date(earliestPoint.created_at),
      now,
      durationSec,
    ],
  );

  const pointsToMark = [currentInsertId, ...candidatePoints.map((p) => p.id)];
  await executeQuery(
    `UPDATE employee_live_tracking SET stop_id = ? WHERE id IN (${pointsToMark.map(() => "?").join(",")})`,
    [stopInsert.insertId, ...pointsToMark],
  );
};
