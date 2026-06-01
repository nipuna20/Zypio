const db = require('../db');

/**
 * Create a new seller in the database.
 * @param {object} seller - Seller details: name, businessRegNo, email, telephone, nic, address, password
 * @returns {Promise<object>} Inserted seller row
 */
async function createSeller({ name, businessRegNo, email, telephone, nic, address, password }) {
  const result = await db.query(
    `INSERT INTO sellers (name, business_reg_no, email, telephone, nic, address, password)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name, email`,
    [name, businessRegNo, email, telephone, nic, address, password]
  );
  return result.rows[0];
}

/**
 * Find a seller by email.
 * @param {string} email
 * @returns {Promise<object|null>} Seller row or null
 */
async function findSellerByEmail(email) {
  const result = await db.query('SELECT * FROM sellers WHERE email = $1', [email]);
  return result.rows[0] || null;
}

/**
 * Find a seller by id.
 * @param {number} id
 * @returns {Promise<object|null>} Seller row or null
 */
async function findSellerById(id) {
  const result = await db.query('SELECT * FROM sellers WHERE id = $1', [id]);
  return result.rows[0] || null;
}

/**
 * Get all sellers (for admin).
 * @returns {Promise<Array<object>>}
 */
async function getAllSellers() {
  const result = await db.query(
    'SELECT id, name, business_reg_no, email, telephone, nic, address, is_approved, is_active, approved_at, created_at FROM sellers ORDER BY created_at DESC'
  );
  return result.rows;
}

/**
 * List sellers with pagination and optional approval filter.
 * @param {object} params
 * @param {number} params.page - Page number (default 1)
 * @param {number} params.pageSize - Number of records per page (default 20)
 * @param {string} [params.approved] - Filter by approval status ('true' or 'false')
 * @returns {Promise<object>} result with items, total count, page and pageSize
 */
async function listSellers({ page = 1, pageSize = 20, approved }) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params = [];
  let idx = 1;
  if (approved === 'true' || approved === 'false') {
    conditions.push(`is_approved = $${idx++}`);
    params.push(approved === 'true');
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countQuery = `SELECT COUNT(*)::int AS total FROM sellers ${whereClause}`;
  const dataQuery = `SELECT id, name, business_reg_no, email, telephone, nic, address, is_approved, is_active, approved_by, approved_at, created_at
    FROM sellers
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
 * Approve a seller by admin.
 * @param {number} sellerId
 * @param {number} adminId
 */
async function approveSeller(sellerId, adminId) {
  const result = await db.query(
    `UPDATE sellers
     SET is_approved = TRUE,
         approved_by = $2,
         approved_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, is_approved, approved_by, approved_at`,
    [sellerId, adminId]
  );
  return result.rows[0];
}

/**
 * Deactivate a seller (for rejecting or deactivating sellers).
 * @param {number} sellerId
 */
async function rejectOrDeactivateSeller(sellerId) {
  const result = await db.query(
    `UPDATE sellers
     SET is_active = FALSE
     WHERE id = $1
     RETURNING id, name, email, is_active`,
    [sellerId]
  );
  return result.rows[0];
}

module.exports = {
  createSeller,
  findSellerByEmail,
  findSellerById,
  getAllSellers,
  listSellers,
  approveSeller,
  rejectOrDeactivateSeller,
};