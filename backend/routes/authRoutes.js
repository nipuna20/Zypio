const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const adminController = require('../controllers/adminController');
const dlpController = require('../controllers/dlpController');

// Seller routes
router.post('/seller/register', sellerController.registerSeller);
router.post('/seller/login', sellerController.loginSeller);

// Admin routes
router.post('/admin/register', adminController.registerAdmin);
router.post('/admin/login', adminController.loginAdmin);

// Delivery partner (DLP) routes
router.post('/dlp/register', dlpController.registerDlp);
router.post('/dlp/login', dlpController.loginDlp);

module.exports = router;