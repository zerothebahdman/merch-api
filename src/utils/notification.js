const { Notification } = require('../models');

const addNotification = async (message, target) => {
  await Notification.create({ message, target });
  return true;
};

const fetchNotifications = async (filter, options, paginate = false) => {
  let notifications = !paginate ? await Notification.find(filter) : await Notification.paginate(filter, options);
  notifications = notifications.map((notification) => {
    return notification.message;
  });
  return notifications;
};

module.exports = {
  addNotification,
  fetchNotifications,
};
