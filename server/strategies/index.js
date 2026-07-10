// ======================== attendance-core/strategies/index.js ========================
// The original code had the SAME geofence-validation block copy-pasted FOUR
// times across addCheckin, appendAttendanceController, addAttendanceNewController,
// and updateAttendanceController — each a slightly different rewrite of the
// same logic, which is exactly how these things drift and one copy gets a bug
// fix the others don't.
//
// One strategy per employees.attendance_method value. Every check-in/checkout/
// append/update entry point calls `strategy.validate(ctx)` instead of inlining
// its own copy. Adding a new attendance method later = adding one file here,
// not touching four controllers.

import { manualStrategy } from "./manualStrategy.js";
import { geofenceStrategy } from "./geofenceStrategy.js";
import { locationTrackingStrategy } from "./locationTrackingStrategy.js";

const STRATEGIES = {
  manual: manualStrategy,
  geofence: geofenceStrategy,
  location_tracking: locationTrackingStrategy,
};

/**
 * @param {string} methodName - employees.attendance_method value
 * @returns strategy object with an async validate(ctx) method.
 * Unknown methods fall back to `manual` (permissive) rather than throwing,
 * so a typo'd/legacy attendance_method value doesn't hard-fail check-ins.
 */
export const getAttendanceStrategy = (methodName) =>
  STRATEGIES[methodName] || manualStrategy;

export const registerAttendanceStrategy = (methodName, strategy) => {
  STRATEGIES[methodName] = strategy;
};
