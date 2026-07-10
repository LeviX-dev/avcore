// ======================== attendance-core/utils/datetime.js ========================

/** minutes -> "HH:MM" */
export const formatTime = (minutes) => {
  if (!minutes || isNaN(minutes)) return "00:00";
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(Math.floor(minutes % 60)).padStart(2, "0");
  return `${h}:${m}`;
};

/** Date -> "YYYY-MM-DD" (local time, not UTC — avoids toISOString() timezone shift bugs) */
export const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Extract "HH:MM" from a datetime string or Date object */
export const formatTimeStr = (dt) => {
  if (!dt) return null;
  if (dt instanceof Date) return dt.toTimeString().substring(0, 5);
  const part = dt.includes(" ") ? dt.split(" ")[1] : dt;
  return part.substring(0, 5) || null;
};

/**
 * Format a Date object to "YYYY-MM-DD HH:MM:SS" for MySQL DATETIME columns.
 * Passing raw Date objects straight into a driver's query params lets the
 * driver's implicit conversion decide the format, which can silently differ
 * from what other queries in the codebase expect. Always format explicitly.
 */
export const formatDateTimeStr = (dt) => {
  if (!dt) return null;
  if (typeof dt === "string") return dt;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ` +
    `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
  );
};

export const getDayName = (date) =>
  new Date(date).toLocaleString("en-US", { weekday: "long" }).toLowerCase();

export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
