const OrderAssignment = require('../models/OrderAssignment');
const Tailor = require('../models/Tailor');
const CustomOrder = require('../models/CustomOrder');
const ClothCustomizer = require('../models/ClothCustomizerModel');

const isAdmin = (user) => user?.type === 'Admin' || user?.role === 'admin';

// Helper: unify order DTO from either source
const buildOrderDTO = async (assignment) => {
  const { orderSource, orderId } = assignment;
  if (orderSource === 'CustomOrder') {
    const o = await CustomOrder.findById(orderId)
      .populate('customerId', 'username email')
      .populate('assignedTailor', 'name userId');
    if (!o) return null;
    return {
      source: 'CustomOrder',
      _id: o._id,
      customer: o.customerId ? { username: o.customerId.username, email: o.customerId.email } : null,
      config: o.config,
      design: o.design,
      price: o.price,
      status: o.status,
      createdAt: o.createdAt,
      assignedTailor: o.assignedTailor ? { id: o.assignedTailor._id, name: o.assignedTailor.name } : null,
    };
  }
  // ClothCustomizer
  const c = await ClothCustomizer.findById(orderId).populate('userId', 'username email');
  if (!c) return null;
  return {
    source: 'ClothCustomizer',
    _id: c._id,
    customer: c.userId ? { username: c.userId.username, email: c.userId.email } : null,
    config: {
      clothingType: c.clothingType,
      color: c.color,
      size: c.size,
      quantity: typeof c.quantity === 'number' ? c.quantity : 1,
    },
    design: {
      designImageUrl: c.selectedDesign?.preview || null,
      selectedDesign: c.selectedDesign || null,
      placedDesigns: Array.isArray(c.placedDesigns) ? c.placedDesigns : [],
    },
    price: c.totalPrice,
    status: 'assigned',
    createdAt: c.createdAt,
    assignedTailor: null,
  };
};

// Admin: get assignment by order (source + id)
exports.listByOrder = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ status: 'error', message: 'Admin only' });
    const { orderSource, orderId } = req.query;
    if (!orderSource || !orderId) {
      return res.status(400).json({ status: 'error', message: 'orderSource and orderId are required' });
    }
    const a = await OrderAssignment.findOne({ orderSource, orderId }).populate('tailorId', 'name userId');
    if (!a) return res.json({ status: 'ok', data: null });
    const order = await buildOrderDTO(a);
    return res.json({ status: 'ok', data: { assignment: a, order } });
  } catch (err) {
    console.error('listByOrder error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to get assignment by order' });
  }
};

exports.assign = async (req, res) => {
  try {
    const { orderSource, orderId, tailorId } = req.body || {};
    if (!isAdmin(req.user)) return res.status(403).json({ status: 'error', message: 'Admin only' });
    if (!orderSource || !orderId || !tailorId) {
      return res.status(400).json({ status: 'error', message: 'orderSource, orderId, tailorId are required' });
    }
    if (!['CustomOrder', 'ClothCustomizer'].includes(orderSource)) {
      return res.status(400).json({ status: 'error', message: 'Invalid orderSource' });
    }
    const tailor = await Tailor.findById(tailorId);
    if (!tailor || !tailor.isActive) return res.status(400).json({ status: 'error', message: 'Invalid or inactive tailor' });

    const doc = await OrderAssignment.findOneAndUpdate(
      { orderSource, orderId },
      { $set: { tailorId, status: 'assigned', assignedAt: new Date() } },
      { upsert: true, new: true }
    );

    // Mirror assignment onto CustomOrder document when applicable
    if (orderSource === 'CustomOrder') {
      await CustomOrder.findByIdAndUpdate(orderId, {
        $set: { assignedTailor: tailor._id, status: 'assigned', assignedAt: new Date() },
      });
    }

    return res.json({ status: 'ok', data: doc });
  } catch (err) {
    console.error('assign error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to assign order' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const assignment = await OrderAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ status: 'error', message: 'Assignment not found' });

    if (isAdmin(req.user)) {
      assignment.status = status;
      await assignment.save();
      return res.json({ status: 'ok', data: assignment });
    }

    // Tailor: must be owner of the assignment
    const tailor = await Tailor.findOne({ userId: req.user._id });
    if (!tailor || String(tailor._id) !== String(assignment.tailorId)) {
      return res.status(403).json({ status: 'error', message: 'Not allowed' });
    }

    const allowed = ['assigned','accepted','in_progress','completed','rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ status: 'error', message: 'Invalid status' });

    assignment.status = status;
    await assignment.save();
    return res.json({ status: 'ok', data: assignment });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update assignment status' });
  }
};

exports.listAdmin = async (req, res) => {
  try {
    const { status, tailorId, orderSource } = req.query;
    const q = {};
    if (status) q.status = status;
    if (tailorId) q.tailorId = tailorId;
    if (orderSource) q.orderSource = orderSource;

    const assigns = await OrderAssignment.find(q)
      .populate('tailorId', 'name userId')
      .sort({ createdAt: -1 });

    const data = [];
    for (const a of assigns) {
      const order = await buildOrderDTO(a);
      data.push({ assignment: a, order });
    }

    return res.json({ status: 'ok', count: data.length, data });
  } catch (err) {
    console.error('listAdmin error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list assignments' });
  }
};

exports.listMine = async (req, res) => {
  try {
    const tailor = await Tailor.findOne({ userId: req.user._id });
    if (!tailor) return res.status(403).json({ status: 'error', message: 'No tailor profile' });

    const assigns = await OrderAssignment.find({ tailorId: tailor._id })
      .sort({ createdAt: -1 });

    const data = [];
    for (const a of assigns) {
      const order = await buildOrderDTO(a);
      if (order) data.push({ assignment: a, order });
    }

    return res.json({ status: 'ok', count: data.length, data });
  } catch (err) {
    console.error('listMine error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list my assignments' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const a = await OrderAssignment.findById(req.params.id).populate('tailorId', 'name userId');
    if (!a) return res.status(404).json({ status: 'error', message: 'Assignment not found' });
    const order = await buildOrderDTO(a);
    return res.json({ status: 'ok', data: { assignment: a, order } });
  } catch (err) {
    console.error('getOne error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to get assignment' });
  }
};

// Admin: list assignments grouped by tailor, including ClothCustomizer/CustomOrder details per assignment
exports.listByTailor = async (req, res) => {
  try {
    if (!isAdmin(req.user)) return res.status(403).json({ status: 'error', message: 'Admin only' });

    const { tailorId, orderSource } = req.query;
    const q = {};
    if (tailorId) q.tailorId = tailorId;
    if (orderSource) q.orderSource = orderSource; // e.g., 'ClothCustomizer'

    const assigns = await OrderAssignment.find(q)
      .populate('tailorId', 'name userId')
      .sort({ createdAt: -1 });

    const grouped = {};
    for (const a of assigns) {
      const key = String(a.tailorId);
      if (!grouped[key]) {
        // Fetch tailor doc for richer info
        const t = await Tailor.findById(a.tailorId).select('name userId isActive');
        grouped[key] = { tailorId: key, tailor: t || a.tailorId, assignments: [] };
      }
      const order = await buildOrderDTO(a); // may fetch ClothCustomizer by orderId
      grouped[key].assignments.push({ assignment: a, order });
    }

    return res.json({ status: 'ok', count: Object.keys(grouped).length, data: Object.values(grouped) });
  } catch (err) {
    console.error('listByTailor error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to group assignments by tailor' });
  }
};
