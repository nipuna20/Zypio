const db = require('../db');

/**
 * Create an audit log record.
 * @param {object} params
 * @param {string} params.actorRole - admin, seller, or system
 * @param {number|null} params.actorId
 * @param {string} params.action - action type (e.g., CREATE_ORDER, UPDATE_STATUS)
 * @param {string} params.entityType - entity type (order, seller, etc.)
 * @param {number|null} params.entityId
 * @param {object} params.metadata - additional metadata
 * @returns {Promise<object>} inserted log row
 */
async function createAuditLog({ actorRole, actorId = null, action, entityType, entityId = null, metadata = {} }) {
  const result = await db.query(
    `INSERT INTO audit_logs
      (actor_role, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [actorRole, actorId, action, entityType, entityId, JSON.stringify(metadata)]
  );
  return result.rows[0];
}

/**
 * List audit logs with pagination and optional filters.
 * @param {object} params
 * @param {number} params.page
 * @param {number} params.pageSize
 * @param {string} params.action
 * @param {string} params.entityType
 * @returns {Promise<object>} result with items, total, page, pageSize
 */
async function listAuditLogs({ page = 1, pageSize = 20, action, entityType }) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params = [];
  let idx = 1;
  if (action) {
    conditions.push(`action = $${idx++}`);
    params.push(action);
  }
  if (entityType) {
    conditions.push(`entity_type = $${idx++}`);
    params.push(entityType);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countQuery = `SELECT COUNT(*)::int AS total FROM audit_logs ${whereClause}`;
  const dataQuery = `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
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

module.exports = {
  createAuditLog,
  listAuditLogs,
};