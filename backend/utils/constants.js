// This module defines constant values used across the backend, such as valid order statuses.

// Define the list of supported order statuses. These should mirror any frontend lists
// used for status dropdowns to avoid mismatches. The first value 'pending' represents
// a newly created order.
// Extend the list of supported order statuses to accommodate delivery
// partners (DLPs) and a more realistic lifecycle. These statuses
// describe the progression of a parcel from creation to completion.
// Note: existing values remain for backwards compatibility.
const ORDER_STATUSES = [
  // Initial state when an order is created by a seller
  'pending',
  // Seller has confirmed the order details (optional)
  'confirmed',
  // Order has been packed and ready for pickup
  'packed',
  // Order assigned to a delivery partner (DLP)
  'assigned_to_dlp',
  // Optional intermediate states
  'pickup_scheduled',
  'picked_up',
  'at_warehouse',
  // Out for delivery to the customer
  'out_for_delivery',
  // Successfully delivered to the customer
  'delivered',
  // Delivery failed (e.g. customer unavailable)
  'failed_delivery',
  // Order returned to the seller
  'returned',
  // Order has been cancelled before completion
  'cancelled',
  'dispatched',
  // New statuses introduced for extended logistics workflow
  // Package has been received at the hub/warehouse inbound area
  'received_at_hub',
  // Package has been scanned and sorted at the sorting center
  'sorted',
  // Package is ready for final mile delivery after sorting
  'ready_for_delivery',
  // Package could not be delivered and is held as a residual order
  'residual',
  // COD funds have been deposited into the company\'s bank account
  'bank_deposited',
  // Payment has been released to the merchant after deposit
  'payment_released',
];

module.exports = { ORDER_STATUSES };