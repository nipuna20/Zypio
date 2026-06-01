const orderModel = require('../models/orderModel');
const statusHistoryModel = require('../models/orderStatusHistoryModel');
const auditLogModel = require('../models/auditLogModel');
const { ORDER_STATUSES } = require('../utils/constants');

/**
 * Controller for delivery partner (DLP) specific order operations.
 */

/**
 * Get dashboard statistics for a DLP.
 * The dashboard shows basic metrics: total assigned orders, pending deliveries,
 * delivered orders and COD pending amount.
 */
async function getDlpDashboard(req, res) {
  try {
    const dlpId = req.user.id;
    const stats = await orderModel.getDlpDashboardStats(dlpId);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('DLP dashboard error', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
}

/**
 * List orders assigned to the logged in DLP.
 */
async function listDlpOrders(req, res) {
  try {
    const dlpId = req.user.id;
    const orders = await orderModel.getOrdersByDlp(dlpId);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('DLP list orders error', error);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
}

/**
 * Update order status by DLP.
 * Allowed statuses are restricted to those relevant to delivery partners.
 */
async function updateOrderStatusByDlp(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { status, note } = req.body;
    // Only allow statuses that a DLP is permitted to set
    const allowedStatuses = [
      'pickup_scheduled',
      'picked_up',
      'at_warehouse',
      'received_at_hub',
      'sorted',
      'out_for_delivery',
      'delivered',
      'failed_delivery',
      'returned',
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for DLP' });
    }
    // Ensure the order is assigned to this DLP
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order.dlp_id || Number(order.dlp_id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }
    // Update status and optionally the note
    const updatedOrder = await orderModel.updateOrderStatusAdvanced(orderId, status, note);
    // Record status history
    await statusHistoryModel.createStatusHistory({
      orderId,
      oldStatus: order.status || null,
      newStatus: status,
      changedByRole: 'dlp',
      changedById: req.user.id,
      note: note || null,
    });
    // Audit log
    await auditLogModel.createAuditLog({
      actorRole: 'dlp',
      actorId: req.user.id,
      action: 'UPDATE_ORDER_STATUS',
      entityType: 'order',
      entityId: orderId,
      metadata: { from: order.status, to: status, note: note || null },
    });
    res.json({ success: true, message: 'Order status updated', data: updatedOrder });
  } catch (error) {
    console.error('DLP update order status error', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
}

/**
 * Mark the COD as collected for an order. This should only be
 * called when payment type is COD and the order is being delivered.
 */
async function markCodCollected(req, res) {
  try {
    const orderId = Number(req.params.id);
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!order.dlp_id || Number(order.dlp_id) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }
    if (order.payment_type !== 'COD') {
      return res.status(400).json({ success: false, message: 'COD collection not applicable for this order' });
    }
    if (order.cod_collected) {
      return res.status(400).json({ success: false, message: 'COD already marked as collected' });
    }
    const updated = await orderModel.markCodCollected(orderId);
    await auditLogModel.createAuditLog({
      actorRole: 'dlp',
      actorId: req.user.id,
      action: 'MARK_COD_COLLECTED',
      entityType: 'order',
      entityId: orderId,
      metadata: {},
    });
    res.json({ success: true, message: 'COD marked as collected', data: updated });
  } catch (error) {
    console.error('DLP mark COD collected error', error);
    res.status(500).json({ success: false, message: 'Failed to mark COD as collected' });
  }
}

module.exports = {
  getDlpDashboard,
  listDlpOrders,
  updateOrderStatusByDlp,
  markCodCollected,
};