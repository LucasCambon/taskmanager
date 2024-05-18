const jwt = require('jsonwebtoken');
const db = require('../database/models');

const authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Check if the token is blacklisted
    const blacklisted = await db.BlacklistedToken.findOne({ where: { token } });
    if (blacklisted) {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

module.exports = authenticateToken;