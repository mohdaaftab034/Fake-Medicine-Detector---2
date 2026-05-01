import Alert from '../models/Alert.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendBulkAlertNotification } from '../services/notification.service.js'

export const getAllAlerts = asyncHandler(async (req, res) => {
  const { severity, state, page = 1, limit = 20 } = req.query

  const filter = { isActive: true }
  if (severity) filter.severity = severity
  if (state) filter.affectedStates = { $in: [state, 'All States'] }

  const alerts = await Alert.find(filter)
    .sort({ severity: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean()

  const total = await Alert.countDocuments(filter)

  // Severity order for sorting
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return res.json(new ApiResponse(200, {
    alerts,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
    lastUpdated: alerts[0]?.createdAt || new Date()
  }))
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
  const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true })
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  res.status(200).json(new ApiResponse(200, alert, 'Alert updated'))
})

export const deactivateAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, { isActive: false }, { returnDocument: 'after' })
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  res.status(200).json(new ApiResponse(200, alert, 'Alert deactivated'))
})

export const markAsRead = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { readBy: req.user._id } },
    { returnDocument: 'after' }
  )
  if (!alert) return next(new ApiError(404, 'Alert not found'))
  res.status(200).json(new ApiResponse(200, alert, 'Alert marked as read'))
})

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Alert.countDocuments({
    isActive: true,
    readBy: { $nin: [req.user._id] }
  })
  return res.json(new ApiResponse(200, { count }))
})
