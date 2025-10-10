const CustomOrder = require('../models/CustomOrder');
const Tailor = require('../models/Tailor');
const ClothCustomizer = require('../models/ClothCustomizerModel');

// Helpers
const isAdmin = (user) => user?.type === 'Admin' || user?.role === 'admin';

const canViewOrder = async (user, order) => {
  if (!user || !order) return false;
  if (isAdmin(user)) return true;
  if (String(order.customerId) === String(user._id)) return true;
  if (order.assignedTailor) {
    const tailor = await Tailor.findById(order.assignedTailor);
    if (tailor && String(tailor.userId) === String(user._id)) return true;
  }
  return false;
};

// Admin: migrate data from ClothCustomizerModel into CustomOrder
exports.migrateFromCustomizer = async (req, res) => {
  try {
    const { limit = 500, dryRun = 'false' } = req.query;
    const docs = await ClothCustomizer.find({}).sort({ createdAt: -1 }).limit(Number(limit));
    let created = 0;

    // Very simple existence check: look for a CustomOrder with same customerId and createdAt within 5 minutes window
    const windowMs = 5 * 60 * 1000;

    for (const c of docs) {
      const near = await CustomOrder.findOne({
        customerId: c.userId,
        createdAt: { $gte: new Date(c.createdAt.getTime() - windowMs), $lte: new Date(c.createdAt.getTime() + windowMs) }
      });
      if (near) continue; // likely already migrated

      if (dryRun === 'true') { created += 1; continue; }

      await CustomOrder.create({
        customerId: c.userId,
        config: {
          clothingType: c.clothingType || 'tshirt',
          size: c.size || 'M',
          color: c.color || 'white',
          quantity: typeof c.quantity === 'number' ? c.quantity : 1,
          notes: c.nickname || undefined,
        },
        // Rich design snapshot for read-only 3D viewer
        design: {
          designImageUrl: c.selectedDesign?.preview || undefined,
          selectedDesign: c.selectedDesign || undefined,
          placedDesigns: Array.isArray(c.placedDesigns) ? c.placedDesigns.map(d => ({
            url: d?.preview || d?.url || undefined,
            x: d?.position?.x ?? undefined,
            y: d?.position?.y ?? undefined,
            scale: d?.size ?? undefined,
            rotation: d?.rotation ?? 0,
            side: d?.side || 'front',
            preview: d?.preview || undefined,
          })) : [],
          designMeta: c.selectedDesign || undefined,
        },
        status: 'pending',
        price: typeof c.totalPrice === 'number' ? c.totalPrice : undefined,
        previewGallery: Array.isArray(c.placedDesigns) ? c.placedDesigns.map(d => d?.preview).filter(Boolean) : [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      });
      created += 1;
    }

    return res.json({ status: 'ok', migrated: created, scanned: docs.length, dryRun: dryRun === 'true' });
  } catch (err) {
    console.error('migrateFromCustomizer error:', err);
    return res.status(500).json({ status: 'error', message: 'Migration failed' });
  }
};

// Customer: create custom order
exports.createOrder = async (req, res) => {
  try {
    const { config, design, measurements, price, previewGallery } = req.body || {};
    if (!config?.clothingType || !config?.size || !config?.color) {
      return res.status(400).json({ status: 'error', message: 'config.clothingType, config.size, and config.color are required' });
    }
    const doc = await CustomOrder.create({
      customerId: req.user._id,
      config,
      design,
      measurements,
      status: 'pending',
      price,
      previewGallery: Array.isArray(previewGallery) ? previewGallery : [],
    });
    res.status(201).json({ status: 'ok', data: doc });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create order' });
  }
};

// Admin: list all orders
exports.listAll = async (req, res) => {
  try {
    const { status, tailorId, id, unassigned } = req.query;
    const q = {};
    if (status) q.status = status;
    if (tailorId) q.assignedTailor = tailorId;
    if (id) q._id = id;
    if (unassigned === 'true') {
      // Match orders where assignedTailor is null or not set
      q.$or = [
        { assignedTailor: { $exists: false } },
        { assignedTailor: null },
      ];
    }

    const docs = await CustomOrder.find(q)
      .populate('customerId', 'username email')
      .populate({ path: 'assignedTailor', select: 'name userId isActive' })
      .sort({ createdAt: -1 });

    res.json({ status: 'ok', count: docs.length, data: docs });
  } catch (err) {
    console.error('listAll error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list orders' });
  }
};

// Customer: my orders
exports.listMine = async (req, res) => {
  try {
    const docs = await CustomOrder.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    res.json({ status: 'ok', count: docs.length, data: docs });
  } catch (err) {
    console.error('listMine error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list my orders' });
  }
};

// Tailor: assigned to me
exports.listAssignedToMe = async (req, res) => {
  try {
    // Find the Tailor profile for current user
    const tailor = await Tailor.findOne({ userId: req.user._id });
    if (!tailor) return res.status(403).json({ status: 'error', message: 'No tailor profile' });

    const docs = await CustomOrder.find({ assignedTailor: tailor._id })
      .sort({ createdAt: -1 });

    res.json({ status: 'ok', count: docs.length, data: docs });
  } catch (err) {
    console.error('listAssignedToMe error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to list assigned orders' });
  }
};

// Get one order (authorized)
exports.getOne = async (req, res) => {
  try {
    const order = await CustomOrder.findById(req.params.id)
      .populate({ path: 'assignedTailor', select: 'name userId isActive' });
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    const allowed = await canViewOrder(req.user, order);
    if (!allowed) return res.status(403).json({ status: 'error', message: 'Not allowed to view this order' });

    res.json({ status: 'ok', data: order });
  } catch (err) {
    console.error('getOne error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to get order' });
  }
};

// Admin: assign tailor
exports.assignTailor = async (req, res) => {
  try {
    const { tailorId } = req.body || {};
    if (!tailorId) return res.status(400).json({ status: 'error', message: 'tailorId is required' });

    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    // Confirm that the target is a valid Tailor profile
    const tailor = await Tailor.findById(tailorId);
    if (!tailor || !tailor.isActive) {
      return res.status(400).json({ status: 'error', message: 'Invalid or inactive tailor' });
    }

    order.assignedTailor = tailor._id;
    order.assignedAt = new Date();
    if (order.status === 'pending') order.status = 'assigned';
    await order.save();

    res.json({ status: 'ok', message: 'Order assigned', data: order });
  } catch (err) {
    console.error('assignTailor error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to assign tailor' });
  }
};

// Tailor/Admin: update status with allowed transitions
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const order = await CustomOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    // Admin override
    if (isAdmin(req.user)) {
      order.status = status;
      await order.save();
      return res.json({ status: 'ok', data: order });
    }

    // Tailor transitions
    const tailor = await Tailor.findOne({ userId: req.user._id });
    if (!tailor || String(order.assignedTailor) !== String(tailor._id)) {
      return res.status(403).json({ status: 'error', message: 'Not assigned to this order' });
    }

    const allowedTransitions = {
      assigned: ['accepted'],
      accepted: ['in_progress'],
      in_progress: ['completed'],
      completed: ['delivered'],
    };

    const nexts = allowedTransitions[order.status] || [];
    if (!nexts.includes(status)) {
      return res.status(400).json({ status: 'error', message: `Invalid status transition from ${order.status} to ${status}` });
    }

    order.status = status;
    await order.save();
    res.json({ status: 'ok', data: order });
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to update status' });
  }
};
