const orderModel = require('../models/orderModel');
const sellerModel = require('../models/sellerModel');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const bwipjs = require('bwip-js');
const statusHistoryModel = require('../models/orderStatusHistoryModel');
const auditLogModel = require('../models/auditLogModel');

/**
 * Submit a new order (public).
 * The request should have sellerId param and req.body fields as defined.
 * req.file is the uploaded bank slip if provided.
 */
async function submitOrder(req, res) {
  const { sellerId } = req.params;
  const {
    customerName,
    customerAddress,
    customerPhone,
    itemName,
    price,
    deliveryAddress,
    paymentType,
    paid,
  } = req.body;
  // Validate required fields
  if (!customerName || !customerAddress || !customerPhone || !itemName || !price || !deliveryAddress || !paymentType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    let bankSlipPath = null;
    if (req.file) {
      bankSlipPath = req.file.filename;
    }
    // Enforce bank slip for bank transfer
    if (paymentType === 'Bank Transfer' && !bankSlipPath) {
      return res.status(400).json({ message: 'Bank slip is required for bank transfer payment type' });
    }
    // Create order in DB
    const orderId = await orderModel.createOrder(sellerId, {
      customerName,
      customerAddress,
      customerPhone,
      itemName,
      price,
      deliveryAddress,
      paymentType,
      paid: paid === 'true' || paid === true,
      bankSlipPath,
    });
    // Generate tracking number
    const { generateTrackingNumber } = require('../services/trackingService');
    const trackingNumber = generateTrackingNumber(orderId);
    // Update order with tracking number
    const updatedOrder = await orderModel.updateTrackingNumber(orderId, trackingNumber);
    // Insert initial status history (pending)
    const statusHistoryModel = require('../models/orderStatusHistoryModel');
    await statusHistoryModel.createStatusHistory({
      orderId,
      oldStatus: null,
      newStatus: updatedOrder.status || 'pending',
      changedByRole: 'seller',
      changedById: parseInt(sellerId, 10),
      note: 'Order created',
    });
    // Audit log
    const auditLogModel = require('../models/auditLogModel');
    await auditLogModel.createAuditLog({
      actorRole: 'seller',
      actorId: parseInt(sellerId, 10),
      action: 'CREATE_ORDER',
      entityType: 'order',
      entityId: orderId,
      metadata: { trackingNumber, paymentType: updatedOrder.payment_type },
    });
    res.status(201).json({ message: 'Order submitted successfully', orderId, trackingNumber });
  } catch (error) {
    console.error('Order submission error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * List orders for a seller.
 */
async function listSellerOrders(req, res) {
  const { sellerId } = req.params;
  // ensure the logged in seller is allowed
  if (req.user.role !== 'seller' || req.user.id !== parseInt(sellerId)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const orders = await orderModel.getOrdersBySeller(sellerId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * List all orders (admin).
 */
async function listAllOrders(req, res) {
  // Only admin is allowed; middleware ensures role
  try {
    const orders = await orderModel.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Download order PDF (waybill) for an order.
 * Only the seller who owns the order or admin can download.
 */
/**
 * Download order PDF (black & white printable waybill).
 * Only the seller who owns the order, assigned DLP, or admin can download.
 */
async function downloadOrderPdf(req, res) {
  const orderId = req.params.orderId || req.params.id;

  try {
    const order = await orderModel.getOrderWithSeller(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'seller' && Number(req.user.id) !== Number(order.seller_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'dlp' && Number(req.user.id) !== Number(order.dlp_id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 24,
    });

    const filename = `waybill-${order.tracking_number || order.id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    const BLACK = '#000000';
    const WHITE = '#FFFFFF';

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 24;
    const contentWidth = pageWidth - margin * 2;

    const trackingNo = order.tracking_number || `ZYP-${String(order.id).padStart(6, '0')}`;
    const createdDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : '-';

    const paymentType = order.payment_type || '-';
    const isCOD = String(paymentType).toUpperCase() === 'COD';
    const codAmount = isCOD ? Number(order.price || 0).toFixed(2) : '0.00';

    const text = (value, x, y, options = {}) => {
      doc
        .fillColor(BLACK)
        .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(options.size || 9)
        .text(value == null || value === '' ? '-' : String(value), x, y, {
          width: options.width,
          align: options.align || 'left',
          lineGap: 1,
        });
    };

    const line = (x1, y1, x2, y2, width = 1) => {
      doc
        .strokeColor(BLACK)
        .lineWidth(width)
        .moveTo(x1, y1)
        .lineTo(x2, y2)
        .stroke();
    };

    const rect = (x, y, w, h, width = 1) => {
      doc
        .strokeColor(BLACK)
        .lineWidth(width)
        .rect(x, y, w, h)
        .stroke();
    };

    const filledRect = (x, y, w, h) => {
      doc.fillColor(BLACK).rect(x, y, w, h).fill();
    };

    const sectionTitle = (title, x, y, w) => {
      filledRect(x, y, w, 20);
      doc
        .fillColor(WHITE)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(title, x + 7, y + 5, { width: w - 14 });
      doc.fillColor(BLACK);
    };

    const labelValue = (label, value, x, y, w, options = {}) => {
      text(label, x, y, {
        size: 7.5,
        bold: true,
        width: w,
      });

      text(value, x, y + 10, {
        size: options.valueSize || 9.5,
        bold: options.boldValue || false,
        width: w,
      });
    };

    const drawRealBarcode = async (x, y, value) => {
      const barcodeText = String(value).trim();

      const barcodePng = await bwipjs.toBuffer({
        bcid: 'code128',
        text: barcodeText,
        scale: 5,
        height: 18,
        includetext: false,
        backgroundcolor: 'FFFFFF',
        paddingwidth: 18,
        paddingheight: 6,
      });

      doc.image(barcodePng, x, y, {
        width: 260,
        height: 72,
      });

      text(barcodeText, x, y + 76, {
        size: 12,
        bold: true,
        width: 260,
        align: 'center',
      });
    };

    // Outer border
    rect(margin, margin, contentWidth, pageHeight - margin * 2, 1.5);

    // Header
    filledRect(margin, margin, contentWidth, 50);

    doc
      .fillColor(WHITE)
      .font('Helvetica-Bold')
      .fontSize(24)
      .text('ZYPIO', margin + 12, margin + 7, { width: 160 });

    doc
      .fillColor(WHITE)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('DELIVERY WAYBILL', margin + 12, margin + 32, { width: 220 });

    doc
      .fillColor(WHITE)
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(`DATE: ${createdDate}`, pageWidth - 220, margin + 18, {
        width: 180,
        align: 'right',
      });

    doc.fillColor(BLACK);

    // Tracking
    const trackingY = margin + 62;
    rect(margin + 8, trackingY, contentWidth - 16, 92, 1.2);
    text('TRACKING NUMBER', margin + 18, trackingY + 10, {
      size: 9,
      bold: true,
      width: 160,
    });

    text(trackingNo, margin + 18, trackingY + 27, {
      size: 20,
      bold: true,
      width: 285,
    });

    await drawRealBarcode(pageWidth - 300, trackingY + 4, trackingNo);
    // Order summary
    const summaryY = trackingY + 104;
    sectionTitle('ORDER SUMMARY', margin + 8, summaryY, contentWidth - 16);
    rect(margin + 8, summaryY + 20, contentWidth - 16, 58, 1);

    const colW = (contentWidth - 16) / 5;

    labelValue('ORDER ID', order.id, margin + 16, summaryY + 32, colW - 10, {
      boldValue: true,
      valueSize: 11,
    });

    labelValue('WAYBILL ID', `WB-${order.id}`, margin + 16 + colW, summaryY + 32, colW - 10, {
      boldValue: true,
      valueSize: 11,
    });

    labelValue('PAYMENT', paymentType, margin + 16 + colW * 2, summaryY + 32, colW - 10, {
      boldValue: true,
      valueSize: 11,
    });

    labelValue('COD', `LKR ${codAmount}`, margin + 16 + colW * 3, summaryY + 32, colW - 10, {
      boldValue: true,
      valueSize: 11,
    });

    labelValue('STATUS', String(order.status || 'pending').replace(/_/g, ' ').toUpperCase(), margin + 16 + colW * 4, summaryY + 32, colW - 10, {
      boldValue: true,
      valueSize: 9,
    });

    // Sender / Receiver
    const addressY = summaryY + 92;
    const gap = 10;
    const halfW = (contentWidth - 16 - gap) / 2;
    const leftX = margin + 8;
    const rightX = leftX + halfW + gap;

    sectionTitle('SENDER / SELLER', leftX, addressY, halfW);
    rect(leftX, addressY + 20, halfW, 118, 1);

    labelValue('NAME', order.seller_name || '-', leftX + 8, addressY + 32, halfW - 16, {
      boldValue: true,
      valueSize: 10.5,
    });

    labelValue('PHONE', order.seller_phone || '-', leftX + 8, addressY + 66, halfW - 16, {
      boldValue: true,
      valueSize: 10.5,
    });

    labelValue('EMAIL', order.seller_email || '-', leftX + 8, addressY + 100, halfW - 16, {
      valueSize: 8.5,
    });

    sectionTitle('RECEIVER / CUSTOMER', rightX, addressY, halfW);
    rect(rightX, addressY + 20, halfW, 118, 1);

    labelValue('NAME', order.customer_name || '-', rightX + 8, addressY + 32, halfW - 16, {
      boldValue: true,
      valueSize: 10.5,
    });

    labelValue('PHONE', order.customer_phone || '-', rightX + 8, addressY + 66, halfW - 16, {
      boldValue: true,
      valueSize: 10.5,
    });

    text('DELIVERY ADDRESS', rightX + 8, addressY + 100, {
      size: 7.5,
      bold: true,
      width: halfW - 16,
    });

    text(order.delivery_address || order.customer_address || '-', rightX + 8, addressY + 110, {
      size: 8.5,
      bold: true,
      width: halfW - 16,
    });

    // Parcel
    const parcelY = addressY + 152;

    sectionTitle('PARCEL DETAILS', margin + 8, parcelY, contentWidth - 16);
    rect(margin + 8, parcelY + 20, contentWidth - 16, 70, 1);

    labelValue('ITEM / PRODUCT', order.item_name || '-', margin + 16, parcelY + 34, 260, {
      boldValue: true,
      valueSize: 11,
    });

    labelValue('VALUE', `LKR ${Number(order.price || 0).toFixed(2)}`, margin + 292, parcelY + 34, 120, {
      boldValue: true,
      valueSize: 11,
    });

    labelValue('PAID', order.paid ? 'PAID' : 'NOT PAID', margin + 430, parcelY + 34, 100, {
      boldValue: true,
      valueSize: 11,
    });

    text('NOTES: ' + (order.notes || 'Handle with care. Contact customer before delivery.'), margin + 16, parcelY + 66, {
      size: 8.5,
      width: contentWidth - 32,
    });

    // COD box
    const codY = parcelY + 104;

    rect(margin + 8, codY, contentWidth - 16, 48, 1.5);

    if (isCOD) {
      text('COLLECT COD PAYMENT', margin + 18, codY + 9, {
        size: 14,
        bold: true,
        width: 260,
      });

      text(`AMOUNT: LKR ${codAmount}`, margin + 285, codY + 9, {
        size: 16,
        bold: true,
        width: 240,
        align: 'right',
      });

      text('Do not deliver without collecting COD amount.', margin + 18, codY + 32, {
        size: 9,
        bold: true,
        width: contentWidth - 36,
      });
    } else {
      text('NO COD COLLECTION REQUIRED', margin + 18, codY + 15, {
        size: 15,
        bold: true,
        width: contentWidth - 36,
        align: 'center',
      });
    }

    // Compact delivery confirmation
    const signY = codY + 62;

    sectionTitle('DELIVERY CONFIRMATION', margin + 8, signY, contentWidth - 16);

    const confirmX = margin + 8;
    const confirmW = contentWidth - 16;
    const confirmH = 82;

    rect(confirmX, signY + 20, confirmW, confirmH, 1.2);

    const boxW = confirmW / 3;

    line(confirmX + boxW, signY + 20, confirmX + boxW, signY + 20 + confirmH, 1);
    line(confirmX + boxW * 2, signY + 20, confirmX + boxW * 2, signY + 20 + confirmH, 1);

    text('PICKED UP BY', confirmX + 8, signY + 32, {
      size: 9,
      bold: true,
      width: boxW - 16,
      align: 'center',
    });

    text('DELIVERED BY', confirmX + boxW + 8, signY + 32, {
      size: 9,
      bold: true,
      width: boxW - 16,
      align: 'center',
    });

    text('RECEIVER SIGNATURE', confirmX + boxW * 2 + 8, signY + 32, {
      size: 9,
      bold: true,
      width: boxW - 16,
      align: 'center',
    });

    line(confirmX + 18, signY + 80, confirmX + boxW - 18, signY + 80, 1);
    line(confirmX + boxW + 18, signY + 80, confirmX + boxW * 2 - 18, signY + 80, 1);
    line(confirmX + boxW * 2 + 18, signY + 80, confirmX + confirmW - 18, signY + 80, 1);

    text('Name / Signature', confirmX + 8, signY + 86, {
      size: 7,
      width: boxW - 16,
      align: 'center',
    });

    text('Name / Signature', confirmX + boxW + 8, signY + 86, {
      size: 7,
      width: boxW - 16,
      align: 'center',
    });

    text('Customer Signature', confirmX + boxW * 2 + 8, signY + 86, {
      size: 7,
      width: boxW - 16,
      align: 'center',
    });

    // Footer
    const footerY = pageHeight - margin - 24;

    line(margin + 8, footerY, pageWidth - margin - 8, footerY, 1);

    text('ZYPIO DELIVERY MANAGEMENT SYSTEM - PRINT IN BLACK & WHITE', margin + 8, footerY + 8, {
      size: 8,
      bold: true,
      width: contentWidth - 16,
      align: 'center',
    });

    doc.end();
  } catch (error) {
    console.error('Error generating printable waybill PDF', error);

    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

async function dispatchOrderByBarcode(req, res) {
  try {
    const { trackingNumber } = req.body;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required',
      });
    }

    const cleanTrackingNumber = String(trackingNumber).trim();

    const order = await orderModel.getOrderByTrackingNumber(cleanTrackingNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for this barcode',
      });
    }

    // Only admin or assigned DLP can dispatch
    if (req.user.role !== 'admin' && req.user.role !== 'dlp') {
      return res.status(403).json({
        success: false,
        message: 'Only admin or DLP can dispatch orders',
      });
    }

    if (req.user.role === 'dlp' && Number(order.dlp_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'This order is not assigned to this DLP',
      });
    }

    const oldStatus = order.status || 'pending';
    const newStatus = 'dispatched';

    const updatedOrder = await orderModel.updateOrderStatusAdvanced(
      order.id,
      newStatus,
      'Order dispatched by barcode scan'
    );

    await statusHistoryModel.createStatusHistory({
      orderId: order.id,
      oldStatus,
      newStatus,
      changedByRole: req.user.role,
      changedById: req.user.id,
      note: 'Order dispatched by barcode scan',
    });

    await auditLogModel.createAuditLog({
      actorRole: req.user.role,
      actorId: req.user.id,
      action: 'DISPATCH_ORDER_BY_BARCODE',
      entityType: 'order',
      entityId: order.id,
      metadata: {
        trackingNumber: cleanTrackingNumber,
        from: oldStatus,
        to: newStatus,
      },
    });

    return res.json({
      success: true,
      message: 'Order dispatched successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Dispatch order by barcode error', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch order',
    });
  }
}

/**
 * Scan a parcel when it arrives at the hub/warehouse inbound area.
 * Updates the order status to 'received_at_hub'. Similar to dispatchOrderByBarcode.
 * Only admin or assigned DLP can perform this scan.
 */
async function scanInbound(req, res) {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      return res.status(400).json({ success: false, message: 'Tracking number is required' });
    }
    const cleanTrackingNumber = String(trackingNumber).trim();
    const order = await orderModel.getOrderByTrackingNumber(cleanTrackingNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this barcode' });
    }
    // Only admin or assigned DLP can scan inbound
    if (req.user.role !== 'admin' && req.user.role !== 'dlp') {
      return res.status(403).json({ success: false, message: 'Only admin or DLP can scan inbound orders' });
    }
    if (req.user.role === 'dlp' && Number(order.dlp_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to this DLP' });
    }
    const oldStatus = order.status || 'pending';
    const newStatus = 'received_at_hub';
    const updatedOrder = await orderModel.updateOrderStatusAdvanced(order.id, newStatus, 'Order inbound scanned');
    await statusHistoryModel.createStatusHistory({
      orderId: order.id,
      oldStatus,
      newStatus,
      changedByRole: req.user.role,
      changedById: req.user.id,
      note: 'Order inbound scanned',
    });
    await auditLogModel.createAuditLog({
      actorRole: req.user.role,
      actorId: req.user.id,
      action: 'SCAN_INBOUND',
      entityType: 'order',
      entityId: order.id,
      metadata: { trackingNumber: cleanTrackingNumber, from: oldStatus, to: newStatus },
    });
    return res.json({ success: true, message: 'Order inbound scanned successfully', data: updatedOrder });
  } catch (error) {
    console.error('Scan inbound error', error);
    return res.status(500).json({ success: false, message: 'Failed to scan inbound' });
  }
}

/**
 * Scan a parcel at the sorting center. Updates status to 'sorted'.
 * Only admin or assigned DLP can perform this scan.
 */
async function scanSort(req, res) {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      return res.status(400).json({ success: false, message: 'Tracking number is required' });
    }
    const cleanTrackingNumber = String(trackingNumber).trim();
    const order = await orderModel.getOrderByTrackingNumber(cleanTrackingNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this barcode' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'dlp') {
      return res.status(403).json({ success: false, message: 'Only admin or DLP can scan sorted orders' });
    }
    if (req.user.role === 'dlp' && Number(order.dlp_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'This order is not assigned to this DLP' });
    }
    const oldStatus = order.status || 'pending';
    const newStatus = 'sorted';
    const updatedOrder = await orderModel.updateOrderStatusAdvanced(order.id, newStatus, 'Order sorted at centre');
    await statusHistoryModel.createStatusHistory({
      orderId: order.id,
      oldStatus,
      newStatus,
      changedByRole: req.user.role,
      changedById: req.user.id,
      note: 'Order sorted at centre',
    });
    await auditLogModel.createAuditLog({
      actorRole: req.user.role,
      actorId: req.user.id,
      action: 'SCAN_SORT',
      entityType: 'order',
      entityId: order.id,
      metadata: { trackingNumber: cleanTrackingNumber, from: oldStatus, to: newStatus },
    });
    return res.json({ success: true, message: 'Order sorting scan successful', data: updatedOrder });
  } catch (error) {
    console.error('Scan sort error', error);
    return res.status(500).json({ success: false, message: 'Failed to scan sort' });
  }
}

/**
 * Mark COD funds as deposited into the bank. Only admins can perform this.
 * Updates status to 'bank_deposited'. Should be called after COD is collected.
 */
async function markBankDeposited(req, res) {
  try {
    const orderId = Number(req.params.id);
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Only COD orders that have been delivered or returned and COD collected can be deposited
    if (order.payment_type !== 'COD') {
      return res.status(400).json({ success: false, message: 'Bank deposit not applicable for this order' });
    }
    if (!order.cod_collected) {
      return res.status(400).json({ success: false, message: 'COD has not been collected for this order' });
    }
    // update status
    const oldStatus = order.status || 'pending';
    const newStatus = 'bank_deposited';
    const updatedOrder = await orderModel.updateOrderStatusAdvanced(orderId, newStatus, 'COD deposited to bank');
    // status history
    await statusHistoryModel.createStatusHistory({
      orderId,
      oldStatus,
      newStatus,
      changedByRole: 'admin',
      changedById: req.user.id,
      note: 'COD deposited to bank',
    });
    // audit log
    await auditLogModel.createAuditLog({
      actorRole: 'admin',
      actorId: req.user.id,
      action: 'MARK_BANK_DEPOSITED',
      entityType: 'order',
      entityId: orderId,
      metadata: { from: oldStatus, to: newStatus },
    });
    return res.json({ success: true, message: 'Order marked as bank deposited', data: updatedOrder });
  } catch (error) {
    console.error('Bank deposit error', error);
    return res.status(500).json({ success: false, message: 'Failed to mark bank deposit' });
  }
}

module.exports = {
  submitOrder,
  listSellerOrders,
  listAllOrders,
  downloadOrderPdf,
  dispatchOrderByBarcode,
  // New controller exports for extended workflow
  scanInbound,
  scanSort,
  markBankDeposited,
};