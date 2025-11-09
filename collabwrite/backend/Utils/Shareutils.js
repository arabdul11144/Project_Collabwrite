// utils/shareUtils.js
const crypto = require('crypto');

// Generate unique share token
const generateShareToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate share link
const generateShareLink = (shareId) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/share/${shareId}`;
};

// Validate email format
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

module.exports = {
  generateShareToken,
  generateShareLink,
  isValidEmail
};