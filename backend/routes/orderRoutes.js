const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Configure multer for handling file uploads
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPG, PNG, PDF allowed.'));
    }
    cb(null, true);
  },
});

// Public: submit order for seller
router.post('/seller/:sellerId/orders', upload.single('bankSlip'), orderController.submitOrder);

// Seller: list own orders
router.get('/seller/:sellerId/orders', authenticate, authorize('seller'), orderController.listSellerOrders);

// Admin: list all orders
router.get('/orders', authenticate, authorize('admin'), orderController.listAllOrders);

router.patch(
  '/orders/scan-dispatch',
  authenticate,
  orderController.dispatchOrderByBarcode
);

// New: scan inbound parcels at hub. Accepts trackingNumber in body and updates status to 'received_at_hub'
router.patch(
  '/orders/scan-inbound',
  authenticate,
  orderController.scanInbound
);

// New: scan parcels after sorting. Updates status to 'sorted'
router.patch(
  '/orders/scan-sort',
  authenticate,
  orderController.scanSort
);

// New: mark order as bank deposited (finance). Only admin can perform this action
router.patch(
  '/orders/:id/deposit',
  authenticate,
  authorize('admin'),
  orderController.markBankDeposited
);

// Authenticated: download PDF
router.get('/orders/:orderId/pdf', authenticate, orderController.downloadOrderPdf);

module.exports = router;