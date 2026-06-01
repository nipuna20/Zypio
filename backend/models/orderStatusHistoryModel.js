const db = require('../db');

/**
 * Insert a record into the order_status_history table.
 * @param {object} params
 * @param {number} params.orderId
 * @param {string|null} params.oldStatus
 * @param {string} params.newStatus
 * @param {string} params.changedByRole
 * @param {number|null} params.changedById
 * @param {string|null} params.note
 * @returns {Promise<object>} inserted row
 */
async function createStatusHistory({ orderId, oldStatus, newStatus, changedByRole, changedById = null, note = null }) {
  const result = await db.query(
    `INSERT INTO order_status_history
      (order_id, old_status, new_status, changed_by_role, changed_by_id, note)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [orderId, oldStatus, newStatus, changedByRole, changedById, note]
  );
  return result.rows[0];
}

/**
 * Retrieve history records for an order ordered by change date asc.
 * @param {number} orderId
 * @returns {Promise<Array<object>>}
 */
async function getOrderStatusHistory(orderId) {
  const result = await db.query(
    `SELECT *
     FROM order_status_history
     WHERE order_id = $1
     ORDER BY changed_at ASC`,
    [orderId]
  );
  return result.rows;
}

module.exports = {
  createStatusHistory,
  getOrderStatusHistory,
};