const crypto = require('node:crypto');

const generateOrderCode = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `WRD-${date}-${suffix}`;
};

module.exports = { generateOrderCode };
