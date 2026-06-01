const db = require('../db');

/**
 * Create a new order for a seller.
 * @param {number} sellerId
 * @param {object} orderData
 * @returns {Promise<number>} The id of the created order
 */
async function createOrder(sellerId, {
  customerName,
  customerAddress,
  customerPhone,
  itemName,
  price,
  deliveryAddress,
  paymentType,
  paid,
  bankSlipPath,
}) {
  const result = await db.query(
    `INSERT INTO orders
      (seller_id, customer_name, customer_address, customer_phone, item_name, price, delivery_address, payment_type, paid, bank_slip)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [
      sellerId,
      customerName,
      customerAddress,
      customerPhone,
      itemName,
      price,
      deliveryAddress,
      paymentType,
      paid,
      bankSlipPath,
    ]
  );
  return result.rows[0].id;
}

/**
 * Get orders belonging to a specific seller.
 * @param {number} sellerId
 */
async function getOrdersBySeller(sellerId) {
  const result = await db.query('SELECT * FROM orders WHERE seller_id = $1 ORDER BY created_at DESC', [sellerId]);
  return result.rows;
}

/**
 * Get all orders (admin).
 */
async function getAllOrders() {
  const result = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows;
}

/**
 * Assign a delivery partner (DLP) to an order and set its status to
 * 'assigned_to_dlp'. Returns the updated order row. Used by admin when
 * dispatching orders to couriers.
 * @param {number} orderId
 * @param {number} dlpId
 */
async function assignDlpToOrder(orderId, dlpId) {
  const result = await db.query(
    `UPDATE orders
     SET dlp_id = $2,
         status = 'assigned_to_dlp',
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId, dlpId],
  );
  return result.rows[0];
}

/**
 * Get orders assigned to a specific DLP.
 * @param {number} dlpId
 */
async function getOrdersByDlp(dlpId) {
  const result = await db.query(
    `SELECT * FROM orders WHERE dlp_id = $1 ORDER BY created_at DESC`,
    [dlpId],
  );
  return result.rows;
}

/**
 * Get dashboard statistics for a DLP.
 * Calculates total assigned orders, pending orders (not delivered or cancelled),
 * delivered orders and COD pending amount.
 * @param {number} dlpId
 */
async function getDlpDashboardStats(dlpId) {
  const result = await db.query(
    `SELECT
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE status NOT IN ('delivered','cancelled','returned'))::int AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders,
      COALESCE(SUM(CASE WHEN payment_type = 'COD' AND cod_collected = FALSE THEN price ELSE 0 END),0)::numeric(12,2) AS cod_pending_amount
     FROM orders
     WHERE dlp_id = $1`,
    [dlpId],
  );
  return result.rows[0];
}

/**
 * Mark the COD as collected for an order. Sets cod_collected = TRUE.
 * Returns updated order row.
 * @param {number} orderId
 */
async function markCodCollected(orderId) {
  const result = await db.query(
    `UPDATE orders
     SET cod_collected = TRUE,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId],
  );
  return result.rows[0];
}

/**
 * Get an order with seller details by order id.
 * @param {number} orderId
 */
async function getOrderWithSeller(orderId) {
  const result = await db.query(
    `SELECT o.*, s.name AS seller_name, s.address AS seller_address, s.email AS seller_email, s.telephone AS seller_phone, s.id AS seller_id
     FROM orders o
     JOIN sellers s ON o.seller_id = s.id
     WHERE o.id = $1`,
    [orderId]
  );
  return result.rows[0] || null;
}

/**
 * Update the status of an order
 * @param {number} orderId
 * @param {string} status
 */
async function updateOrderStatus(orderId, status) {
  await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, orderId]);
}

/**
 * Update tracking number of an order and return updated row
 * @param {number} orderId
 * @param {string} trackingNumber
 * @returns {Promise<object>}
 */
async function updateTrackingNumber(orderId, trackingNumber) {
  const result = await db.query(
    `UPDATE orders
     SET tracking_number = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId, trackingNumber]
  );
  return result.rows[0];
}

/**
 * Advanced status update with optional note, returns updated order row.
 * @param {number} orderId
 * @param {string} status
 * @param {string|null} note
 * @returns {Promise<object>}
 */
