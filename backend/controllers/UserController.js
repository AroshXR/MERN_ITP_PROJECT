

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");


const sanitizeUser = (user) => {
    if (!user) {
        return null;
    }

    const data = user.toObject ? user.toObject() : user;
    delete data.password;
    return data;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Retrieve all users (admin consumption)
const getAllUsers = async (request, response) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return response.status(200).json({ status: "ok", users });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return response.status(500).json({ status: "error", message: "Unable to fetch users" });
    }
};

// Create user (admin onboarding)
const addUsers = async (request, response) => {
    const { username, address, email, password, type, phoneNumber } = request.body;

    if (!username || !address || !email || !password || !type) {
        return response.status(400).json({
            status: "error",
            message: "Username, address, email, password, and type are required"
        });
    }

    try {
        const existing = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existing) {
            return response.status(409).json({
                status: "error",
                message: "A user with the same username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            address,
            email,
            password: hashedPassword,
            type,
            phoneNumber
        });

        return response.status(201).json({ status: "ok", user: sanitizeUser(user) });
    } catch (error) {
        console.error("Failed to create user:", error);
        return response.status(500).json({ status: "error", message: "Unable to add user" });
    }
};

// Retrieve single user
const getById = async (request, response) => {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    try {
        const user = await User.findById(id).select("-password");
        if (!user) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", user: sanitizeUser(user) });
    } catch (error) {
        console.error("Failed to fetch user:", error);
        return response.status(500).json({ status: "error", message: "Error finding user" });
    }
};

// Update user core details
const updateUser = async (request, response) => {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    const {
        username,
        address,
        email,
        password,
        type,
        phoneNumber,
        identityEvidence,
        identityNotes
    } = request.body;

    const updatePayload = {};

    if (username !== undefined) updatePayload.username = username;
    if (address !== undefined) updatePayload.address = address;
    if (email !== undefined) updatePayload.email = email;
    if (type !== undefined) updatePayload.type = type;
    if (phoneNumber !== undefined) updatePayload.phoneNumber = phoneNumber;
    if (identityEvidence !== undefined) updatePayload.identityEvidence = identityEvidence;
    if (identityNotes !== undefined) updatePayload.identityNotes = identityNotes;

    try {
        if (password) {
            updatePayload.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", user: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error("Failed to update user:", error);
        return response.status(500).json({ status: "error", message: "Error updating user" });
    }
};

// Delete user
const deleteUser = async (request, response) => {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", message: "User deleted successfully" });
    } catch (error) {
        console.error("Failed to delete user:", error);
        return response.status(500).json({ status: "error", message: "Error deleting user" });
    }
};

// Submit identity verification request (user action)
const submitIdentityVerification = async (request, response) => {
    const { id } = request.params;
    const { identityEvidence, identityNotes } = request.body;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    if (!identityEvidence) {
        return response.status(400).json({ status: "error", message: "Identity evidence is required" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    identityEvidence,
                    identityNotes: identityNotes || undefined,
                    identityStatus: "pending",
                    identitySubmittedAt: new Date(),
                    identityReviewedAt: null,
                    identityReviewer: null
                }
            },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", user: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error("Failed to submit identity verification:", error);
        return response.status(500).json({ status: "error", message: "Unable to submit identity verification" });
    }
};

// Retrieve profile for the authenticated user
const getCurrentUser = (request, response) => {
    const user = request.user;

    if (!user) {
        return response.status(401).json({ status: "error", message: "Not authenticated" });
    }

    return response.status(200).json({ status: "ok", user: sanitizeUser(user) });
};

// Update profile for the authenticated user
const updateCurrentUser = async (request, response) => {
    const user = request.user;
    if (!user) {
        return response.status(401).json({ status: "error", message: "Not authenticated" });
    }

    const userId = user._id;
    const {
        username,
        address,
        email,
        password,
        phoneNumber
    } = request.body;

    const updatePayload = {};

    if (username !== undefined) updatePayload.username = username;
    if (address !== undefined) updatePayload.address = address;
    if (email !== undefined) updatePayload.email = email;
    if (phoneNumber !== undefined) updatePayload.phoneNumber = phoneNumber;

    if (!password && Object.keys(updatePayload).length === 0) {
        return response.status(400).json({ status: "error", message: "No updates provided" });
    }

    try {
        if (Object.prototype.hasOwnProperty.call(updatePayload, 'username')) {
            const existingUsername = await User.findOne({ username: updatePayload.username, _id: { $ne: userId } });
            if (existingUsername) {
                return response.status(409).json({ status: "error", message: "Username is already taken" });
            }
        }

        if (Object.prototype.hasOwnProperty.call(updatePayload, 'email')) {
            const existingEmail = await User.findOne({ email: updatePayload.email, _id: { $ne: userId } });
            if (existingEmail) {
                return response.status(409).json({ status: "error", message: "Email is already in use" });
            }
        }

        if (password) {
            updatePayload.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updatePayload },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", user: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error("Failed to update current user:", error);
        return response.status(500).json({ status: "error", message: "Error updating profile" });
    }
};

