// ======================== attendance-core/controllers/attendance.controller.js ========================
// Fixes applied vs. the original:
//   - generateYearAttendance, getTodayShift, getTodayHoliday now have try/catch
//     (previously uncaught errors would crash the request with no JSON response).
//   - The 4x duplicated geofence-validation block is now one call to
//     enforceAttendanceMethodPolicy() per mutation endpoint.
//   - getAttendanceByDate's WHERE-clause double-prefix bug and the
//     ON DUPLICATE KEY overwrite-real-attendance bug (from generateYearAttendance)
//     are preserved as already-fixed in the source this was extracted from.

import {
  calcLogTotals,
  calcShiftDeviations,
  combineDateTime,
  recalcAndUpsertAttendance,
  enforceAttendanceMethodPolicy,
  intervalsOverlap,
  formatIntervalRange,
} from "../services/attendance.service.js";
import { getEmployeeShift, isWeekOffShiftDay } from "../shift/shiftResolver.js";
import { formatDate, formatTime, formatTimeStr, getDayName } from "../utils/datetime.js";
import { aggregateRouteSummary } from "../services/routeSummary.service.js";

/**
 * @param {(q:string,p?:any[])=>Promise<any>} executeQuery
 * @param {object} config
 */
export const createAttendanceController = (executeQuery, config) => ({
  // ======================== YEARLY GENERATION ========================
  generateYearAttendance: async (req, res) => {
    try {
      const { year } = req.body;
      const employees = await executeQuery(`SELECT * FROM employees WHERE is_active = 1`);
      const holidays = await executeQuery(
        `SELECT DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date
         FROM calendar_events WHERE YEAR(event_date) = ? AND is_holiday_marked = 1`,
        [year],
      );
      const holidaySet = new Set(holidays.map((h) => h.event_date));
      const shifts = await executeQuery(`SELECT * FROM office_shifts`);
      const shiftMap = Object.fromEntries(shifts.map((s) => [s.id, s]));

      for (const emp of employees) {
        const shift = shiftMap[emp.office_shift_id] || null;
        const values = [];
        const placeholders = [];
        let date = new Date(`${year}-01-01`);
        while (date.getFullYear() === year) {
          const formatted = formatDate(date);
          const day = getDayName(date);
          let status = "absent";
          if (holidaySet.has(formatted)) status = "holiday";
          else if (isWeekOffShiftDay(shift, day)) status = "weekoff";
          placeholders.push("(?, ?, ?)");
          values.push(emp.id, formatted, status);
          date.setDate(date.getDate() + 1);
        }
        if (placeholders.length) {
          // Only overwrite attendance_status when there's no real clock_in —
          // otherwise this bulk-generation step clobbers real attendance records.
          await executeQuery(
            `INSERT INTO attendances (employee_id, attendance_date, attendance_status)
             VALUES ${placeholders.join(",")}
             ON DUPLICATE KEY UPDATE
               attendance_status = IF(clock_in IS NULL OR clock_in = '', VALUES(attendance_status), attendance_status)`,
            values,
          );
        }
      }
      res.json({ success: true, message: "Year attendance generated" });
    } catch (err) {
      console.error("generateYearAttendance error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ======================== TODAY SHIFT & HOLIDAY ========================
  getTodayShift: async (req, res) => {
    try {
      const today = new Date();
      const day = getDayName(today);
      const rows = await executeQuery(
        `SELECT e.first_name, e.last_name, s.${day}_in, s.${day}_out
         FROM employees e LEFT JOIN office_shifts s ON e.office_shift_id = s.id
         WHERE e.is_active = 1`,
      );
      res.json(rows);
    } catch (err) {
      console.error("getTodayShift error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getTodayHoliday: async (req, res) => {
    try {
      const today = formatDate(new Date());
      const rows = await executeQuery(
        `SELECT title FROM calendar_events WHERE event_date = ? AND is_holiday_marked = 1`,
        [today],
      );
      res.json(rows);
    } catch (err) {
      console.error("getTodayHoliday error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ======================== ATTENDANCE BY DATE ========================
  getAttendanceByDate: async (req, res) => {
    try {
      const { date, employee_id, department_id, designation_id } = req.query;
      const user = req.user;
      if (!date) return res.status(400).json({ error: "Date is required" });

      let finalEmployeeId = employee_id;
      if (user.role !== "admin") finalEmployeeId = user.employee_id;
      const hasEmployee = !!(finalEmployeeId && String(finalEmployeeId).trim() !== "");

      const [y, m, d] = date.split("-").map(Number);
      const selectedDate = new Date(y, m - 1, d);
      const monthEnd = new Date(y, m, 0);
      const startDate = formatDate(selectedDate);
      const endDate = formatDate(monthEnd);

      const conditions = [];
      const values = [];
      if (hasEmployee) {
        conditions.push("e.id = ?");
        values.push(Number(finalEmployeeId));
      }
      if (user.role === "admin") {
        if (department_id) {
          conditions.push("e.department_id = ?");
          values.push(Number(department_id));
        }
        if (designation_id) {
          conditions.push("e.designation_id = ?");
          values.push(Number(designation_id));
        }
      }
      const whereClause = conditions.length ? conditions.join(" AND ") : "";

      const [employees, attendance, leaves, holidays, logs] = await Promise.all([
        executeQuery(
          `SELECT e.id as employee_id, CONCAT(e.first_name,' ',e.last_name) as employee,
                  e.department_id, e.designation_id, s.*,
                  d.department_name, des.designation_name, r.name AS role_name
           FROM employees e
           LEFT JOIN office_shifts s ON e.office_shift_id = s.id
           LEFT JOIN departments d ON e.department_id = d.id
           LEFT JOIN designations des ON e.designation_id = des.id
           LEFT JOIN roles r ON e.role_users_id = r.id
           WHERE e.is_active = 1 ${whereClause ? "AND " + whereClause : ""}`,
          values,
        ),
        hasEmployee
          ? executeQuery(
              `SELECT * FROM attendances WHERE employee_id = ? AND DATE(attendance_date) BETWEEN ? AND ?`,
              [Number(finalEmployeeId), startDate, endDate],
            )
          : executeQuery(`SELECT * FROM attendances WHERE DATE(attendance_date) = ?`, [date]),
        hasEmployee
          ? executeQuery(
              `SELECT employee_id, DATE(start_date) AS start_date, DATE(end_date) AS end_date
               FROM leave_applications
               WHERE employee_id = ? AND LOWER(status) = 'approved'
                 AND DATE(start_date) <= ? AND DATE(end_date) >= ?`,
              [Number(finalEmployeeId), endDate, startDate],
            )
          : executeQuery(
              `SELECT employee_id, DATE(start_date) AS start_date, DATE(end_date) AS end_date
               FROM leave_applications
               WHERE LOWER(status) = 'approved' AND DATE(start_date) <= ? AND DATE(end_date) >= ?`,
              [date, date],
            ),
        executeQuery(
          `SELECT DATE(event_date) as event_date, title FROM calendar_events
           WHERE is_holiday_marked = 1 AND DATE(event_date) BETWEEN ? AND ?`,
          hasEmployee ? [startDate, endDate] : [date, date],
        ),
        hasEmployee
          ? executeQuery(
              `SELECT employee_id, DATE(attendance_date) as attendance_date, id, clock_in, clock_out
               FROM attendance_logs WHERE employee_id = ? AND DATE(attendance_date) BETWEEN ? AND ?
               ORDER BY attendance_date, clock_in`,
              [Number(finalEmployeeId), startDate, endDate],
            )
          : executeQuery(
              `SELECT employee_id, DATE(attendance_date) as attendance_date, id, clock_in, clock_out
               FROM attendance_logs WHERE DATE(attendance_date) = ? ORDER BY attendance_date, clock_in`,
              [date],
            ),
      ]);

      const attendanceMap = {};
      attendance.forEach((att) => {
        attendanceMap[`${att.employee_id}_${formatDate(new Date(att.attendance_date))}`] = att;
      });

      const logsMap = {};
      logs.forEach((log) => {
        const logKey = `${log.employee_id}_${formatDate(new Date(log.attendance_date))}`;
        if (!logsMap[logKey]) logsMap[logKey] = [];
        logsMap[logKey].push({ id: log.id, clock_in: log.clock_in, clock_out: log.clock_out });
      });

      const leaveMap = {};
      leaves.forEach(({ employee_id, start_date, end_date }) => {
        if (!leaveMap[employee_id]) leaveMap[employee_id] = [];
        const startStr = typeof start_date === "string" ? start_date : formatDate(new Date(start_date));
        const endStr = typeof end_date === "string" ? end_date : formatDate(new Date(end_date));
        leaveMap[employee_id].push({ start: startStr, end: endStr });
      });

      const holidayMap = {};
      holidays.forEach((h) => {
        holidayMap[formatDate(new Date(h.event_date))] = h.title;
      });

      const isOnLeave = (empId, checkDate) =>
        (leaveMap[empId] || []).some((l) => checkDate >= l.start && checkDate <= l.end);

      const result = [];
      for (const emp of employees) {
        if (!hasEmployee) {
          const record = attendanceMap[`${emp.employee_id}_${date}`];
          const day = getDayName(selectedDate);
          let status = "absent";
          if (holidayMap[date]) status = "holiday";
          else if (isOnLeave(emp.employee_id, date)) status = "leave";
          else if (record) status = record.attendance_status;
          else if (!emp[`${day}_in`] && !emp[`${day}_out`]) status = "weekoff";
          result.push({
            ...emp,
            attendance_date: date,
            attendance_status: status,
            logs: logsMap[`${emp.employee_id}_${date}`] || [],
          });
        } else {
          let current = new Date(selectedDate);
          while (current <= monthEnd) {
            const dt = formatDate(current);
            const record = attendanceMap[`${emp.employee_id}_${dt}`];
            const day = getDayName(current);
            let status = "absent";
            if (holidayMap[dt]) status = "holiday";
            else if (isOnLeave(emp.employee_id, dt)) status = "leave";
            else if (record) status = record.attendance_status;
            else if (!emp[`${day}_in`] && !emp[`${day}_out`]) status = "weekoff";
            result.push({
              ...emp,
              attendance_date: dt,
              attendance_status: status,
              logs: logsMap[`${emp.employee_id}_${dt}`] || [],
            });
            current.setDate(current.getDate() + 1);
          }
        }
      }
      res.json(result);
    } catch (err) {
      console.error("getAttendanceByDate error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== CHECK-IN (user self-service) ==========
  addCheckin: async (req, res) => {
    try {
      const { employee_id, attendance_date, clock_in, latitude, longitude } = req.body;
      if (!employee_id || !attendance_date || !clock_in)
        return res.status(400).json({ error: "Missing required fields" });

      const openLogs = await executeQuery(
        `SELECT id FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? AND clock_out IS NULL`,
        [employee_id, attendance_date],
      );
      if (openLogs.length > 0)
        return res.status(400).json({ error: "Please complete checkout for your last open entry first" });

      await enforceAttendanceMethodPolicy(executeQuery, config, { employee_id, latitude, longitude });

      const clockInFull = `${attendance_date} ${clock_in}:00`;
      const result = await executeQuery(
        `INSERT INTO attendance_logs (employee_id, attendance_date, clock_in, clock_out) VALUES (?, ?, ?, NULL)`,
        [employee_id, attendance_date, clockInFull],
      );
      const [firstLog] = await executeQuery(
        `SELECT MIN(clock_in) as first_in FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?`,
        [employee_id, attendance_date],
      );
      await executeQuery(
        `INSERT INTO attendances (employee_id, attendance_date, clock_in, attendance_status)
         VALUES (?, ?, ?, 'present')
         ON DUPLICATE KEY UPDATE clock_in = VALUES(clock_in), attendance_status = 'present'`,
        [employee_id, attendance_date, firstLog?.first_in || null],
      );
      res.json({ message: "Check-in saved", log_id: result.insertId });
    } catch (err) {
      console.error("addCheckin error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  // ========== APPEND ATTENDANCE (add new logs without replacing existing) ==========
  appendAttendanceController: async (req, res) => {
    try {
      const { employee_id, attendance_date, logs = [], attendance_status, latitude, longitude } = req.body;
      if (!employee_id || !attendance_date)
        return res.status(400).json({ error: "Employee ID and date are required" });

      const { shift_start, shift_end, isNextDayShift, shiftStartHour } = await getEmployeeShift(
        executeQuery,
        employee_id,
        attendance_date,
        config,
      );
      const newLogs = logs.filter((l) => l?.clock_in?.trim());
      const lat = latitude !== undefined && latitude !== null && latitude !== "" ? Number(latitude) : null;
      const lng = longitude !== undefined && longitude !== null && longitude !== "" ? Number(longitude) : null;

      await enforceAttendanceMethodPolicy(executeQuery, config, { employee_id, latitude: lat, longitude: lng });

      if (attendance_status !== "present" && newLogs.length === 0) {
        await executeQuery(
          `INSERT INTO attendances (employee_id, attendance_date, attendance_status)
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE attendance_status = VALUES(attendance_status)`,
          [employee_id, attendance_date, attendance_status || "present"],
        );
        return res.json({ message: "Status updated (no new logs)" });
      }
      if (newLogs.length === 0)
        return res.status(400).json({ error: "At least one valid check‑in time is required" });

      const [openLogCheck] = await executeQuery(
        `SELECT id FROM attendance_logs WHERE employee_id = ? AND DATE(attendance_date) = ? AND clock_out IS NULL LIMIT 1`,
        [employee_id, attendance_date],
      );
      if (openLogCheck)
        return res.status(400).json({ error: "Please complete checkout for your last open entry first" });

      const toInterval = (log, idx) => {
        const start = combineDateTime(attendance_date, log.clock_in, isNextDayShift, shiftStartHour);
        if (!start) throw new Error(`Invalid clock_in in row ${idx + 1}`);
        const end = log.clock_out?.trim()
          ? combineDateTime(attendance_date, log.clock_out, isNextDayShift, shiftStartHour)
          : config.OPEN_END_SENTINEL;
        return { start, end };
      };
      const newIntervals = newLogs.map(toInterval);

      const existingRaw = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs
         WHERE employee_id = ? AND DATE(attendance_date) = ? ORDER BY clock_in ASC`,
        [employee_id, attendance_date],
      );
      const existingIntervals = existingRaw.map((l) => ({ start: l.clock_in, end: l.clock_out || config.OPEN_END_SENTINEL }));

      for (const ni of newIntervals) {
        for (const ei of existingIntervals) {
          if (intervalsOverlap(ni.start, ni.end, ei.start, ei.end))
            return res.status(400).json({
              error: `New entry ${formatIntervalRange(ni.start, ni.end, config.OPEN_END_SENTINEL)} overlaps with an existing entry.`,
            });
        }
      }
      for (let i = 0; i < newIntervals.length; i++) {
        for (let j = i + 1; j < newIntervals.length; j++) {
          if (intervalsOverlap(newIntervals[i].start, newIntervals[i].end, newIntervals[j].start, newIntervals[j].end))
            return res.status(400).json({ error: `New row ${i + 1} overlaps with new row ${j + 1}.` });
        }
      }

      for (const log of newLogs) {
        await executeQuery(
          `INSERT INTO attendance_logs (employee_id, attendance_date, clock_in, clock_out, latitude, longitude)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            employee_id,
            attendance_date,
            combineDateTime(attendance_date, log.clock_in, isNextDayShift, shiftStartHour),
            log.clock_out?.trim() ? combineDateTime(attendance_date, log.clock_out, isNextDayShift, shiftStartHour) : null,
            lat,
            lng,
          ],
        );
      }

      const allLogs = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs
         WHERE employee_id = ? AND DATE(attendance_date) = ? ORDER BY clock_in ASC`,
        [employee_id, attendance_date],
      );
      const summary = await recalcAndUpsertAttendance(
        executeQuery,
        employee_id,
        attendance_date,
        attendance_status || "present",
        allLogs,
        shift_start,
        shift_end,
        isNextDayShift,
      );
      res.json({ message: "New entries added successfully", summary });
    } catch (err) {
      console.error("appendAttendanceController error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  // ========== CHECKOUT (user self-service) ==========
  updateCheckout: async (req, res) => {
    try {
      const { log_id, clock_out, latitude, longitude } = req.body;
      if (!log_id || !clock_out) return res.status(400).json({ error: "Missing log_id or clock_out" });

      const logData = await executeQuery(`SELECT employee_id, attendance_date FROM attendance_logs WHERE id = ?`, [log_id]);
      if (!logData.length) return res.status(404).json({ error: "Log not found" });
      const { employee_id, attendance_date } = logData[0];

      await enforceAttendanceMethodPolicy(executeQuery, config, { employee_id, latitude, longitude });

      await executeQuery(`UPDATE attendance_logs SET clock_out = ? WHERE id = ?`, [
        `${attendance_date} ${clock_out}:00`,
        log_id,
      ]);

      const { shift_start, shift_end, isNextDayShift } = await getEmployeeShift(executeQuery, employee_id, attendance_date, config);
      const allLogs = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? ORDER BY clock_in ASC`,
        [employee_id, attendance_date],
      );
      const summary = await recalcAndUpsertAttendance(
        executeQuery,
        employee_id,
        attendance_date,
        "present",
        allLogs,
        shift_start,
        shift_end,
        isNextDayShift,
      );

      await aggregateRouteSummary(executeQuery, employee_id, log_id, attendance_date);
      res.json({ message: "Check-out saved", summary });
    } catch (err) {
      console.error("updateCheckout error:", err);
      res.status(err.statusCode || 500).json({ error: err.message });
    }
  },

  // ========== ADMIN: FULL ADD (replaces all logs) ==========
  addAttendanceNewController: async (req, res) => {
    try {
      const { employee_id, attendance_date, logs = [], attendance_status, latitude, longitude } = req.body;
      if (!employee_id || !attendance_date)
        return res.status(400).json({ error: "Missing required fields: employee_id and attendance_date" });

      await enforceAttendanceMethodPolicy(executeQuery, config, { employee_id, latitude, longitude });

      const { shift_start, shift_end, isNextDayShift, shiftStartHour } = await getEmployeeShift(
        executeQuery,
        employee_id,
        attendance_date,
        config,
      );
      const validLogs = logs.filter((l) => l?.clock_in?.trim());

      if (attendance_status !== "present" && validLogs.length === 0) {
        await executeQuery(
          `INSERT INTO attendances (employee_id, attendance_date, attendance_status)
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE attendance_status = VALUES(attendance_status)`,
          [employee_id, attendance_date, attendance_status || "absent"],
        );
        return res.json({ message: "Saved (no logs required)" });
      }
      if (validLogs.length === 0)
        return res.status(400).json({ error: "At least one valid check-in required for present status" });

      await executeQuery(`DELETE FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?`, [
        employee_id,
        attendance_date,
      ]);
      for (const log of validLogs) {
        await executeQuery(
          `INSERT INTO attendance_logs (employee_id, attendance_date, clock_in, clock_out) VALUES (?, ?, ?, ?)`,
          [
            employee_id,
            attendance_date,
            combineDateTime(attendance_date, log.clock_in, isNextDayShift, shiftStartHour),
            log.clock_out?.trim() ? combineDateTime(attendance_date, log.clock_out, isNextDayShift, shiftStartHour) : null,
          ],
        );
      }

      const allLogs = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? ORDER BY clock_in ASC`,
        [employee_id, attendance_date],
      );
      const summary = await recalcAndUpsertAttendance(
        executeQuery,
        employee_id,
        attendance_date,
        attendance_status || "present",
        allLogs,
        shift_start,
        shift_end,
        isNextDayShift,
      );
      res.json({ message: "Attendance saved successfully", summary });
    } catch (err) {
      console.error("addAttendanceNewController error:", err);
      let errorMsg = err.message;
      if (err.message?.includes("FOREIGN KEY")) errorMsg = "Invalid employee ID or employee does not exist";
      else if (err.message?.includes("Duplicate")) errorMsg = "Attendance record for this date already exists";
      else if (err.message?.includes("Out of range")) errorMsg = "Invalid time format. Please use HH:MM format";
      else if (err.message?.includes("cannot be null")) errorMsg = "Invalid data: required fields are missing";
      res.status(err.statusCode || 500).json({ error: errorMsg });
    }
  },

  // ========== ADMIN: FULL UPDATE (replaces all logs) ==========
  updateAttendanceController: async (req, res) => {
    try {
      const { employee_id, attendance_date, logs, attendance_status, latitude, longitude } = req.body;
      if (!employee_id) return res.status(400).json({ error: "employee_id is required" });
      if (!attendance_date) return res.status(400).json({ error: "attendance_date is required" });

      await enforceAttendanceMethodPolicy(executeQuery, config, { employee_id, latitude, longitude });

      const { shift_start, shift_end, isNextDayShift, shiftStartHour } = await getEmployeeShift(
        executeQuery,
        employee_id,
        attendance_date,
        config,
      );
      const validLogs = (logs || []).filter((l) => l?.clock_in?.trim());

      if (attendance_status !== "present" && validLogs.length === 0) {
        await executeQuery(
          `INSERT INTO attendances (employee_id, attendance_date, attendance_status)
           VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE attendance_status = VALUES(attendance_status)`,
          [employee_id, attendance_date, attendance_status || "absent"],
        );
        return res.json({ message: "Updated (no logs)" });
      }

      await executeQuery(`DELETE FROM attendance_logs WHERE employee_id = ? AND attendance_date = ?`, [
        employee_id,
        attendance_date,
      ]);
      for (const log of validLogs) {
        await executeQuery(
          `INSERT INTO attendance_logs (employee_id, attendance_date, clock_in, clock_out) VALUES (?, ?, ?, ?)`,
          [
            employee_id,
            attendance_date,
            combineDateTime(attendance_date, log.clock_in, isNextDayShift, shiftStartHour),
            log.clock_out?.trim() ? combineDateTime(attendance_date, log.clock_out, isNextDayShift, shiftStartHour) : null,
          ],
        );
      }

      const allLogs = await executeQuery(
        `SELECT clock_in, clock_out FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? ORDER BY clock_in ASC`,
        [employee_id, attendance_date],
      );
      await recalcAndUpsertAttendance(
        executeQuery,
        employee_id,
        attendance_date,
        attendance_status || "present",
        allLogs,
        shift_start,
        shift_end,
        isNextDayShift,
      );
      res.json({ message: "Attendance updated successfully" });
    } catch (err) {
      console.error("updateAttendanceController error:", err);
      let errorMsg = err.message;
      if (err.message?.includes("FOREIGN KEY")) errorMsg = "Invalid employee ID or date format";
      else if (err.message?.includes("Duplicate")) errorMsg = "Record already exists";
      else if (err.message?.includes("Out of range")) errorMsg = "Invalid time format. Please use HH:MM format";
      res.status(err.statusCode || 500).json({ error: errorMsg });
    }
  },

  // ========== GET ATTENDANCE DETAILS (with logs) ==========
  getAttendanceDetails: async (req, res) => {
    try {
      const { employee_id } = req.params;
      const { date } = req.query;
      if (!employee_id || !date) return res.status(400).json({ error: "employee_id & date required" });

      const [attendance, logs] = await Promise.all([
        executeQuery(
          `SELECT attendance_status, total_work FROM attendances WHERE employee_id = ? AND DATE(attendance_date) = ?`,
          [employee_id, date],
        ),
        executeQuery(
          `SELECT id, DATE_FORMAT(clock_in,'%H:%i') AS clock_in, DATE_FORMAT(clock_out,'%H:%i') AS clock_out,
                  latitude, longitude
           FROM attendance_logs WHERE employee_id = ? AND DATE(attendance_date) = ? ORDER BY clock_in ASC`,
          [employee_id, date],
        ),
      ]);

      res.json({
        attendance_status: attendance[0]?.attendance_status || "absent",
        total_work: attendance[0]?.total_work || "00:00",
        logs: logs || [],
      });
    } catch (err) {
      console.error("getAttendanceDetails error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== SUMMARY BY DATE ==========
  getAttendanceSummaryByDate: async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: "Date is required" });

      const rows = await executeQuery(
        `SELECT e.id as employee_id, CONCAT(e.first_name,' ',e.last_name) as employee,
                d.department_name, des.designation_name, r.name as role_name,
                a.attendance_status, a.total_work,
                TIME_FORMAT(MIN(l.clock_in),'%H:%i') as first_clock_in,
                TIME_FORMAT(MAX(l.clock_out),'%H:%i') as last_clock_out
         FROM employees e
         LEFT JOIN attendances a ON e.id = a.employee_id AND DATE(a.attendance_date) = ?
         LEFT JOIN attendance_logs l ON e.id = l.employee_id AND DATE(l.attendance_date) = ?
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN roles r ON e.role_users_id = r.id
         GROUP BY e.id ORDER BY e.first_name ASC`,
        [date, date],
      );
      res.json(rows);
    } catch (err) {
      console.error("getAttendanceSummaryByDate error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== RANGE ==========
  getAttendanceRange: async (req, res) => {
    try {
      const { employee_id, from_date, to_date } = req.query;
      if (!employee_id || !from_date || !to_date)
        return res.status(400).json({ error: "employee_id, from_date, to_date required" });

      const [emp] = await executeQuery(
        `SELECT e.id, e.first_name, e.last_name, e.office_shift_id,
                d.department_name, des.designation_name, r.name AS role_name, c.company_name
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN roles r ON e.role_users_id = r.id
         LEFT JOIN companies c ON e.company_id = c.id
         WHERE e.id = ?`,
        [employee_id],
      );
      if (!emp) return res.status(404).json({ error: "Employee not found" });

      const shift = emp.office_shift_id
        ? (await executeQuery(`SELECT * FROM office_shifts WHERE id = ?`, [emp.office_shift_id]))[0]
        : null;

      const leaves = await executeQuery(
        `SELECT DATE(start_date) AS leave_date, DATE(end_date) AS end_leave_date
         FROM leave_applications
         WHERE employee_id = ? AND LOWER(status) = 'approved' AND DATE(start_date) <= ? AND DATE(end_date) >= ?`,
        [employee_id, to_date, from_date],
      );
      const leaveDates = new Set();
      leaves.forEach((l) => {
        const leaveStart = typeof l.leave_date === "string" ? l.leave_date : formatDate(new Date(l.leave_date));
        const leaveEnd = typeof l.end_leave_date === "string" ? l.end_leave_date : formatDate(new Date(l.end_leave_date));
        let currentDate = leaveStart;
        while (currentDate <= leaveEnd) {
          leaveDates.add(currentDate);
          const [y, m, d] = currentDate.split("-").map(Number);
          currentDate = formatDate(new Date(y, m - 1, d + 1));
        }
      });

      const holidays = await executeQuery(
        `SELECT event_date FROM calendar_events WHERE is_holiday_marked = 1 AND DATE(event_date) BETWEEN ? AND ?`,
        [from_date, to_date],
      );
      const holidayDates = new Set(holidays.map((h) => formatDate(new Date(h.event_date))));

      const result = [];
      let current = new Date(from_date);
      const end = new Date(to_date);
      while (current <= end) {
        const dateStr = formatDate(current);
        const dayName = getDayName(current);
        let status = "absent";
        if (holidayDates.has(dateStr)) status = "holiday";
        else if (leaveDates.has(dateStr)) status = "leave";
        else if (isWeekOffShiftDay(shift, dayName)) status = "weekoff";

        const rawLogs = await executeQuery(
          `SELECT clock_in, clock_out, DATE_FORMAT(clock_in,'%H:%i') AS clock_in_fmt,
                  DATE_FORMAT(clock_out,'%H:%i') AS clock_out_fmt
           FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? ORDER BY clock_in ASC`,
          [employee_id, dateStr],
        );

        let firstIn = null, lastOut = null;
        let time_late = "00:00", early_leaving = "00:00", overtime = "00:00";
        let totalMinutes = 0, restMinutes = 0;

        if (rawLogs.length > 0) {
          if (status !== "holiday") status = "present";
          ({ totalMinutes, restMinutes, firstIn, lastOut } = calcLogTotals(rawLogs, dateStr));
          if (status === "present") {
            const shiftStart = shift ? (shift[`${dayName}_in`] || config.DEFAULT_SHIFT_START).substring(0, 5) : config.DEFAULT_SHIFT_START;
            const shiftEnd = shift ? (shift[`${dayName}_out`] || config.DEFAULT_SHIFT_END).substring(0, 5) : config.DEFAULT_SHIFT_END;
            const isNextDay = shiftEnd < shiftStart;
            ({ late: time_late, early_leaving, overtime } = calcShiftDeviations(
              firstIn, lastOut, dateStr, shiftStart, shiftEnd, isNextDay,
            ));
          }
        }

        result.push({
          employee: `${emp.first_name} ${emp.last_name}`,
          department_name: emp.department_name || "-",
          designation_name: emp.designation_name || "-",
          role_name: emp.role_name || "-",
          company_name: emp.company_name || "-",
          attendance_date: dateStr,
          attendance_status: status,
          first_clock_in: firstIn ? formatTimeStr(firstIn) : null,
          last_clock_out: lastOut ? formatTimeStr(lastOut) : null,
          time_late,
          early_leaving,
          overtime,
          total_work: formatTime(totalMinutes),
          total_rest: formatTime(restMinutes),
          logs: rawLogs.map((l) => ({ clock_in: l.clock_in_fmt, clock_out: l.clock_out_fmt || null })),
        });
        current.setDate(current.getDate() + 1);
      }
      res.json(result);
    } catch (err) {
      console.error("getAttendanceRange error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== MONTHLY ==========
  getAttendanceByMonth: async (req, res) => {
    try {
      const { employee_id, month, year } = req.query;
      if (!employee_id || !month || !year)
        return res.status(400).json({ error: "employee_id, month and year required" });

      const [emp] = await executeQuery(
        `SELECT e.id, e.first_name, e.last_name, e.office_shift_id FROM employees e WHERE e.id = ?`,
        [employee_id],
      );
      if (!emp) return res.status(404).json({ error: "Employee not found" });

      const shift = emp.office_shift_id
        ? (await executeQuery(`SELECT * FROM office_shifts WHERE id = ?`, [emp.office_shift_id]))[0]
        : null;

      const holidays = await executeQuery(
        `SELECT event_date FROM calendar_events WHERE is_holiday_marked = 1 AND YEAR(event_date) = ? AND MONTH(event_date) = ?`,
        [year, month],
      );
      const holidayDates = new Set(holidays.map((h) => formatDate(new Date(h.event_date))));

      const leaves = await executeQuery(
        `SELECT DATE(start_date) AS leave_date, DATE(end_date) AS end_leave_date
         FROM leave_applications
         WHERE employee_id = ? AND LOWER(status) = 'approved'
           AND YEAR(start_date) = ? AND MONTH(start_date) <= ? AND MONTH(end_date) >= ?`,
        [employee_id, year, month, month],
      );
      const leaveDates = new Set();
      leaves.forEach((l) => {
        const leaveStart = typeof l.leave_date === "string" ? l.leave_date : formatDate(new Date(l.leave_date));
        const leaveEnd = typeof l.end_leave_date === "string" ? l.end_leave_date : formatDate(new Date(l.end_leave_date));
        let currentDate = leaveStart;
        while (currentDate <= leaveEnd) {
          leaveDates.add(currentDate);
          const [y, m, d] = currentDate.split("-").map(Number);
          currentDate = formatDate(new Date(y, m - 1, d + 1));
        }
      });

      const result = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      const empName = `${emp.first_name} ${emp.last_name}`;

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayName = getDayName(dateStr);
        let status = "absent";
        if (holidayDates.has(dateStr)) status = "holiday";
        else if (leaveDates.has(dateStr)) status = "leave";
        else if (isWeekOffShiftDay(shift, dayName)) status = "weekoff";

        const rawLogs = await executeQuery(
          `SELECT clock_in, clock_out, DATE_FORMAT(clock_in,'%H:%i') AS clock_in_fmt,
                  DATE_FORMAT(clock_out,'%H:%i') AS clock_out_fmt
           FROM attendance_logs WHERE employee_id = ? AND attendance_date = ? ORDER BY clock_in ASC`,
          [employee_id, dateStr],
        );

        let firstIn = null, lastOut = null;
        let time_late = "00:00", early_leaving = "00:00", overtime = "00:00";
        let totalMinutes = 0, restMinutes = 0;

        if (rawLogs.length > 0) {
          if (status !== "holiday" && status !== "leave" && status !== "weekoff") status = "present";
          ({ totalMinutes, restMinutes, firstIn, lastOut } = calcLogTotals(rawLogs, dateStr));
          if (status === "present") {
            const shiftStart = shift ? (shift[`${dayName}_in`] || config.DEFAULT_SHIFT_START).substring(0, 5) : config.DEFAULT_SHIFT_START;
            const shiftEnd = shift ? (shift[`${dayName}_out`] || config.DEFAULT_SHIFT_END).substring(0, 5) : config.DEFAULT_SHIFT_END;
            const isNextDay = shiftEnd < shiftStart;
            ({ late: time_late, early_leaving, overtime } = calcShiftDeviations(
              firstIn, lastOut, dateStr, shiftStart, shiftEnd, isNextDay,
            ));
          }
        }

        result.push({
          employee_id,
          employee: empName,
          attendance_date: dateStr,
          attendance_status: status,
          first_clock_in: firstIn ? formatTimeStr(firstIn) : null,
          last_clock_out: lastOut ? formatTimeStr(lastOut) : null,
          time_late,
          early_leaving,
          overtime,
          total_work: formatTime(totalMinutes),
          total_rest: formatTime(restMinutes),
        });
      }
      res.json(result);
    } catch (err) {
      console.error("getAttendanceByMonth error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== DAILY ATTENDANCE SUMMARY ==========
  getDailyAttendanceSummary: async (req, res) => {
    try {
      const { date, department_id, designation_id } = req.query;
      if (!date) return res.status(400).json({ error: "Date is required" });

      const dayName = getDayName(date);
      const params = [date, date];
      const conditions = ["e.is_active = 1"];
      if (department_id) {
        conditions.push("e.department_id = ?");
        params.push(Number(department_id));
      }
      if (designation_id) {
        conditions.push("e.designation_id = ?");
        params.push(Number(designation_id));
      }
      const filterClause = conditions.join(" AND ");

      const rows = await executeQuery(
        `SELECT
           e.id AS employee_id, CONCAT(e.first_name,' ',e.last_name) AS employee,
           d.department_name, des.designation_name, r.name AS role_name,
           CASE
             WHEN a.attendance_status IS NOT NULL THEN a.attendance_status
             WHEN s.id IS NOT NULL
               AND (s.${dayName}_in IS NULL OR s.${dayName}_in = '')
               AND (s.${dayName}_out IS NULL OR s.${dayName}_out = '')
               THEN 'weekoff'
             ELSE 'absent'
           END AS attendance_status,
           DATE_FORMAT(MIN(al.clock_in),'%H:%i') AS first_clock_in,
           DATE_FORMAT(MAX(al.clock_out),'%H:%i') AS last_clock_out,
           TIME_FORMAT(SEC_TO_TIME(COALESCE(SUM(TIMESTAMPDIFF(SECOND, al.clock_in, al.clock_out)), 0)), '%H:%i') AS total_work
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN designations des ON e.designation_id = des.id
         LEFT JOIN roles r ON e.role_users_id = r.id
         LEFT JOIN office_shifts s ON e.office_shift_id = s.id
         LEFT JOIN attendances a ON a.employee_id = e.id AND DATE(a.attendance_date) = ?
         LEFT JOIN attendance_logs al ON al.employee_id = e.id AND DATE(al.attendance_date) = ?
         WHERE ${filterClause}
         GROUP BY e.id, d.department_name, des.designation_name, r.name, a.attendance_status, s.id, s.${dayName}_in, s.${dayName}_out
         ORDER BY e.first_name ASC`,
        params,
      );

      res.json(
        rows.map((row) => ({
          ...row,
          first_clock_in: row.first_clock_in || "-",
          last_clock_out: row.last_clock_out || "-",
          total_work: row.total_work || "00:00",
        })),
      );
    } catch (err) {
      console.error("getDailyAttendanceSummary error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== DASHBOARD STATS ==========
  getDashboardStats: async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: "date is required" });

      const rows = await executeQuery(
        `SELECT
           COUNT(DISTINCT e.id) AS totalEmployees,
           SUM(CASE WHEN a.attendance_status = 'present' THEN 1 ELSE 0 END) AS present,
           SUM(CASE WHEN COALESCE(a.time_late,'00:00') != '00:00' THEN 1 ELSE 0 END) AS late,
           SUM(CASE WHEN COALESCE(a.early_leaving,'00:00') != '00:00' THEN 1 ELSE 0 END) AS earlyLeaving
         FROM employees e
         LEFT JOIN attendances a ON a.employee_id = e.id AND DATE(a.attendance_date) = ?
         WHERE e.is_active = 1`,
        [date],
      );
      res.json(rows[0]);
    } catch (err) {
      console.error("getDashboardStats error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getDashboardMonthlyStats: async (req, res) => {
    try {
      const { year, month } = req.query;
      if (!year || !month) return res.status(400).json({ error: "year and month required" });

      const rows = await executeQuery(
        `SELECT DATE_FORMAT(a.attendance_date,'%Y-%m-%d') AS date,
                SUM(CASE WHEN COALESCE(a.time_late,'00:00') != '00:00' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN COALESCE(a.early_leaving,'00:00') != '00:00' THEN 1 ELSE 0 END) AS early_count
         FROM attendances a
         INNER JOIN employees e ON a.employee_id = e.id
         WHERE YEAR(a.attendance_date) = ? AND MONTH(a.attendance_date) = ? AND e.is_active = 1
         GROUP BY DATE_FORMAT(a.attendance_date,'%Y-%m-%d') ORDER BY date ASC`,
        [Number(year), Number(month)],
      );
      res.json(rows);
    } catch (err) {
      console.error("getDashboardMonthlyStats error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  getDashboard20DayTrend: async (req, res) => {
    try {
      const rows = await executeQuery(
        `SELECT DATE_FORMAT(a.attendance_date,'%Y-%m-%d') AS date,
                SUM(CASE WHEN a.attendance_status = 'present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN a.attendance_status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN COALESCE(a.time_late,'00:00') != '00:00' THEN 1 ELSE 0 END) AS late_count
         FROM attendances a
         INNER JOIN employees e ON a.employee_id = e.id
         WHERE a.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 19 DAY) AND a.attendance_date <= CURDATE() AND e.is_active = 1
         GROUP BY DATE_FORMAT(a.attendance_date,'%Y-%m-%d') ORDER BY date ASC`,
      );
      res.json(rows);
    } catch (err) {
      console.error("getDashboard20DayTrend error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // ========== DELETE ==========
  deleteAttendanceController: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Attendance ID required" });
      const result = await executeQuery(`DELETE FROM attendances WHERE id = ?`, [id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "Attendance record not found" });
      res.json({ message: "Attendance record deleted successfully" });
    } catch (err) {
      console.error("deleteAttendanceController error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  deleteLogController: async (req, res) => {
    try {
      const { log_id } = req.params;
      if (!log_id) return res.status(400).json({ error: "Log ID required" });
      const result = await executeQuery(`DELETE FROM attendance_logs WHERE id = ?`, [log_id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "Log entry not found" });
      res.json({ message: "Log entry deleted successfully" });
    } catch (err) {
      console.error("deleteLogController error:", err);
      res.status(500).json({ error: err.message });
    }
  },
});

// ======================== SCHEDULED JOBS (not req/res handlers) ========================

/**
 * PERFORMANCE: fetches the holiday check and shift data ONCE instead of once
 * per employee (the original looped a per-employee getStatus() that fired its
 * own holiday query — 100 employees = 100 holiday queries).
 */
export const generateTodayAttendance = async (executeQuery) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log("Checking attendance for:", today);

    const [{ total }] = await executeQuery(`SELECT COUNT(*) as total FROM attendances WHERE attendance_date = ?`, [today]);
    if (total > 0) {
      console.log("Attendance already exists for today. Skipping...");
      return;
    }

    const holidayRows = await executeQuery(
      `SELECT id FROM calendar_events WHERE event_date = ? AND is_holiday_marked = 1`,
      [today],
    );
    const isHoliday = holidayRows.length > 0;
    const dayName = getDayName(today);

    const employees = await executeQuery(
      `SELECT e.id, e.office_shift_id, os.${dayName}_in AS shift_in, os.${dayName}_out AS shift_out
       FROM employees e LEFT JOIN office_shifts os ON e.office_shift_id = os.id
       WHERE e.is_active = 1`,
    );
    console.log("Total Employees:", employees.length);

    for (const emp of employees) {
      if (!emp.id) continue;
      let status = "absent";
      if (isHoliday) {
        status = "holiday";
      } else if (!emp.office_shift_id) {
        const dayOfWeek = new Date(today).getDay(); // 0=Sunday, 6=Saturday
        status = dayOfWeek === 0 || dayOfWeek === 6 ? "weekoff" : "absent";
      } else if (!emp.shift_in && !emp.shift_out) {
        status = "weekoff";
      }
      await executeQuery(`INSERT INTO attendances (employee_id, attendance_date, attendance_status) VALUES (?, ?, ?)`, [
        emp.id,
        today,
        status,
      ]);
    }
    console.log("Attendance generated for:", today);
  } catch (err) {
    console.error("generateTodayAttendance ERROR:", err);
  }
};

export const markTodayWeekOffAttendances = async (executeQuery, attendanceDate = formatDate(new Date())) => {
  const dayName = getDayName(attendanceDate);
  const result = await executeQuery(
    `INSERT INTO attendances (employee_id, attendance_date, attendance_status)
     SELECT e.id, ?, 'weekoff' FROM employees e
     INNER JOIN office_shifts s ON e.office_shift_id = s.id
     WHERE (s.${dayName}_in IS NULL OR s.${dayName}_in = '') AND (s.${dayName}_out IS NULL OR s.${dayName}_out = '')
     ON DUPLICATE KEY UPDATE attendance_status = 'weekoff'`,
    [attendanceDate, attendanceDate],
  );
  return result?.affectedRows || 0;
};
