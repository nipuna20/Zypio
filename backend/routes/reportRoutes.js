const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const orderModel = require('../models/orderModel');

const router = express.Router();

// Escape CSV values (surround with quotes if needed and escape quotes)
function escapeCsv(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Export orders as CSV. Only admin can access
router.get('/orders/csv', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, paymentType, q, fromDate, toDate } = req.query;
    // Fetch large number of orders; for now not paginated; can be improved to streaming later
    const result = await orderModel.listOrdersAdvanced({
      page: 1,
      pageSize: 100000,
      status,
      paymentType,
      q,
      fromDate,
      toDate,
    });
    const headers = [
      'Order ID',
      'Tracking Number',
      'Seller',
      'Customer Name',
      'Customer Phone',
      'Item Name',
      'Price',
      'Payment Type',
      'Status',
      'Created At',
    ];
    const rows = result.items.map((o) => [
      o.id,
      o.tracking_number,
      o.seller_name,
      o.customer_name,
      o.customer_phone,
      o.item_name,
      o.price,
      o.payment_type,
      o.status,
      o.created_at,
    ]);
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders-report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV export error', error);
    res.status(500).json({ success: false, message: 'Failed to export CSV' });
  }
});

module.exports = router;