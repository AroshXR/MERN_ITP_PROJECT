const Tailor = require('../models/Tailor');
const User = require('../models/User');
const CustomOrder = require('../models/CustomOrder');

// Register or update current user as a Tailor
exports.registerTailor = async (req, res) => {
  try {
    const { name, phone, skills = [], payoutEmail } = req.body || {};
    if (!name) return res.status(400).json({ status: 'error', message: 'Name is required' });

    const existing = await Tailor.findOne({ userId: req.user._id });
    if (existing) {
      existing.name = name;
      existing.phone = phone;
      existing.skills = Array.isArray(skills) ? skills : [];
      existing.payoutEmail = payoutEmail;
      existing.isActive = true;
      await existing.save();
      return res.json({ status: 'ok', data: existing });
    }

    const created = await Tailor.create({
      userId: req.user._id,
      name,
      phone,
      skills: Array.isArray(skills) ? skills : [],
      payoutEmail,
      isActive: true,
    });
    return res.status(201).json({ status: 'ok', data: created });
  } catch (err) {
    console.error('registerTailor error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to register tailor' });
  }
};

// Get my tailor profile
exports.getMyTailorProfile = async (req, res) => {
  try {
    const tailor = await Tailor.findOne({ userId: req.user._id });
    if (!tailor) return res.status(404).json({ status: 'error', message: 'Tailor profile not found' });

    const ACTIVE_STATUSES = ['pending','assigned','accepted','in_progress'];
    const activeOrderCount = await CustomOrder.countDocuments({ assignedTailor: tailor._id, status: { $in: ACTIVE_STATUSES } });
    const busy = activeOrderCount > 10;

    res.json({ status: 'ok', data: { ...tailor.toObject(), activeOrderCount, busy } });
  } catch (err) {
    console.error('getMyTailorProfile error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch profile' });
  }
};

// Admin: list all tailors with stats (rating is stored; activeOrderCount computed; busy if > 10)
exports.listTailors = async (req, res) => {
  try {
    const tailors = await Tailor.find().sort({ createdAt: -1 });

    // Active statuses for orders assigned to a tailor
    const ACTIVE_STATUSES = ['pending','assigned','accepted','in_progress'];

    // Compute active order count for each tailor in parallel
    const withStats = await Promise.all(tailors.map(async (t) => {
      const activeOrderCount = await CustomOrder.countDocuments({ assignedTailor: t._id, status: { $in: ACTIVE_STATUSES } });
      const busy = activeOrderCount > 10;
      return {
        ...t.toObject(),
        activeOrderCount,
        busy,
      };
    }));

    res.json({ status: 'ok', count: withStats.length, data: withStats });
  } catch (err) {
    console.error('listTailors error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list tailors' });
  }
};

// Admin: sync Tailor collection from Users with type 'Tailor'
exports.syncTailorsFromUsers = async (req, res) => {
  try {
    const users = await User.find({ type: 'Tailor' }).select('_id username email');
    let created = 0;
    let updated = 0;

    for (const u of users) {
      const existing = await Tailor.findOne({ userId: u._id });
      if (!existing) {
        await Tailor.create({
          userId: u._id,
          name: u.username || 'Tailor',
          isActive: true,
        });
        created += 1;
      } else {
        // Ensure active and has a default name if missing
        let dirty = false;
        if (!existing.name && u.username) {
          existing.name = u.username;
          dirty = true;
        }
        if (existing.isActive !== true) {
          existing.isActive = true;
          dirty = true;
        }
        if (dirty) {
          await existing.save();
          updated += 1;
        }
      }
    }

    const total = await Tailor.countDocuments();
    res.json({ status: 'ok', message: 'Sync complete', created, updated, total });
  } catch (err) {
    console.error('syncTailorsFromUsers error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to sync tailors' });
  }
};
