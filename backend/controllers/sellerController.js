const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const sellerModel = require('../models/sellerModel');

/**
 * Register a new seller.
 */
async function registerSeller(req, res) {
  const { name, businessRegNo, email, telephone, nic, address, password } = req.body;
  if (!name || !businessRegNo || !email || !telephone || !nic || !address || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existing = await sellerModel.findSellerByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Seller with this email already exists' });
    }
    const hashed = await hashPassword(password);
    const seller = await sellerModel.createSeller({ name, businessRegNo, email, telephone, nic, address, password: hashed });
    const token = generateToken({ id: seller.id, role: 'seller' });
    res.status(201).json({ token, seller });
  } catch (error) {
    console.error('Seller registration error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Seller login.
 */
async function loginSeller(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const seller = await sellerModel.findSellerByEmail(email);
    if (!seller) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await comparePassword(password, seller.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Check if seller is active and approved
    if (seller.is_active === false) {
      return res.status(403).json({ message: 'Seller account is inactive' });
    }
    if (seller.is_approved === false) {
      return res.status(403).json({ message: 'Seller account is awaiting admin approval' });
    }
    const token = generateToken({ id: seller.id, role: 'seller' });
    res.json({ token, seller: { id: seller.id, name: seller.name, email: seller.email } });
  } catch (error) {
    console.error('Seller login error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  registerSeller,
  loginSeller,
};