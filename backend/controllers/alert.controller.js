import Alert from '../models/Alert.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendBulkAlertNotification } from '../services/notification.service.js'

export const getAllAlerts = asyncHandler(async (req, res, next) => {
  const { severity, state } = req.query
  const query = { isActive: true }
  
  if (severity) query.severity = severity
  if (state) query.affectedStates = state

  const alerts = await Alert.find(query).sort({ createdAt: -1 })
  
  // Mark read status for current user if logged in
  const alertsWithReadStatus = alerts.map(alert => {
    const alertObj = alert.toObject()
    alertObj.isRead = req.user ? alert.readBy.includes(req.user._id) : false
    return alertObj
  })

  res.status(200).json(new ApiResponse(200, alertsWithReadStatus, 'Alerts fetched'))
})

export const getAlertById = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findById(req.params.id)
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  
  res.status(200).json(new ApiResponse(200, alert, 'Alert fetched'))
})

export const createAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.create({ ...req.body, createdBy: req.user._id })
  
  // Send notifications
  if (alert.affectedStates && alert.affectedStates.length > 0) {
    sendBulkAlertNotification(alert.affectedStates, alert._id, alert.title, alert.description)
  }
  
  res.status(201).json(new ApiResponse(201, alert, 'Alert created'))
})

export const updateAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  res.status(200).json(new ApiResponse(200, alert, 'Alert updated'))
})

export const deactivateAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  res.status(200).json(new ApiResponse(200, alert, 'Alert deactivated'))
})

export const markAsRead = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { readBy: req.user._id } },
    { new: true }
  )
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  res.status(200).json(new ApiResponse(200, alert, 'Alert marked as read'))
})

export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Alert.countDocuments({
    isActive: true,
    readBy: { $ne: req.user._id }
  })
  res.status(200).json(new ApiResponse(200, { unreadCount: count }, 'Unread count fetched'))
})
