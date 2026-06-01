const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const dlpModel = require('../models/dlpModel');

/**
 * Register a new delivery partner (DLP).
 * A DLP must be approved by an admin before they can sign in.
 */
async function registerDlp(req, res) {
  const { name, email, telephone, password } = req.body;
  if (!name || !email || !telephone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existing = await dlpModel.findDlpByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Delivery partner with this email already exists' });
    }
    const hashed = await hashPassword(password);
    const dlp = await dlpModel.createDlp({ name, email, telephone, password: hashed });
    const token = generateToken({ id: dlp.id, role: 'dlp' });
    // On registration the account is not approved; front-end should show a waiting message.
    res.status(201).json({ token, dlp });
  } catch (error) {
    console.error('DLP registration error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Login for delivery partners.
 */
async function loginDlp(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const dlp = await dlpModel.findDlpByEmail(email);
    if (!dlp) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const match = await comparePassword(password, dlp.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (dlp.is_active === false) {
      return res.status(403).json({ message: 'DLP account is inactive' });
    }
    if (dlp.is_approved === false) {
      return res.status(403).json({ message: 'DLP account is awaiting admin approval' });
    }
    const token = generateToken({ id: dlp.id, role: 'dlp' });
    res.json({ token, dlp: { id: dlp.id, name: dlp.name, email: dlp.email } });
  } catch (error) {
    console.error('DLP login error', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  registerDlp,
  loginDlp,
};