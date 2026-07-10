// ======================== attendance-core/utils/geo.js ========================
// The original code defined haversine distance TWICE — once in
// liveTrackingController.js and again, byte-for-byte identical logic, in
// attendanceController.js. Single copy here, imported everywhere else.

/**
 * Great-circle distance between two lat/lon points, in metres.
 */
export const haversineDistanceMetres = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in metres
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Geographic centroid of an array of {latitude, longitude} points (strings or numbers).
 * Used to anchor a stop-zone to the average position rather than the first point,
 * reducing phantom stop drift caused by GPS jitter.
 */
export const computeCentroid = (points) => {
  const n = points.length;
  if (n === 0) return null;
  const lat = points.reduce((s, p) => s + parseFloat(p.latitude), 0) / n;
  const lon = points.reduce((s, p) => s + parseFloat(p.longitude), 0) / n;
  return { latitude: lat, longitude: lon };
};
