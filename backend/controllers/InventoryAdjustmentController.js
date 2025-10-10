const mongoose = require("mongoose");
const InventoryAdjustment = require("../models/InventoryAdjustment");
const ClothingItem = require("../models/ClothingItemModel");

// POST /inventory/adjustments
// Body: { paymentId, items: [{ itemId, quantity }] }
exports.createPending = async (req, res) => {
  try {
    const { paymentId, items, source = "outlet" } = req.body || {};

    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ message: "paymentId (string) is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array is required" });
    }

    // Validate items: ObjectId and quantity > 0
    for (const [idx, it] of items.entries()) {
      if (!it || !it.itemId || !mongoose.Types.ObjectId.isValid(it.itemId)) {
        return res.status(400).json({ message: `items[${idx}].itemId must be a valid ObjectId` });
      }
      const qty = Number(it.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ message: `items[${idx}].quantity must be a positive number` });
      }
    }

    // Create pending adjustment (idempotent on paymentId via unique index)
    const doc = await InventoryAdjustment.create({ paymentId, source, items, status: "pending" });

    return res.status(201).json({ message: "Adjustment created", id: doc._id, status: doc.status });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(200).json({ message: "Adjustment already exists for this paymentId", duplicate: true });
    }
    console.error("Error creating pending adjustment:", err);
    return res.status(500).json({ message: "Failed to create adjustment" });
  }
};

// POST /inventory/adjustments/apply
// Body: { paymentId }
exports.applyByPayment = async (req, res) => {
  try {
    const { paymentId } = req.body || {};
    if (!paymentId || typeof paymentId !== "string") {
      return res.status(400).json({ message: "paymentId (string) is required" });
    }

    const adj = await InventoryAdjustment.findOne({ paymentId });
    if (!adj) {
      return res.status(404).json({ message: "No adjustment found for paymentId" });
    }

    if (adj.status === "applied") {
      return res.status(200).json({ message: "Adjustment already applied", appliedAt: adj.appliedAt, status: adj.status });
    }

    const result = { attempted: true, decremented: 0, failed: [] };

    // Optionally, use a transaction if available (Mongo replica set required)
    const session = await mongoose.startSession();
    let useTxn = false;
    try {
      await session.withTransaction(async () => {
        useTxn = true;
        for (const it of adj.items) {
          const itemId = it.itemId;
          const qty = Number(it.quantity) || 0;
          if (qty <= 0) continue;
          const updated = await ClothingItem.findOneAndUpdate(
            { _id: itemId, stock: { $gte: qty } },
            { $inc: { stock: -qty } },
            { new: true, session }
          );
          if (!updated) {
            throw new Error(`Insufficient stock or item not found for ${itemId}`);
          }
          result.decremented += qty;
        }
        // Mark applied
        adj.status = "applied";
        adj.appliedAt = new Date();
        await adj.save({ session });
      });
    } catch (txErr) {
      // If transaction not supported or failed, perform best-effort per-item decrements without txn
      if (!useTxn) {
        for (const it of adj.items) {
          const itemId = it.itemId;
          const qty = Number(it.quantity) || 0;
          if (qty <= 0) continue;
          try {
            const updated = await ClothingItem.findOneAndUpdate(
              { _id: itemId, stock: { $gte: qty } },
              { $inc: { stock: -qty } },
              { new: true }
            );
            if (!updated) {
              result.failed.push({ itemId, reason: "Insufficient stock or item not found", requested: qty });
            } else {
              result.decremented += qty;
            }
          } catch (e) {
            result.failed.push({ itemId, reason: e.message, requested: qty });
          }
        }
        adj.status = result.failed.length === 0 ? "applied" : "failed";
        adj.appliedAt = result.failed.length === 0 ? new Date() : null;
        await adj.save();
      } else {
        console.error("Transaction failed:", txErr);
        await session.endSession();
        return res.status(500).json({ message: "Failed to apply adjustment (transaction)", error: txErr.message });
      }
    }
    await session.endSession();

    return res.status(200).json({
      message: "Adjustment processed",
      paymentId,
      status: adj.status,
      appliedAt: adj.appliedAt,
      inventory: result,
    });
  } catch (err) {
    console.error("Error applying adjustment:", err);
    return res.status(500).json({ message: "Failed to apply adjustment" });
  }
};
