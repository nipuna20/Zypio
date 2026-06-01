const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const dlpController = require('../controllers/dlpController');
const dlpOrderController = require('../controllers/dlpOrderController');

const router = express.Router();

// Public registration and login for DLPs
router.post('/register', dlpController.registerDlp);
router.post('/login', dlpController.loginDlp);

// All routes below require authentication and DLP role
router.use(authenticate, authorize('dlp'));

// DLP dashboard
router.get('/dashboard', dlpOrderController.getDlpDashboard);

// List orders assigned to the DLP
router.get('/orders', dlpOrderController.listDlpOrders);

// Update order status by DLP
router.patch('/orders/:id/status', dlpOrderController.updateOrderStatusByDlp);

// Mark COD collected (for COD payment type)
router.patch('/orders/:id/cod-collected', dlpOrderController.markCodCollected);

module.exports = router;