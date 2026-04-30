import Notification from '../models/Notification.model.js'
import User from '../models/User.model.js'

export const sendPushNotification = async (userId, title, message, type, relatedId) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedId
    }) 
    console.log(`Push notification sent to user ${userId}: ${title}`)
    return notification
  } catch (error) {
    console.error('Error sending push notification:', error.message)
  }
}

export const sendBulkAlertNotification = async (states, alertId, title, message) => {
  try {
    const users = await User.find({ state: { $in: states }, isActive: true })
    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type: 'alert',
      relatedId: alertId
    }))

    if (notifications.length > 0) {
      await Notification.insertMany(notifications)
      console.log(`Bulk alert sent to ${notifications.length} users in ${states.join(', ')}`)
    }
  } catch (error) {
    console.error('Error sending bulk alert notification:', error.message)
  }
}

export const markNotificationRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  )
}

export const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false })
}
