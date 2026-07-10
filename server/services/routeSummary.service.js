// ======================== attendance-core/services/routeSummary.service.js ========================
// End-of-shift route aggregation and historical route retrieval, extracted
// unchanged in behavior from the original liveTrackingController.js but now
// receiving executeQuery/config as arguments instead of module-level imports.

export const aggregateRouteSummary = async (executeQuery, employee_id, attendance_log_id, dateStr) => {
  try {
    const [empData] = await executeQuery(
      `SELECT attendance_method FROM employees WHERE id = ?`,
      [employee_id],
    );
    if (!empData || empData.attendance_method !== "location_tracking") return;

    let totalDistanceM = 0;
    if (attendance_log_id) {
      const [distanceRow] = await executeQuery(
        `SELECT SUM(distance_from_last) AS total_distance_m
         FROM employee_live_tracking WHERE employee_id = ? AND attendance_log_id = ?`,
        [employee_id, attendance_log_id],
      );
      totalDistanceM = distanceRow?.total_distance_m || 0;
    } else {
      const [distanceRow] = await executeQuery(
        `SELECT SUM(distance_from_last) AS total_distance_m
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(created_at) = ?`,
        [employee_id, dateStr],
      );
      totalDistanceM = distanceRow?.total_distance_m || 0;
    }
    const totalDistanceKm = Math.round((totalDistanceM / 1000) * 100) / 100;

    let stops = [];
    if (attendance_log_id) {
      stops = await executeQuery(
        `SELECT id, duration_seconds FROM employee_tracking_stops
         WHERE employee_id = ? AND attendance_log_id = ?`,
        [employee_id, attendance_log_id],
      );
    } else {
      stops = await executeQuery(
        `SELECT id, duration_seconds FROM employee_tracking_stops
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(start_time) = ?`,
        [employee_id, dateStr],
      );
    }
    const totalStops = stops.length;
    const stoppedSeconds = stops.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    let movingSeconds = 0;
    if (attendance_log_id) {
      const [logRow] = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs WHERE id = ?`,
        [attendance_log_id],
      );
      if (logRow?.clock_in && logRow?.clock_out) {
        const durationSeconds = Math.max(0, Math.floor((new Date(logRow.clock_out) - new Date(logRow.clock_in)) / 1000));
        movingSeconds = Math.max(0, durationSeconds - Math.min(stoppedSeconds, durationSeconds));
      }
    } else {
      const [spanRow] = await executeQuery(
        `SELECT MIN(created_at) AS first_ping, MAX(created_at) AS last_ping
         FROM employee_live_tracking
         WHERE employee_id = ? AND attendance_log_id IS NULL AND DATE(created_at) = ?`,
        [employee_id, dateStr],
      );
      if (spanRow?.first_ping && spanRow?.last_ping) {
        const spanSeconds = Math.max(0, Math.floor((new Date(spanRow.last_ping) - new Date(spanRow.first_ping)) / 1000));
        movingSeconds = Math.max(0, spanSeconds - Math.min(stoppedSeconds, spanSeconds));
      }
    }

    await executeQuery(
      `INSERT INTO employee_route_summaries
        (employee_id, attendance_log_id, attendance_date, total_distance_km, total_stops, moving_seconds, stopped_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        attendance_log_id = COALESCE(attendance_log_id, VALUES(attendance_log_id)),
        total_distance_km = VALUES(total_distance_km),
        total_stops       = VALUES(total_stops),
        moving_seconds    = VALUES(moving_seconds),
        stopped_seconds   = VALUES(stopped_seconds)`,
      [employee_id, attendance_log_id || null, dateStr, totalDistanceKm, totalStops, movingSeconds, stoppedSeconds],
    );

    console.log(
      `Route summary aggregated for employee ${employee_id}, log ${attendance_log_id || "NONE"}: ${totalDistanceKm}km, ${totalStops} stops`,
    );
  } catch (error) {
    console.error("Error in aggregateRouteSummary:", error);
  }
};

export const aggregateAllLiveTrackingSummaries = async (executeQuery, dateStr) => {
  try {
    console.log(`Running daily route summary aggregation for date: ${dateStr}`);
    const rows = await executeQuery(
      `SELECT DISTINCT employee_id, attendance_log_id
       FROM employee_live_tracking WHERE DATE(created_at) = ?`,
      [dateStr],
    );
    for (const r of rows) {
      await aggregateRouteSummary(executeQuery, r.employee_id, r.attendance_log_id, dateStr);
    }
    console.log(`Finished daily route summary aggregation for date: ${dateStr}. Aggregated ${rows.length} routes.`);
  } catch (error) {
    console.error("Error in aggregateAllLiveTrackingSummaries:", error);
  }
};

/**
 * Historical route + stops + summary for a given day. Falls back to a live
 * on-the-fly calculation when no pre-aggregated summary row exists yet
 * (e.g. today, before end-of-shift aggregation has run).
 */
export const getHistoricalRoute = async (executeQuery, employee_id, date) => {
  const points = await executeQuery(
    `SELECT latitude, longitude, created_at, accuracy, speed, battery_level, distance_from_last
     FROM employee_live_tracking WHERE employee_id = ? AND DATE(created_at) = ?
     ORDER BY created_at ASC`,
    [employee_id, date],
  );

  const stops = await executeQuery(
    `SELECT id, latitude, longitude, start_time, end_time, duration_seconds
     FROM employee_tracking_stops WHERE employee_id = ? AND DATE(start_time) = ?
     ORDER BY start_time ASC`,
    [employee_id, date],
  );

  let [summary] = await executeQuery(
    `SELECT total_distance_km, total_stops, moving_seconds, stopped_seconds
     FROM employee_route_summaries WHERE employee_id = ? AND attendance_date = ?`,
    [employee_id, date],
  );

  if (!summary) {
    const totalDistanceM = points.reduce((sum, p) => sum + parseFloat(p.distance_from_last || 0), 0);
    const totalDistanceKm = Math.round((totalDistanceM / 1000) * 100) / 100;
    const totalStops = stops.length;
    const stoppedSec = stops.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

    let movingSec = 0;
    if (points.length >= 2) {
      const [logRow] = await executeQuery(
        `SELECT al.clock_in, al.clock_out FROM attendance_logs al
         WHERE al.employee_id = ? AND (DATE(al.clock_in) = ? OR DATE(al.attendance_date) = ?)
         ORDER BY al.clock_in DESC LIMIT 1`,
        [employee_id, date, date],
      );

      let durationSeconds;
      if (logRow?.clock_in) {
        const end = logRow.clock_out ? new Date(logRow.clock_out) : new Date();
        durationSeconds = Math.max(0, Math.floor((end - new Date(logRow.clock_in)) / 1000));
      } else {
        const first = new Date(points[0].created_at);
        const last = new Date(points[points.length - 1].created_at);
        durationSeconds = Math.max(0, Math.floor((last - first) / 1000));
      }
      movingSec = Math.max(0, durationSeconds - Math.min(stoppedSec, durationSeconds));
    }

    summary = {
      total_distance_km: totalDistanceKm,
      total_stops: totalStops,
      moving_seconds: movingSec,
      stopped_seconds: stoppedSec,
      is_computed_live: true,
    };
  }

  return { points, stops, summary };
};
