// ======================== attendance-core/strategies/geofenceStrategy.js ========================
// Consolidates the geofence-radius check that appeared, independently rewritten,
// in addCheckin, appendAttendanceController, addAttendanceNewController, and
// updateAttendanceController in the original code. This is the ONLY copy now.

import { haversineDistanceMetres } from "../utils/geo.js";

export const geofenceStrategy = {
  name: "geofence",
  requiresLocation: true,

  /**
   * @param {object} ctx
   * @param {(q:string,p?:any[])=>Promise<any>} ctx.executeQuery
   * @param {number|string} ctx.employee_id
   * @param {number|string|null|undefined} ctx.latitude
   * @param {number|string|null|undefined} ctx.longitude
   * @param {object} ctx.config
   * @returns {Promise<{valid:boolean, error?:string, insideZone?:boolean, distance?:number}>}
   */
  async validate({ executeQuery, employee_id, latitude, longitude, config }) {
    // Location is mandatory for geofence method — original code was
    // inconsistent about this (some entry points allowed missing lat/lng to
    // silently skip validation; that's a hole for a geofence method).
    if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
      return {
        valid: false,
        error: "Location access required. Please enable location permissions to mark attendance.",
      };
    }

    const [empData] = await executeQuery(
      `SELECT location_id FROM employees WHERE id = ?`,
      [employee_id],
    );

    if (!empData?.location_id) {
      return {
        valid: false,
        error: "No geofence configured for this employee. Please contact HR.",
      };
    }

    const [geoLocation] = await executeQuery(
      `SELECT latitude, longitude, radius FROM geo_locations WHERE id = ?`,
      [empData.location_id],
    );

    if (!geoLocation) {
      return {
        valid: false,
        error: "No geofence configured for this employee. Please contact HR.",
      };
    }

    const clientLat = parseFloat(latitude);
    const clientLon = parseFloat(longitude);
    const officeLat = parseFloat(geoLocation.latitude);
    const officeLon = parseFloat(geoLocation.longitude);
    const allowedRadius = geoLocation.radius || config.DEFAULT_GEOFENCE_RADIUS_METRES;

    if ([clientLat, clientLon, officeLat, officeLon].some(Number.isNaN)) {
      // Malformed coordinates — fail open like the original did (didn't block),
      // but flag it clearly rather than silently proceeding.
      return { valid: true, insideZone: null };
    }

    const distanceMetres = haversineDistanceMetres(clientLat, clientLon, officeLat, officeLon);

    if (distanceMetres > allowedRadius) {
      return {
        valid: false,
        error: `You are outside the allowed office zone (${Math.round(distanceMetres)}m from office, max allowed: ${allowedRadius}m). Attendance cannot be marked.`,
        insideZone: false,
        distance: Math.round(distanceMetres),
      };
    }

    return { valid: true, insideZone: true, distance: Math.round(distanceMetres) };
  },
};