// Delete the authenticated user's account
const deleteCurrentUser = async (request, response) => {
    const user = request.user;
    if (!user) {
        return response.status(401).json({ status: "error", message: "Not authenticated" });
    }

    try {
        const deleted = await User.findByIdAndDelete(user._id);
        if (!deleted) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }
        return response.status(200).json({ status: "ok", message: "Account deleted successfully" });
    } catch (error) {
        console.error("Failed to delete current user:", error);
        return response.status(500).json({ status: "error", message: "Error deleting account" });
    }
};

// Update identity verification status (admin action)
const updateIdentityStatus = async (request, response) => {
    const { id } = request.params;
    const { status, reviewer, notes } = request.body;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    const allowedStatuses = ["unverified", "pending", "verified", "rejected"];
    if (!allowedStatuses.includes(status)) {
        return response.status(400).json({ status: "error", message: "Invalid identity status" });
    }

    const updatePayload = {
        identityStatus: status,
        identityNotes: notes
    };

    if (status === "pending") {
        updatePayload.identitySubmittedAt = new Date();
        updatePayload.identityReviewedAt = null;
        updatePayload.identityReviewer = null;
    }

    if (status === "verified" || status === "rejected") {
        updatePayload.identityReviewedAt = new Date();
        updatePayload.identityReviewer = reviewer || "System";
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", user: sanitizeUser(updatedUser) });
    } catch (error) {
        console.error("Failed to update identity status:", error);
        return response.status(500).json({ status: "error", message: "Unable to update identity status" });
    }
};

// Retrieve notifications for user
const getUserNotifications = async (request, response) => {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    try {
        const user = await User.findById(id).select("notifications");
        if (!user) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(200).json({ status: "ok", notifications: user.notifications });
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return response.status(500).json({ status: "error", message: "Unable to fetch notifications" });
    }
};

// Add notification (admin action)
const createNotification = async (request, response) => {
    const { id } = request.params;
    const { message, level } = request.body;

    if (!isValidObjectId(id)) {
        return response.status(400).json({ status: "error", message: "Invalid user ID format" });
    }

    if (!message) {
        return response.status(400).json({ status: "error", message: "Notification message is required" });
    }

    const notification = {
        message,
        level: level || "info",
        read: false,
        createdAt: new Date()
    };

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $push: { notifications: notification } },
            { new: true }
        ).select("notifications");

        if (!updatedUser) {
            return response.status(404).json({ status: "error", message: "User not found" });
        }

        return response.status(201).json({ status: "ok", notifications: updatedUser.notifications });
    } catch (error) {
        console.error("Failed to create notification:", error);
        return response.status(500).json({ status: "error", message: "Unable to create notification" });
    }
};

// Update notification (mark read/unread)
const updateNotification = async (request, response) => {
    const { id, notificationId } = request.params;
    const { read } = request.body;

    if (!isValidObjectId(id) || !isValidObjectId(notificationId)) {
        return response.status(400).json({ status: "error", message: "Invalid ID format" });
    }

    try {
        const user = await User.findOneAndUpdate(
            { _id: id, "notifications._id": notificationId },
            { $set: { "notifications.$.read": !!read } },
            { new: true }
        ).select("notifications");

        if (!user) {
            return response.status(404).json({ status: "error", message: "Notification not found" });
        }

        return response.status(200).json({ status: "ok", notifications: user.notifications });
    } catch (error) {
        console.error("Failed to update notification:", error);
        return response.status(500).json({ status: "error", message: "Unable to update notification" });
    }
};

// Delete notification
const deleteNotification = async (request, response) => {
    const { id, notificationId } = request.params;

    if (!isValidObjectId(id) || !isValidObjectId(notificationId)) {
        return response.status(400).json({ status: "error", message: "Invalid ID format" });
    }

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { $pull: { notifications: { _id: notificationId } } },
            { new: true }
        ).select("notifications");

        if (!user) {
            return response.status(404).json({ status: "error", message: "Notification not found" });
        }

        return response.status(200).json({ status: "ok", notifications: user.notifications });
    } catch (error) {
        console.error("Failed to delete notification:", error);
        return response.status(500).json({ status: "error", message: "Unable to delete notification" });
    }
};





exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.submitIdentityVerification = submitIdentityVerification;
exports.updateIdentityStatus = updateIdentityStatus;
exports.getUserNotifications = getUserNotifications;
exports.createNotification = createNotification;
exports.updateNotification = updateNotification;
exports.deleteNotification = deleteNotification;
exports.getCurrentUser = getCurrentUser;
exports.updateCurrentUser = updateCurrentUser;
exports.deleteCurrentUser = deleteCurrentUser;
