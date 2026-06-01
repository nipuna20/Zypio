-- SQL script to initialize the PostgreSQL database schema

-- Drop existing tables if they exist
-- Drop existing tables if they exist. The order of drops accounts for
-- foreign key dependencies (orders depends on sellers, etc.).
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS sellers;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS dlps;

-- Sellers table
CREATE TABLE sellers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_reg_no VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(50) NOT NULL,
  nic VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  password VARCHAR(255) NOT NULL,
  -- Approval flags and metadata
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by INTEGER,
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Delivery partners (DLPs) table
-- This table stores accounts for couriers or delivery partners who handle
-- picking up and delivering parcels. DLPs can be approved or rejected by
-- administrators in the same way as sellers. A DLP must be approved before
-- they can log in and access assigned orders.
CREATE TABLE dlps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  -- Approval flags and metadata
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by INTEGER,
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  customer_name VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  bank_slip VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  tracking_number VARCHAR(50) UNIQUE,
  status_updated_at TIMESTAMPTZ,
  cod_amount NUMERIC(12,2) DEFAULT 0,
  delivery_fee NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  -- Assigned delivery partner. Nullable until an admin assigns a DLP.
  dlp_id INTEGER REFERENCES dlps(id),
  -- Whether the DLP has collected the COD amount (for COD payment type)
  cod_collected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Table for tracking status change history of an order
CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by_role VARCHAR(20) NOT NULL,
  changed_by_id INTEGER,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table for tracking actions performed by users
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  actor_role VARCHAR(20) NOT NULL,
  actor_id INTEGER,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);