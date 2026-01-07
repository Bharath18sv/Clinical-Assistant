import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

// get all notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .lean(); // improves performance, returns plain JSON

  if (!notifications || notifications.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No notifications found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

// get only unread notifications
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  const notifications = await Notification.find({
    userId,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .lean(); // faster performance

  if (!notifications || notifications.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No unread notifications"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications,
        "Unread notifications fetched successfully"
      )
    );
});

// mark a notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user?._id;

  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }

  // Ensure user is authenticated
  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId }, // security: user can only mark THEIR notifications
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found or not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

// marks all notification as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "All notifications marked as read"
      )
    );
});

// get unread notification count (efficient - only returns count)
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User not authenticated");
  }

  const count = await Notification.countDocuments({
    userId,
    isRead: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { count }, "Unread count fetched successfully")
    );
});