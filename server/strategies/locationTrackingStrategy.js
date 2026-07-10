// ======================== attendance-core/strategies/locationTrackingStrategy.js ========================
// location_tracking employees are continuously tracked via heartbeats but are
// NOT blocked from checking in/out based on distance from office (that's what
// distinguishes them from `geofence` employees). validate() here is only for
// the check-in/out gate — the live tracking heartbeat's own geofence *flag*
// (is_inside_geofence, informational only) is computed separately in
// liveTracking.service.js since it isn't a pass/fail gate.

import { haversineDistanceMetres } from "../utils/geo.js";

export const locationTrackingStrategy = {
  name: "location_tracking",
  requiresLocation: false,

  async validate(_ctx) {
    return { valid: true };
  },

  /**
   * Informational only — used by the live-tracking heartbeat to tag each ping
   * with is_inside_geofence / distance_from_office without blocking it.
   */
  computeGeofenceInfo({ latitude, longitude, officeLat, officeLon, officeRadius, config }) {
    if (!officeLat || !officeLon) return { isInsideGeofence: null, distanceFromOffice: null };
    const distanceFromOffice = haversineDistanceMetres(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(officeLat),
      parseFloat(officeLon),
    );
    const allowedRadius = officeRadius || config.DEFAULT_GEOFENCE_RADIUS_METRES;
    return { isInsideGeofence: distanceFromOffice <= allowedRadius, distanceFromOffice };
  },
};
