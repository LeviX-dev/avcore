import axios from "axios";
import db from "../database/db.js";

/* ------------------ helpers ------------------ */
const cleanNumber = (num = "") => {
  let x = String(num).replace(/\D/g, "");
  if (x.startsWith("91") && x.length > 10) x = x.slice(2);
  return x.slice(-10);
};

/* ======================================================
   STORE META LEADS INTO REPORT TABLE
====================================================== */
export const storeMetaLeadsForReport = async (req, res) => {
  try {
    const PAGE_TOKEN = process.env.META_PAGE_TOKEN;
    const FORM_ID = process.env.META_FORM_ID;

    const metaRes = await axios.get(
      `https://graph.facebook.com/v19.0/${FORM_ID}/leads`,
      {
        params: {
          access_token: PAGE_TOKEN,
          fields: "created_time,field_data,id,form_id,page_id",
          limit: 100,
        },
      }
    );

    const rawLeads = metaRes?.data?.data || [];

    if (!rawLeads.length) {
      const response = {
        success: true,
        message: "No Meta leads found",
        inserted: 0,
        duplicates: 0,
        skipped: 0,
      };
      if (res?.json) return res.json(response);
      return response;
    }

    let inserted = 0;
    let skipped = 0;
    let duplicates = 0;

    for (const lead of rawLeads) {
      try {
        const meta_lead_id = lead.id;
        const form_id = lead.form_id || FORM_ID;
        const created_time = lead.created_time;

        /* extract field data */
        let fieldData = {};
        if (Array.isArray(lead.field_data)) {
          lead.field_data.forEach((f) => {
            fieldData[f.name] =
              Array.isArray(f.values) && f.values.length > 0
                ? f.values[0]
                : "";
          });
        }

        const full_name = fieldData.full_name || "";
        const mobile_raw =
          fieldData.whatsapp_number ||
          fieldData.mobile_number ||
          fieldData.phone_number ||
          "";
        const mobile = cleanNumber(mobile_raw);
        const email = fieldData.email || "";
        const city = fieldData.city || fieldData.location || "";

        if (!mobile || mobile.length !== 10) {
          skipped++;
          continue;
        }

        /* duplicate check */
        const [existingLead] = await db.query(
          `SELECT meta_id FROM meta_leads_report
           WHERE mobile = ? AND created_time = ?
           LIMIT 1`,
          [mobile, created_time]
        );

        if (existingLead.length > 0) {
          duplicates++;
          continue;
        }

        /* CRM linkage */
        const [crmLead] = await db.query(
          `SELECT master_id, assign_id FROM raw_data WHERE number = ? LIMIT 1`,
          [mobile]
        );

        const crm_master_id = crmLead.length ? crmLead[0].master_id : null;
        const assign_id = crmLead.length ? crmLead[0].assign_id : null;
        const is_duplicate = crmLead.length ? 1 : 0;

        /* insert */
        await db.query(
          `INSERT INTO meta_leads_report
          (meta_lead_id, form_id, page_id, full_name, mobile, email, city,
           created_time, raw_json, is_duplicate, crm_master_id, assign_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            meta_lead_id,
            form_id,
            lead.page_id || null,
            full_name,
            mobile,
            email,
            city,
            created_time,
            JSON.stringify(fieldData),
            is_duplicate,
            crm_master_id,
            assign_id,
          ]
        );

        inserted++;
      } catch (leadError) {
        console.error("Error processing individual lead:", leadError.message);
        skipped++;
      }
    }

    const response = {
      success: true,
      message: "Meta leads stored successfully",
      total_fetched: rawLeads.length,
      inserted,
      duplicates,
      skipped,
      timestamp: new Date().toISOString(),
    };

    if (res?.json) return res.json(response);
    return response;
  } catch (err) {
    console.error("META STORE ERROR:", err);
    if (res?.status)
      return res.status(500).json({ success: false, error: err.message });
    return { success: false, error: err.message };
  }
};

/* ======================================================
   PAGINATED REPORT
====================================================== */
export const getMetaLeadsReport = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { fromDate, toDate, city, isDuplicate, search } = req.query;

    let where = [];
    let params = [];

    if (fromDate) {
      where.push("created_time >= ?");
      params.push(fromDate);
    }

    if (toDate) {
      where.push("created_time <= ?");
      params.push(toDate + " 23:59:59");
    }

    if (city) {
      where.push("city = ?");
      params.push(city);
    }

    if (isDuplicate !== undefined && isDuplicate !== "") {
      where.push("is_duplicate = ?");
      params.push(parseInt(isDuplicate));
    }

    if (search) {
      where.push("(full_name LIKE ? OR email LIKE ? OR mobile LIKE ?)");
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

    const [countRows] = await db.query(
      `SELECT COUNT(*) as total FROM meta_leads_report ${whereClause}`,
      params
    );

    const total = countRows[0].total;

    const [rows] = await db.query(
      `SELECT
        meta_id,
        meta_lead_id,
        form_id,
        page_id,
        full_name,
        mobile,
        email,
        city,
        created_time,
        imported_at,
        is_duplicate,
        crm_master_id,
        assign_id
      FROM meta_leads_report
      ${whereClause}
      ORDER BY created_time DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      total,
      page,
      limit,
      leads: rows,
    });
  } catch (err) {
    console.error("Error fetching meta leads:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ======================================================
   CITIES
====================================================== */
export const getMetaCities = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT city
       FROM meta_leads_report
       WHERE city IS NOT NULL AND city != ''
       ORDER BY city`
    );

    res.json({
      success: true,
      cities: rows.map((r) => r.city),
    });
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ======================================================
   SUMMARY
====================================================== */
export const getMetaSummary = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        COUNT(*) as total_leads,
        SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate_leads,
        SUM(CASE WHEN is_duplicate = 0 THEN 1 ELSE 0 END) as unique_leads,
        COUNT(DISTINCT city) as total_cities,
        MIN(created_time) as oldest_lead,
        MAX(created_time) as newest_lead,
        DATE(MAX(imported_at)) as last_import_date
      FROM meta_leads_report
    `);

    const [today] = await db.query(`
      SELECT COUNT(*) as today_leads
      FROM meta_leads_report
      WHERE DATE(created_time) = CURDATE()
    `);

    res.json({
      success: true,
      summary: {
        ...rows[0],
        today_leads: today[0].today_leads,
      },
    });
  } catch (err) {
    console.error("Error summary:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ======================================================
   SINGLE LEAD
====================================================== */
export const getMetaLeadDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM meta_leads_report WHERE meta_id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    res.json({
      success: true,
      lead: rows[0],
    });
  } catch (err) {
    console.error("Error lead details:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ======================================================
   MANUAL TRIGGER
====================================================== */
export const triggerMetaStore = async (req, res) => {
  try {
    const result = await storeMetaLeadsForReport(req, null);
    res.json(result);
  } catch (err) {
    console.error("Trigger error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};