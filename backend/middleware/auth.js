const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Authentication middleware to protect routes.
 * It expects a bearer token in the Authorization header.
 * If the token is valid, the decoded payload is attached to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.error('Authentication error', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Authorization middleware to ensure the user has the specified role.
 * If the user role does not match, access is forbidden.
 *
 * @param {string} role - The required role (e.g. 'admin', 'seller').
 */
function authorize(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };