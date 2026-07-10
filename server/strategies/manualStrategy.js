// ======================== attendance-core/strategies/manualStrategy.js ========================
// Manual attendance: no location check at all. Used as the fallback for
// unrecognized attendance_method values too.

export const manualStrategy = {
  name: "manual",
  requiresLocation: false,

  /**
   * @param {object} ctx - { executeQuery, employee_id, latitude, longitude }
   */
  async validate(_ctx) {
    return { valid: true };
  },
};
