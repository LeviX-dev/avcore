// ======================== attendance-core/services/attendance.service.js ========================
// Core payroll-style attendance math (totals, deviations) plus the four
// mutation entry points (checkin, checkout, append, full-replace) that
// previously each carried their own copy of geofence validation. They now all
// call `getAttendanceStrategy(method).validate(ctx)` — one implementation,
// four callers.

import { formatTime, formatDateTimeStr, formatTimeStr, getDayName, formatDate } from "../utils/datetime.js";
import { getEmployeeShift } from "../shift/shiftResolver.js";
import { getAttendanceStrategy } from "../strategies/index.js";

/**
 * Sum worked/rest minutes and first-in/last-out across an ordered array of
 * { clock_in, clock_out } rows (raw datetime strings), clamped to the given day.
 * Tracks firstIn even for an open (no clock_out) row — an open log with no
 * later clock_out must still count toward "when did they arrive".
 */
export const calcLogTotals = (logs, dateStr) => {
  const dayStart = new Date(dateStr + "T00:00:00");
  const dayEnd = new Date(dateStr + "T23:59:59");
  let totalMinutes = 0,
    restMinutes = 0,
    firstIn = null,
    lastOut = null;

  logs.forEach((log, i) => {
    const start = new Date(log.clock_in);
    const end = log.clock_out ? new Date(log.clock_out) : null;
    const effectiveStart = start < dayStart ? dayStart : start;

    if (!firstIn || effectiveStart < firstIn) firstIn = effectiveStart;
    if (!end) return; // open log: contributes to firstIn only

    const effectiveEnd = end > dayEnd ? dayEnd : end;
    if (effectiveEnd <= effectiveStart) return;

    totalMinutes += (effectiveEnd - effectiveStart) / 60000;
    if (!lastOut || effectiveEnd > lastOut) lastOut = effectiveEnd;

    if (i > 0 && logs[i - 1].clock_out) {
      const gap = (start - new Date(logs[i - 1].clock_out)) / 60000;
      if (gap > 0) restMinutes += gap;
    }
  });

  return { totalMinutes, restMinutes, firstIn, lastOut };
};

/** Late / early-leaving / overtime strings derived from firstIn/lastOut vs. shift window. */
export const calcShiftDeviations = (firstIn, lastOut, attendance_date, shift_start, shift_end, isNextDayShift) => {
  let late = "00:00",
    early_leaving = "00:00",
    overtime = "00:00";
  if (!firstIn || !lastOut) return { late, early_leaving, overtime };

  const shiftStartDT = new Date(`${attendance_date}T${shift_start}:00`);
  const shiftEndDT = new Date(`${attendance_date}T${shift_end}:00`);
  if (isNextDayShift) shiftEndDT.setDate(shiftEndDT.getDate() + 1);

  const first = new Date(firstIn);
  const last = new Date(lastOut);

  const lateMin = (first - shiftStartDT) / 60000;
  if (lateMin > 0) late = formatTime(lateMin);

  const earlyMin = (shiftEndDT - last) / 60000;
  if (earlyMin > 0) early_leaving = formatTime(earlyMin);

  const otMin = (last - shiftEndDT) / 60000;
  if (otMin > 0) overtime = formatTime(otMin);

  return { late, early_leaving, overtime };
};

/**
 * Build a full "YYYY-MM-DD HH:MM:SS" string, bumping to next day when the
 * shift crosses midnight and the logged hour is before shift-start.
 */
export const combineDateTime = (date, time, isNextDayShift, shiftStartHour) => {
  if (!time || time.trim() === "") return null;
  const logHour = Number(time.split(":")[0]);
  const d = new Date(date);
  if (isNextDayShift && logHour < shiftStartHour) d.setDate(d.getDate() + 1);
  return `${formatDate(d)} ${time}:00`;
};

/** Recalculate totals from raw logs and upsert the attendances summary row. */
export const recalcAndUpsertAttendance = async (
  executeQuery,
  employee_id,
  attendance_date,
  attendance_status,
  rawLogs,
  shift_start,
  shift_end,
  isNextDayShift,
) => {
  const { totalMinutes, restMinutes, firstIn, lastOut } = calcLogTotals(rawLogs, attendance_date);
  const total_work = formatTime(totalMinutes);
  const total_rest = formatTime(restMinutes);
  const { late, early_leaving, overtime } = calcShiftDeviations(
    firstIn,
    lastOut,
    attendance_date,
    shift_start,
    shift_end,
    isNextDayShift,
  );

  await executeQuery(
    `INSERT INTO attendances
       (employee_id, attendance_date, clock_in, clock_out,
        total_work, total_rest, attendance_status, time_late, early_leaving, overtime)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       clock_in = VALUES(clock_in), clock_out = VALUES(clock_out),
       total_work = VALUES(total_work), total_rest = VALUES(total_rest),
       attendance_status = VALUES(attendance_status), time_late = VALUES(time_late),
       early_leaving = VALUES(early_leaving), overtime = VALUES(overtime)`,
    [
      employee_id,
      attendance_date,
      formatDateTimeStr(firstIn),
      formatDateTimeStr(lastOut),
      total_work,
      total_rest,
      attendance_status,
      late,
      early_leaving,
      overtime,
    ],
  );

  return { total_work, total_rest, late, early_leaving, overtime };
};

/**
 * Look up an employee's attendance_method and run the matching strategy's
 * validate(). Every mutation entry point below calls this ONE function
 * instead of inlining its own geofence block.
 * @throws {Error} with .statusCode set if validation fails, so controllers
 *   can just catch-and-respond without re-checking the shape.
 */
export const enforceAttendanceMethodPolicy = async (executeQuery, config, { employee_id, latitude, longitude }) => {
  if (!config.ENABLE_GEOFENCE_VALIDATION) return { valid: true };

  const [empData] = await executeQuery(
    `SELECT attendance_method FROM employees WHERE id = ?`,
    [employee_id],
  );
  const strategy = getAttendanceStrategy(empData?.attendance_method);
  const result = await strategy.validate({ executeQuery, employee_id, latitude, longitude, config });

  if (!result.valid) {
    const err = new Error(result.error);
    err.statusCode = 400;
    err.meta = result;
    throw err;
  }
  return result;
};

// ---- Overlap helpers for append-mode multi-log entry ----

export const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const formatIntervalRange = (start, end, openEndSentinel) =>
  `${formatTimeStr(start)}–${end === openEndSentinel ? "open" : formatTimeStr(end)}`;

export { getDayName };
