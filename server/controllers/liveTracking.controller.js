// ======================== attendance-core/controllers/liveTracking.controller.js ========================
// Every handler now has a try/catch (one was previously missing coverage
// implicitly relied on processHeartbeat never throwing) and just wires
// req/res to the service layer.

import { processHeartbeat } from "../services/liveTracking.service.js";
import { getHistoricalRoute } from "../services/routeSummary.service.js";
import { isCurrentlyInShift } from "../shift/shiftResolver.js";

/**
 * @param {(q:string,p?:any[])=>Promise<any>} executeQuery
 * @param {object} config - from mergeConfig()
 */
export const createLiveTrackingController = (executeQuery, config) => ({
  liveTrackingHeartbeat: async (req, res) => {
    try {
      const ip_address =
        req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        null;

      const result = await processHeartbeat(executeQuery, config, { ...req.body, ip_address });
      res.json(result);
    } catch (err) {
      console.error("liveTrackingHeartbeat error:", err);
      res.status(err.statusCode || 500).json({
        error: err.message,
        ...(err.attendance_method ? { attendance_method: err.attendance_method } : {}),
      });
    }
  },

  getLiveTrackingHistory: async (req, res) => {
    try {
      const { employee_id } = req.params;
      const { date, limit = 100 } = req.query;
      if (!employee_id) return res.status(400).json({ error: "employee_id is required" });

      let query = `
        SELECT id, employee_id, attendance_log_id, latitude, longitude,
               ip_address, accuracy, speed, heading, altitude,
               is_inside_geofence, distance_from_office,
               battery_level, device_info, created_at
        FROM employee_live_tracking WHERE employee_id = ?`;
      const params = [employee_id];
      if (date) {
        query += ` AND DATE(created_at) = ?`;
        params.push(date);
      }
      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(parseInt(limit));

      const history = await executeQuery(query, params);
      const [employee] = await executeQuery(
        `SELECT id, first_name, last_name, staff_id, attendance_method, location_id
         FROM employees WHERE id = ?`,
        [employee_id],
      );
      res.json({ employee, history, count: history.length });
    } catch (err) {
      console.error("getLiveTrackingHistory error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getActiveLiveTracking: async (req, res) => {
    try {
      // Latest ping per employee via subquery join — a naive self-join
      // produces duplicate rows for employees with multiple pings.
      const activeEmployees = await executeQuery(
        `SELECT
          e.id, e.first_name, e.last_name, e.staff_id, e.company_id,
          g.latitude AS office_lat, g.longitude AS office_lon,
          g.radius AS office_radius, g.id AS office_location_id,
          latest.latitude AS current_lat, latest.longitude AS current_lon,
          latest.created_at AS last_update, latest.is_inside_geofence,
          latest.distance_from_office, latest.ip_address,
          al.id AS active_log_id, al.clock_in AS check_in_time
        FROM employees e
        INNER JOIN attendance_logs al ON e.id = al.employee_id AND al.clock_out IS NULL
        LEFT JOIN geo_locations g ON e.location_id = g.id
        LEFT JOIN (
          SELECT elt.* FROM employee_live_tracking elt
          INNER JOIN (
            SELECT employee_id, MAX(created_at) AS max_created_at
            FROM employee_live_tracking GROUP BY employee_id
          ) newest ON elt.employee_id = newest.employee_id AND elt.created_at = newest.max_created_at
        ) latest ON e.id = latest.employee_id
        WHERE e.attendance_method = 'location_tracking' AND e.is_active = 1`,
      );
      res.json({ count: activeEmployees.length, employees: activeEmployees });
    } catch (err) {
      console.error("getActiveLiveTracking error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getCurrentSessionTracking: async (req, res) => {
    try {
      const { employee_id } = req.params;
      if (!employee_id) return res.status(400).json({ error: "employee_id is required" });

      const [activeLog] = await executeQuery(
        `SELECT id, attendance_date, clock_in FROM attendance_logs
         WHERE employee_id = ? AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1`,
        [employee_id],
      );
      if (!activeLog) {
        return res.json({ is_active: false, message: "No active attendance session found" });
      }

      const trackingPoints = await executeQuery(
        `SELECT latitude, longitude, ip_address, accuracy, speed,
                is_inside_geofence, distance_from_office, battery_level, created_at
         FROM employee_live_tracking WHERE employee_id = ? AND attendance_log_id = ?
         ORDER BY created_at ASC`,
        [employee_id, activeLog.id],
      );

      const sessionDuration = new Date() - new Date(activeLog.clock_in);
      const insideGeofenceCount = trackingPoints.filter((p) => p.is_inside_geofence).length;
      const outsideGeofenceCount = trackingPoints.filter((p) => p.is_inside_geofence === false).length;
      const avgDistance =
        trackingPoints.length > 0
          ? trackingPoints.reduce((sum, p) => sum + (p.distance_from_office || 0), 0) / trackingPoints.length
          : null;

      res.json({
        is_active: true,
        session: {
          log_id: activeLog.id,
          attendance_date: activeLog.attendance_date,
          clock_in: activeLog.clock_in,
          duration_minutes: Math.floor(sessionDuration / 60000),
        },
        tracking_points: trackingPoints,
        stats: {
          total_updates: trackingPoints.length,
          inside_geofence: insideGeofenceCount,
          outside_geofence: outsideGeofenceCount,
          avg_distance_from_office: avgDistance ? Math.round(avgDistance) : null,
        },
      });
    } catch (err) {
      console.error("getCurrentSessionTracking error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getHistoricalRoute: async (req, res) => {
    try {
      const { employee_id } = req.params;
      const { date } = req.query;
      if (!employee_id || !date) return res.status(400).json({ error: "employee_id and date are required" });

      const result = await getHistoricalRoute(executeQuery, employee_id, date);
      res.json(result);
    } catch (err) {
      console.error("getHistoricalRoute error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getLiveTrackingShiftStatus: async (req, res) => {
    try {
      const { employee_id } = req.query;
      if (!employee_id) return res.status(400).json({ error: "employee_id is required" });

      const [emp] = await executeQuery(`SELECT attendance_method FROM employees WHERE id = ?`, [employee_id]);
      if (!emp) return res.status(404).json({ error: "Employee not found" });

      const shiftGate = await isCurrentlyInShift(executeQuery, employee_id, config);
      res.json({ attendance_method: emp.attendance_method, inShift: shiftGate.inShift, window: shiftGate.window || null });
    } catch (err) {
      console.error("getLiveTrackingShiftStatus error:", err);
      res.status(500).json({ error: err.message });
    }
  },
});
