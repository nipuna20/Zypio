const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const adminModel = require('../models/adminModel');
const sellerModel = require('../models/sellerModel');
const orderModel = require('../models/orderModel');
const dlpModel = require('../models/dlpModel');

async function registerAdmin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const existing = await adminModel.findAdminByUsername(username);
    if (existing) {
      return res.status(400).json({ message: 'Admin with this username already exists' });
    }
    const hashed = await hashPassword(password);
    const admin = await adminModel.createAdmin({ username, password: hashed });
    const token = generateToken({ id: admin.id, role: 'admin' });
    res.status(201).json({ token, admin });
  } catch (error) {
    console.error('Admin registration error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function loginAdmin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const admin = await adminModel.findAdminByUsername(username);
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await comparePassword(password, admin.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken({ id: admin.id, role: 'admin' });
    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Admin login error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const statusHistoryModel = require('../models/orderStatusHistoryModel');
const auditLogModel = require('../models/auditLogModel');
const { ORDER_STATUSES } = require('../utils/constants');

// Dashboard statistics for admin
async function getAdminDashboard(req, res) {
  try {
    const stats = await orderModel.getAdminDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Admin dashboard error', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
}

// List sellers with pagination and optional approval filter
async function getSellers(req, res) {
  try {
    const { page = 1, pageSize = 20, approved } = req.query;
    const result = await sellerModel.listSellers({ page: Number(page), pageSize: Number(pageSize), approved });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get sellers error', error);
    res.status(500).json({ success: false, message: 'Failed to load sellers' });
  }
}

// Approve a seller
async function approveSeller(req, res) {
  try {
    const sellerId = Number(req.params.id);
    const adminId = req.user.id;
    const seller = await sellerModel.approveSeller(sellerId, adminId);
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    // audit log
    await auditLogModel.createAuditLog({
      actorRole: 'admin',
      actorId: adminId,
      action: 'APPROVE_SELLER',
      entityType: 'seller',
      entityId: sellerId,
      metadata: { sellerEmail: seller.email },
    });
    res.json({ success: true, message: 'Seller approved', data: seller });
  } catch (error) {
    console.error('Approve seller error', error);
    res.status(500).json({ success: false, message: 'Failed to approve seller' });
  }
}

// Update order status by admin
async function updateOrderStatusByAdmin(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { status, note } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const currentOrder = await orderModel.getOrderById(orderId);
    if (!currentOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const updatedOrder = await orderModel.updateOrderStatusAdvanced(orderId, status, note);
    // Insert status history
    await statusHistoryModel.createStatusHistory({
      orderId,
      oldStatus: currentOrder.status || null,
      newStatus: status,
      changedByRole: 'admin',
      changedById: req.user.id,
      note: note || null,
    });
    // Audit log
    await auditLogModel.createAuditLog({
      actorRole: 'admin',
      actorId: req.user.id,
      action: 'UPDATE_ORDER_STATUS',
      entityType: 'order',
      entityId: orderId,
      metadata: { from: currentOrder.status, to: status, note: note || null },
    });
    res.json({ success: true, message: 'Order status updated', data: updatedOrder });
  } catch (error) {
    console.error('Update order status error', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
}

// List orders with filters (admin)
async function listOrdersForAdmin(req, res) {
  try {
    const { page = 1, pageSize = 20, status, paymentType, q, fromDate, toDate } = req.query;
    const result = await orderModel.listOrdersAdvanced({
      page: Number(page),
      pageSize: Number(pageSize),
      status,
      paymentType,
      q,
      fromDate,
      toDate,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Admin list orders error', error);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
}

// Get order details including status history
async function getOrderDetailsForAdmin(req, res) {
  try {
    const orderId = Number(req.params.id);
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    const history = await statusHistoryModel.getOrderStatusHistory(orderId);
    res.json({ success: true, data: { order, statusHistory: history } });
  } catch (error) {
    console.error('Admin order details error', error);
    res.status(500).json({ success: false, message: 'Failed to load order details' });
  }
}

// Get audit logs with pagination and filters
async function getAuditLogs(req, res) {
  try {
    const { page = 1, pageSize = 20, action, entityType } = req.query;
    const logs = await auditLogModel.listAuditLogs({ page: Number(page), pageSize: Number(pageSize), action, entityType });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get audit logs error', error);
    res.status(500).json({ success: false, message: 'Failed to load audit logs' });
  }
}

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getSellers,
  approveSeller,
  updateOrderStatusByAdmin,
  listOrdersForAdmin,
  getOrderDetailsForAdmin,
  getAuditLogs,
  // New admin functions
  getDlps,
  approveDlp,
  assignDlpToOrder,
};

/**
 * List delivery partners (DLPs) with pagination and optional approval filter.
 */
async function getDlps(req, res) {
  try {
    const { page = 1, pageSize = 20, approved } = req.query;
    const result = await dlpModel.listDlps({ page: Number(page), pageSize: Number(pageSize), approved });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get DLPs error', error);
    res.status(500).json({ success: false, message: 'Failed to load DLPs' });
  }
}

/**
 * Approve a DLP. Only admins can do this.
 */
async function approveDlp(req, res) {
  try {
    const dlpId = Number(req.params.id);
    const adminId = req.user.id;
    const dlp = await dlpModel.approveDlp(dlpId, adminId);
    if (!dlp) {
      return res.status(404).json({ success: false, message: 'DLP not found' });
    }
    // audit log
    await auditLogModel.createAuditLog({
      actorRole: 'admin',
      actorId: adminId,
      action: 'APPROVE_DLP',
      entityType: 'dlp',
      entityId: dlpId,
      metadata: { dlpEmail: dlp.email },
    });
    res.json({ success: true, message: 'DLP approved', data: dlp });
  } catch (error) {
    console.error('Approve DLP error', error);
    res.status(500).json({ success: false, message: 'Failed to approve DLP' });
  }
}

/**
 * Assign an order to a delivery partner. This sets the order status to 'assigned_to_dlp'.
 */
async function assignDlpToOrder(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { dlpId } = req.body;
    if (!dlpId) {
      return res.status(400).json({ success: false, message: 'dlpId is required' });
    }
    // Ensure DLP exists and is approved
    const dlp = await dlpModel.findDlpById(dlpId);
    if (!dlp || !dlp.is_approved) {
      return res.status(400).json({ success: false, message: 'Invalid or unapproved DLP' });
    }
    // Assign the DLP and update status
    const order = await orderModel.assignDlpToOrder(orderId, dlpId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Record status history
    await statusHistoryModel.createStatusHistory({
      orderId,
      oldStatus: null, // the old status can be looked up if needed
      newStatus: 'assigned_to_dlp',
      changedByRole: 'admin',
      changedById: req.user.id,
      note: `Assigned to DLP ${dlpId}`,
    });
    // Audit log
    await auditLogModel.createAuditLog({
      actorRole: 'admin',
      actorId: req.user.id,
      action: 'ASSIGN_DLP',
      entityType: 'order',
      entityId: orderId,
      metadata: { dlpId },
    });
    res.json({ success: true, message: 'Order assigned to DLP', data: order });
  } catch (error) {
    console.error('Assign DLP to order error', error);
    res.status(500).json({ success: false, message: 'Failed to assign DLP' });
  }
}