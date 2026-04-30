import Scan from '../models/Scan.model.js'
import BatchNumber from '../models/BatchNumber.model.js'
import Medicine from '../models/Medicine.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { analyzeImage, askGroq } from '../services/groq.service.js'

export const chatWithGroq = asyncHandler(async (req, res, next) => {
  const { question, context, history } = req.body
  
  if (!question) {
    return next(new ApiError(400, 'Please provide a question'))
  }

  const response = await askGroq(question, history || [], context)
  res.status(200).json(new ApiResponse(200, { response }, 'Follow-up answer generated'))
})

export const analyzeMedicine = asyncHandler(async (req, res, next) => {
  // Expecting a Cloudinary-uploaded image or a Cloudinary image URL in the body
  const { batchNumber, location } = req.body
  let imageUrl = req.file?.path || req.body.imageUrl

  if (!imageUrl) {
    return next(new ApiError(400, 'Please provide an image'))
  }

  const isRemoteUrl = /^https?:\/\//i.test(imageUrl)
  const isCloudinaryUrl = /res\.cloudinary\.com/i.test(imageUrl)

  if (!isRemoteUrl || !isCloudinaryUrl) {
    return next(
      new ApiError(
        500,
        'Image must be uploaded to Cloudinary before analysis. Configure Cloudinary credentials and retry.'
      )
    )
  }

  console.log('Analyzing Cloudinary image URL...')
  const aiResult = await analyzeImage(imageUrl)

  // 2. Batch Number Verification
  let batchStatus = 'NOT_CHECKED'
  if (batchNumber) {
    const recalledBatch = await BatchNumber.findOne({ 
      batchNumber: batchNumber.toUpperCase(),
      status: 'RECALLED'
    })
    batchStatus = recalledBatch ? 'RECALLED' : 'UNVERIFIED'
  }

  // Ensure confidence is a number (it might come as a string like "85%" from AI)
  let confidenceScore = typeof aiResult.confidence === 'string' 
    ? parseInt(aiResult.confidence.replace('%', '')) 
    : (aiResult.confidence || 0)
  
  if (isNaN(confidenceScore)) confidenceScore = 0

  console.log('[SCAN CONTROLLER] Saving scan to database...')
  try {
    const scan = await Scan.create({
      user: req.user?._id || null,
      imageUrl: imageUrl,
      imagePublicId: req.file ? (req.file.filename || req.file.public_id || req.file.path || null) : null,
      result: aiResult.status,
      confidence: confidenceScore,
      analysisText: aiResult.text,
      batchNumber: batchNumber,
      batchStatus: batchStatus,
      location: location || {}
    })

    console.log('[SCAN CONTROLLER] ✅ Scan saved successfully ID:', scan._id)

    // 4. Update permanent Medicine Library (Simplified for chat mode)
    // In chat mode, we mostly care about the conversational text, 
    // but we can still try to extract name if needed later.

    res.status(201).json(new ApiResponse(201, scan, 'Medicine analyzed and stored successfully'))
  } catch (dbError) {
    console.error('[SCAN CONTROLLER] Database Save Error:', dbError.message)
    throw dbError
  }
})

export const getScanHistory = asyncHandler(async (req, res, next) => {
  const { result, startDate, endDate, page = 1, limit = 10 } = req.query
  const query = { user: req.user._id }
  
  if (result) query.result = result
  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  const scans = await Scan.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    
  const total = await Scan.countDocuments(query)

  res.status(200).json(new ApiResponse(200, { scans, total, pages: Math.ceil(total / limit) }, 'History fetched successfully'))
})

export const getScanById = asyncHandler(async (req, res, next) => {
  const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id })
  
  if (!scan) {
    return next(new ApiError(404, 'Scan not found'))
  }

  res.status(200).json(new ApiResponse(200, scan, 'Scan fetched successfully'))
})

export const deleteScan = asyncHandler(async (req, res, next) => {
  const scan = await Scan.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  
  if (!scan) {
    return next(new ApiError(404, 'Scan not found'))
  }

  res.status(200).json(new ApiResponse(200, null, 'Scan deleted successfully'))
})

export const getPublicStats = asyncHandler(async (req, res, next) => {
  const total = await Scan.countDocuments()
  const genuine = await Scan.countDocuments({ result: { $in: ['LOOKS_PROFESSIONAL', 'GENUINE'] } })
  const fake = await Scan.countDocuments({ result: { $in: ['HAS_ISSUES', 'UNCLEAR', 'FAKE', 'SUSPICIOUS'] } })
  
  res.status(200).json(new ApiResponse(200, { total, genuine, fake }, 'Public stats fetched'))
})
