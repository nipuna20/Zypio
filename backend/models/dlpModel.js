const db = require('../db');

/**
 * Model functions for Delivery Partners (DLPs).
 * DLPs are users who pick up and deliver parcels on behalf of sellers.
 * Each DLP must be approved by an admin before they can log in and
 * operate on orders. This model mirrors the sellerModel but omits
 * business-specific fields.
 */

/**
 * Create a new delivery partner in the database.
 * @param {object} dlp - DLP details: name, email, telephone, password
 * @returns {Promise<object>} Inserted DLP row
 */
async function createDlp({ name, email, telephone, password }) {
  const result = await db.query(
    `INSERT INTO dlps (name, email, telephone, password)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, email`,
    [name, email, telephone, password],
  );
  return result.rows[0];
}

/**
 * Find a DLP by email.
 * @param {string} email
 * @returns {Promise<object|null>} DLP row or null
 */
async function findDlpByEmail(email) {
  const result = await db.query('SELECT * FROM dlps WHERE email = $1', [email]);
  return result.rows[0] || null;
}

/**
 * Find a DLP by id.
 * @param {number} id
 * @returns {Promise<object|null>} DLP row or null
 */
async function findDlpById(id) {
  const result = await db.query('SELECT * FROM dlps WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * List DLPs with pagination and optional approval filter.
 * @param {object} params
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.pageSize - Number of records per page (default 20)
 * @param {string} [params.approved] - Filter by approval status ('true' or 'false')
 * @returns {Promise<object>} result with items, total count, page and pageSize
 */
async function listDlps({ page = 1, pageSize = 20, approved }) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params = [];
  let idx = 1;
  if (approved === 'true' || approved === 'false') {
    conditions.push(`is_approved = $${idx++}`);
    params.push(approved === 'true');
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countQuery = `SELECT COUNT(*)::int AS total FROM dlps ${whereClause}`;
  const dataQuery = `SELECT id, name, email, telephone, is_approved, is_active, approved_by, approved_at, created_at
    FROM dlps
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}`;
  const [countRes, dataRes] = await Promise.all([
    db.query(countQuery, params),
    db.query(dataQuery, [...params, pageSize, offset]),
  ]);
  return {
    items: dataRes.rows,
    total: countRes.rows[0].total,
    page,
    pageSize,
  };
}

/**
 * Approve a DLP by admin.
 * @param {number} dlpId
 * @param {number} adminId
 */
async function approveDlp(dlpId, adminId) {
  const result = await db.query(
    `UPDATE dlps
     SET is_approved = TRUE,
         approved_by = $2,
         approved_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, is_approved, approved_by, approved_at`,
    [dlpId, adminId],
  );
  return result.rows[0];
}

/**
 * Deactivate a DLP (for rejecting or deactivating delivery partners).
 * @param {number} dlpId
 */
async function rejectOrDeactivateDlp(dlpId) {
  const result = await db.query(
    `UPDATE dlps
     SET is_active = FALSE
     WHERE id = $1
     RETURNING id, name, email, is_active`,
    [dlpId],
  );
  return result.rows[0];
}

module.exports = {
  createDlp,
  findDlpByEmail,
  findDlpById,
  listDlps,
  approveDlp,
  rejectOrDeactivateDlp,
};