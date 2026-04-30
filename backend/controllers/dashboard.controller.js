import Scan from '../models/Scan.model.js'
import Report from '../models/Report.model.js'
import Alert from '../models/Alert.model.js'
import Chemist from '../models/Chemist.model.js'
import User from '../models/User.model.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Cache object for public stats
let publicStatsCache = { data: null, timestamp: 0 }

export const getPublicDashboard = asyncHandler(async (req, res, next) => {
  // Check cache (1 hour expiry)
  if (publicStatsCache.data && Date.now() - publicStatsCache.timestamp < 3600000) {
    return res.status(200).json(new ApiResponse(200, publicStatsCache.data, 'Public stats fetched (cached)'))
  }

  const totalScans = await Scan.countDocuments()
  const fakeScans = await Scan.countDocuments({ result: { $in: ['FAKE', 'SUSPICIOUS'] } })
  const totalReports = await Report.countDocuments()
  const activeAlerts = await Alert.countDocuments({ isActive: true })

  const data = { totalScans, fakeScans, totalReports, activeAlerts }
  publicStatsCache = { data, timestamp: Date.now() }

  res.status(200).json(new ApiResponse(200, data, 'Public stats fetched'))
})

export const getUserDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id

  const totalScans = await Scan.countDocuments({ user: userId })
  const reports = await Report.find({ reporter: userId }).limit(5).sort({ createdAt: -1 })
  const unreadAlerts = await Alert.countDocuments({ isActive: true, readBy: { $ne: userId } })
  const user = await User.findById(userId).populate('savedMedicines')

  res.status(200).json(new ApiResponse(200, {
    totalScans,
    recentReports: reports,
    unreadAlertsCount: unreadAlerts,
    savedMedicines: user.savedMedicines
  }, 'User dashboard fetched'))
})

export const getChemistDashboard = asyncHandler(async (req, res, next) => {
  const chemist = await Chemist.findOne({ user: req.user._id })
  if (!chemist) return res.status(404).json(new ApiResponse(404, null, 'Chemist profile not found'))

  // Mocking some stats as these would depend on complex logic
  const inventoryVerified = 150
  const reportsAgainstShop = chemist.reportCount || 0
  const customerScans = 320

  res.status(200).json(new ApiResponse(200, {
    shopStats: { rating: chemist.rating, isVerified: chemist.isVerified },
    inventoryVerified,
    reportsAgainstShop,
    customerScans
  }, 'Chemist dashboard fetched'))
})

export const getAdminDashboard = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments()
  const totalChemists = await Chemist.countDocuments()
  const pendingChemists = await Chemist.countDocuments({ isVerified: false, isBlacklisted: false })
  const activeAlerts = await Alert.countDocuments({ isActive: true })
  
  const recentReports = await Report.find().limit(5).sort({ createdAt: -1 }).populate('reporter', 'name')
  const recentScans = await Scan.find().limit(5).sort({ createdAt: -1 })

  // Mocking chart data for last 30 days
  const chartsData = {
    scansLast30Days: [10, 20, 15, 30, 25, 40, 35], // Sample data
    reportsLast30Days: [2, 5, 1, 4, 3, 6, 2]
  }

  res.status(200).json(new ApiResponse(200, {
    stats: { totalUsers, totalChemists, pendingChemists, activeAlerts },
    recentReports,
    recentScans,
    chartsData
  }, 'Admin dashboard fetched'))
})