async function updateOrderStatusAdvanced(orderId, status, note = null) {
  const result = await db.query(
    `UPDATE orders
     SET status = $2,
         notes = COALESCE($3, notes),
         status_updated_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId, status, note]
  );
  return result.rows[0];
}

/**
 * Get order by id with seller information.
 * @param {number} orderId
 * @returns {Promise<object|null>}
 */
async function getOrderById(orderId) {
  const result = await db.query(
    `SELECT o.*, s.name AS seller_name, s.email AS seller_email, s.telephone AS seller_phone
     FROM orders o
     JOIN sellers s ON s.id = o.seller_id
     WHERE o.id = $1`,
    [orderId]
  );
  return result.rows[0] || null;
}

/**
 * List orders with advanced filtering and pagination.
 * @param {object} options
 * @param {number} options.sellerId
 * @param {number} options.page
 * @param {number} options.pageSize
 * @param {string} options.status
 * @param {string} options.paymentType
 * @param {string} options.q - search query for customer name, phone, item or tracking
 * @param {string} options.fromDate - filter from created_at (ISO date)
 * @param {string} options.toDate - filter to created_at (ISO date)
 * @returns {Promise<object>} result with items, total
 */
async function listOrdersAdvanced({ sellerId = null, page = 1, pageSize = 20, status, paymentType, q, fromDate, toDate }) {
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params = [];
  let idx = 1;
  if (sellerId) {
    conditions.push(`o.seller_id = $${idx++}`);
    params.push(sellerId);
  }
  if (status) {
    conditions.push(`o.status = $${idx++}`);
    params.push(status);
  }
  if (paymentType) {
    conditions.push(`o.payment_type = $${idx++}`);
    params.push(paymentType);
  }
  if (q) {
    conditions.push(`(
      o.customer_name ILIKE $${idx}
      OR o.customer_phone ILIKE $${idx}
      OR o.item_name ILIKE $${idx}
      OR o.tracking_number ILIKE $${idx}
    )`);
    params.push(`%${q}%`);
    idx++;
  }
  if (fromDate) {
    conditions.push(`o.created_at >= $${idx++}`);
    params.push(fromDate);
  }
  if (toDate) {
    conditions.push(`o.created_at <= $${idx++}`);
    params.push(toDate);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const countQuery = `SELECT COUNT(*)::int AS total FROM orders o ${whereClause}`;
  const dataQuery = `SELECT o.*, s.name AS seller_name FROM orders o JOIN sellers s ON s.id = o.seller_id ${whereClause} ORDER BY o.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
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
 * Get aggregated stats for admin dashboard.
 * @returns {Promise<object>}
 */
async function getAdminDashboardStats() {
  const result = await db.query(
    `SELECT
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders,
      COALESCE(SUM(CASE WHEN payment_type = 'COD' AND status != 'delivered' THEN price ELSE 0 END),0)::numeric(12,2) AS cod_pending_amount
     FROM orders`
  );
  return result.rows[0];
}

/**
 * Get aggregated stats for seller dashboard.
 * @param {number} sellerId
 * @returns {Promise<object>}
 */
async function getSellerDashboardStats(sellerId) {
  const result = await db.query(
    `SELECT
      COUNT(*)::int AS total_orders,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_orders,
      COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered_orders,
      COALESCE(SUM(CASE WHEN payment_type = 'COD' AND status != 'delivered' THEN price ELSE 0 END),0)::numeric(12,2) AS cod_pending_amount
     FROM orders
     WHERE seller_id = $1`,
    [sellerId]
  );
  return result.rows[0];
}

async function getOrderByTrackingNumber(trackingNumber) {
  const result = await db.query(
    `SELECT o.*, s.name AS seller_name, s.email AS seller_email, s.telephone AS seller_phone
     FROM orders o
     JOIN sellers s ON s.id = o.seller_id
     WHERE o.tracking_number = $1`,
    [trackingNumber]
  );

  return result.rows[0] || null;
}

module.exports = {
  createOrder,
  getOrdersBySeller,
  getAllOrders,
  getOrderWithSeller,
  updateOrderStatus,
  updateTrackingNumber,
  updateOrderStatusAdvanced,
  getOrderById,
  getOrderByTrackingNumber,
  listOrdersAdvanced,
  getAdminDashboardStats,
  getSellerDashboardStats,
  assignDlpToOrder,
  getOrdersByDlp,
  getDlpDashboardStats,
  markCodCollected,
};