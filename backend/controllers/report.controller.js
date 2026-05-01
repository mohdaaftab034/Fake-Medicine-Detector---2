import Report from '../models/Report.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { sendReportConfirmation } from '../services/email.service.js'

const generateCaseId = () => {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `MG-${year}-${randomNum}`
}

export const submitReport = asyncHandler(async (req, res, next) => {
  const caseId = generateCaseId()
  
  // Extract files if using multer
  const medicineImages = req.files && req.files.medicineImages ? req.files.medicineImages.map(f => f.path) : req.body.medicineImages || []
  const receiptImage = req.files && req.files.receiptImage ? req.files.receiptImage[0].path : req.body.receiptImage

  const reportData = {
    ...req.body,
    reporter: req.user._id,
    caseId,
    evidence: { medicineImages, receiptImage }
  }

  const report = await Report.create(reportData)

  if (!report.isAnonymous) {
    sendReportConfirmation(req.user.email, caseId)
  }

  res.status(201).json(new ApiResponse(201, { caseId, reportId: report._id }, 'Report submitted successfully'))
})

export const getMyReports = asyncHandler(async (req, res, next) => {
  const reports = await Report.find({ reporter: req.user._id }).sort({ createdAt: -1 })
  const total = await Report.countDocuments({ reporter: req.user._id })
  res.status(200).json(new ApiResponse(200, { reports, total }, 'Reports fetched successfully'))
})

export const getAllReports = asyncHandler(async (req, res, next) => {
  const { status, severity, city, state, page = 1, limit = 20 } = req.query
  const query = {}
  
  if (status) query.status = status
  if (severity) query.severity = severity
  if (city) query['chemistShop.city'] = city
  if (state) query['chemistShop.state'] = state

  const reports = await Report.find(query)
    .populate('reporter', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  const total = await Report.countDocuments(query)

  res.status(200).json(new ApiResponse(200, { reports, total, pages: Math.ceil(total / limit) }, 'Reports fetched'))
})

export const updateReportStatus = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, adminNotes },
    { returnDocument: 'after' }
  )
  if (!report) return next(new ApiError(404, 'Report not found'))
  
  res.status(200).json(new ApiResponse(200, report, 'Status updated'))
})

export const forwardToCDSCO = asyncHandler(async (req, res, next) => {
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { forwardedToCDSCO: true },
    { returnDocument: 'after' }
  )
  if (!report) return next(new ApiError(404, 'Report not found'))
  
  res.status(200).json(new ApiResponse(200, report, 'Forwarded to CDSCO'))
})

export const getReportStats = asyncHandler(async (req, res, next) => {
  const byStatus = await Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
  const bySeverity = await Report.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }])
  
  res.status(200).json(new ApiResponse(200, { byStatus, bySeverity }, 'Stats fetched'))
})
