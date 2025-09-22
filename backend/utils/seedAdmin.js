const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const User = mongoose.model('User');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const address = process.env.ADMIN_ADDRESS || 'Head Office';
  const type = 'Admin';

  const existing = await User.findOne({ $or: [{ username }, { email }], type });
  if (existing) {
    console.log('[seedAdmin] Admin user already exists');
    return existing;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await User.create({ username, email, password: hashed, address, type });
  console.log('[seedAdmin] Default admin created:', { id: admin._id, username: admin.username, email: admin.email });
  return admin;
}

module.exports = { seedAdmin };


