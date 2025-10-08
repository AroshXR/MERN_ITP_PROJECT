const Tailor = require('../models/Tailor');
const User = require('../models/User');
const CustomOrder = require('../models/CustomOrder');
const ClothCustomizer = require('../models/ClothCustomizerModel');

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
    const tailors = await Tailor.find()
      .populate('userId', 'username email type')
      .sort({ createdAt: -1 });

    // Active statuses for orders assigned to a tailor
    const ACTIVE_STATUSES = ['pending','assigned','accepted','in_progress'];

    // Compute active order count for each tailor in parallel
    const withStats = await Promise.all(tailors.map(async (t) => {
      const activeOrderCount = await CustomOrder.countDocuments({ assignedTailor: t._id, status: { $in: ACTIVE_STATUSES } });
      const busy = activeOrderCount > 10;
      return {
        ...t.toObject(),
        user: t.userId ? { id: t.userId._id, username: t.userId.username, email: t.userId.email, type: t.userId.type } : null,
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

// Admin: overview of tailors (from Tailor collection) and custom orders (from ClothCustomizer)
exports.adminOverview = async (req, res) => {
  try {
    // Tailors with stats
    const tailors = await Tailor.find().sort({ createdAt: -1 });
    const ACTIVE_STATUSES = ['pending','assigned','accepted','in_progress'];
    const tailorsWithStats = await Promise.all(tailors.map(async (t) => {
      const activeOrderCount = await CustomOrder.countDocuments({ assignedTailor: t._id, status: { $in: ACTIVE_STATUSES } });
      const busy = activeOrderCount > 10;
      return { ...t.toObject(), activeOrderCount, busy };
    }));

    // Tailors from User collection (registration source), optionally enriched with Tailor profile
    const tailorUsers = await User.find({ type: 'Tailor' })
      .select('_id username email type createdAt');

    // Build a map of userId -> Tailor profile to enrich
    const tailorProfiles = await Tailor.find({ userId: { $in: tailorUsers.map(u => u._id) } })
      .select('userId name phone skills isActive rating createdAt');
    const profileByUserId = new Map(tailorProfiles.map(p => [String(p.userId), p]));

    const tailorsFromUsers = tailorUsers.map(u => {
      const prof = profileByUserId.get(String(u._id));
      return {
        user: { id: u._id, username: u.username, email: u.email, type: u.type, createdAt: u.createdAt },
        profile: prof ? {
          id: prof._id,
          name: prof.name,
          phone: prof.phone,
          skills: prof.skills,
          isActive: prof.isActive,
          rating: prof.rating,
          createdAt: prof.createdAt,
        } : null,
      };
    });

    res.json({
      status: 'ok',
      data: {
        tailors: tailorsWithStats,
        tailorsFromUsers,
        counts: {
          tailors: tailorsWithStats.length,
          tailorsFromUsers: tailorsFromUsers.length,
        }
      }
    });
  } catch (err) {
    console.error('adminOverview error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to build overview' });
  }
};
