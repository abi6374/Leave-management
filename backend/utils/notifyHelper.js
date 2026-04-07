import Notification from '../models/Notification.js';

export const createNotification = async ({ userId, message, type = 'info', relatedLeaveId = null }) => {
  if (!userId || !message) return null;

  return Notification.create({
    userId,
    message,
    type,
    relatedLeaveId,
  });
};

export const createBulkNotifications = async (notifications = []) => {
  const payload = notifications.filter((item) => item?.userId && item?.message);
  if (!payload.length) return [];
  return Notification.insertMany(payload);
};
