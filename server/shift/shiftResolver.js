// ======================== attendance-core/shift/shiftResolver.js ========================
// The original code had TWO separate shift-resolution implementations:
//   1. getShiftWindowForDate + isCurrentlyInShift (liveTrackingController.js)
//      — used to gate live-tracking pings, with a grace-minute buffer.
//   2. getEmployeeShift (attendanceController.js)
//      — used for payroll-style late/early/overtime calculation, no grace buffer.
// They fetch the same office_shifts row via near-identical SQL but return
// different shapes. Consolidated here: one row fetch, two purpose-built views
// over it, so a bug fix in shift lookup only has to happen once.

/**
 * Fetch the raw office_shifts row (or null) for an employee.
 */
export const fetchShiftRow = async (executeQuery, employee_id) => {
  const rows = await executeQuery(
    `SELECT os.* FROM employees e
     LEFT JOIN office_shifts os ON e.office_shift_id = os.id
     WHERE e.id = ?`,
    [employee_id],
  );
  return rows[0] || null;
};

/** True if the shift row has no in/out time configured for dayName (a weekoff day). */
export const isWeekOffShiftDay = (shiftRow, dayName) => {
  if (!shiftRow) return false;
  const inVal = shiftRow[`${dayName}_in`];
  const outVal = shiftRow[`${dayName}_out`];
  return (
    (inVal === null || inVal === undefined || inVal === "") &&
    (outVal === null || outVal === undefined || outVal === "")
  );
};

/**
 * Resolve the {start, end} Date window for a given calendar date, honoring
 * midnight-crossing shifts (e.g. 22:00 -> 06:00). Returns null on a weekoff day.
 * Falls back to config.DEFAULT_SHIFT_START/END when no shift row exists.
 */
export const getShiftWindowForDate = (shiftRow, dateStr, config) => {
  const dayName = new Date(`${dateStr}T00:00:00`)
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();

  if (!shiftRow) {
    return {
      start: new Date(`${dateStr}T${config.DEFAULT_SHIFT_START}:00`),
      end: new Date(`${dateStr}T${config.DEFAULT_SHIFT_END}:00`),
    };
  }

  if (isWeekOffShiftDay(shiftRow, dayName)) return null;

  const inVal = shiftRow[`${dayName}_in`];
  const outVal = shiftRow[`${dayName}_out`];
  const shift_start = inVal?.includes(":") ? inVal.substring(0, 5) : config.DEFAULT_SHIFT_START;
  const shift_end = outVal?.includes(":") ? outVal.substring(0, 5) : config.DEFAULT_SHIFT_END;

  const start = new Date(`${dateStr}T${shift_start}:00`);
  let end;
  if (shift_end < shift_start) {
    // Crosses midnight
    const nextDay = new Date(new Date(`${dateStr}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);
    const nextDayStr = [
      nextDay.getFullYear(),
      String(nextDay.getMonth() + 1).padStart(2, "0"),
      String(nextDay.getDate()).padStart(2, "0"),
    ].join("-");
    end = new Date(`${nextDayStr}T${shift_end}:00`);
  } else {
    end = new Date(`${dateStr}T${shift_end}:00`);
  }

  return { start, end };
};

/**
 * Returns { inShift, window } for RIGHT NOW, applying SHIFT_GRACE_MINUTES on
 * both edges so pings arriving slightly before/after the shift boundary are
 * still accepted. Checks today's window and, for overnight shifts, yesterday's
 * window too.
 */
export const isCurrentlyInShift = async (executeQuery, employee_id, config) => {
  const shiftRow = await fetchShiftRow(executeQuery, employee_id);
  const now = new Date();
  const graceMs = config.SHIFT_GRACE_MINUTES * 60 * 1000;

  const formatLocal = (d) =>
    [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");

  const todayStr = formatLocal(now);
  const yesterdayStr = formatLocal(new Date(now.getTime() - 24 * 60 * 60 * 1000));

  for (const dateStr of [todayStr, yesterdayStr]) {
    const window = getShiftWindowForDate(shiftRow, dateStr, config);
    if (
      window &&
      now >= new Date(window.start.getTime() - graceMs) &&
      now <= new Date(window.end.getTime() + graceMs)
    ) {
      return { inShift: true, window };
    }
  }

  return { inShift: false };
};

/**
 * Payroll-style shift lookup for a specific attendance_date (no grace buffer —
 * this feeds late/early/overtime math, not a live-ping gate).
 * Returns { shift_start, shift_end, isNextDayShift, shiftStartHour }.
 */
export const getEmployeeShift = async (executeQuery, employee_id, attendance_date, config) => {
  const shiftRow = await fetchShiftRow(executeQuery, employee_id);
  let shift_start = config.DEFAULT_SHIFT_START;
  let shift_end = config.DEFAULT_SHIFT_END;

  if (shiftRow) {
    const day = new Date(attendance_date).toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    if (shiftRow[`${day}_in`]?.includes(":")) shift_start = shiftRow[`${day}_in`].substring(0, 5);
    if (shiftRow[`${day}_out`]?.includes(":")) shift_end = shiftRow[`${day}_out`].substring(0, 5);
  }

  return {
    shift_start,
    shift_end,
    isNextDayShift: shift_end < shift_start,
    shiftStartHour: Number(shift_start.split(":")[0]),
  };
};
