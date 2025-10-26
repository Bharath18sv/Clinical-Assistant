import API from "../api.js";

export const getAllNotifications = async () => {
  try {
    const res = await API.get("/notifications");
    console.log("get all notifications response : ", res.data);
    return res?.data;
  } catch (error) {
    console.error(
      "Error fetching notifications:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getUnreadNotifications = async () => {
  try {
    const res = await API.get("/notifications/unread");
    console.log("get all unread notifications response : ", res.data);
    return res?.data;
  } catch (error) {
    console.error(
      "Error fetching unread notifications:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const res = await API.patch(`/notifications/read/${notificationId}`);
    console.log("mark notification as read response : ", res.data);
    return res?.data;
  } catch (error) {
    console.error(
      "Error marking notification as read:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const res = await API.patch(`/notifications/mark-all-read`);
    console.log("mark all notifications read response : ", res.data);
    return res?.data;
  } catch (error) {
    console.error(
      "Error marking all notifications as read:",
      error.response?.data || error.message
    );
    throw error;
  }
};
