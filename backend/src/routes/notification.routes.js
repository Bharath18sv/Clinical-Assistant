import Router from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  getUnreadCount,
} from "./../controllers/notification.controllers.js";

const router = Router();

router.get("/", verifyJwt, getNotifications);

router.get("/unread", verifyJwt, getUnreadNotifications);

router.get("/unread-count", verifyJwt, getUnreadCount);

router.patch("/read/:notificationId", verifyJwt, markNotificationAsRead);

router.patch("/mark-all-read", verifyJwt, markAllNotificationsAsRead);

export default router;
