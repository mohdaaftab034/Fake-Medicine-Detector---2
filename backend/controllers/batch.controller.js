import BatchNumber from '../models/BatchNumber.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const verifyBatch = asyncHandler(async (req, res, next) => {
  const batchNumber = req.query.batch?.trim().toUpperCase() || req.query.batchNumber?.trim().toUpperCase()

  if (!batchNumber || batchNumber.length < 3) {
    throw new ApiError(400, 'Please enter a valid batch number')
  }

  const found = await BatchNumber.findOne({ batchNumber })

  if (!found) {
    return res.json(new ApiResponse(200, {
      batchNumber,
      status: 'NOT_LISTED',
      message: 'This batch number is not in our recalled medicines database.',
      safetyNote: 'Not being in our database does NOT mean this medicine is genuine. Our database contains only recalled medicines reported by CDSCO and state drug authorities. Always verify by contacting the manufacturer directly.',
      helpline: '1800-180-3024',
      cdscoUrl: 'https://cdsco.gov.in'
    }))
  }

  if (found.status === 'RECALLED') {
    return res.json(new ApiResponse(200, {
      batchNumber,
      status: 'RECALLED',
      medicine: found.medicine,
      manufacturer: found.manufacturer,
      recallDate: found.recallDate,
      recallReason: found.recallReason,
      recallAuthority: found.recallAuthority,
      severity: found.severity,
      affectedStates: found.affectedStates,
      message: 'DANGER: This batch has been officially recalled.',
      action: 'Do NOT consume this medicine. Return it to the chemist immediately and report to CDSCO.',
      helpline: '1800-180-3024'
    }))
  }

  return res.json(new ApiResponse(200, {
    batchNumber,
    status: found.status,
    medicine: found.medicine,
    message: 'This batch is under investigation by drug authorities.',
    helpline: '1800-180-3024'
  }))
})

export const addBatch = asyncHandler(async (req, res, next) => {
  const batch = await BatchNumber.create(req.body)
  res.status(201).json(new ApiResponse(201, batch, 'Batch added successfully'))
})

export const updateBatchStatus = asyncHandler(async (req, res, next) => {
  const { status, recallReason } = req.body
  const batch = await BatchNumber.findByIdAndUpdate(
    req.params.id,
    { status, recallReason, recallDate: status === 'RECALLED' ? new Date() : undefined },
    { new: true, runValidators: true }
  )
  if (!batch) return next(new ApiError(404, 'Batch not found'))
  res.status(200).json(new ApiResponse(200, batch, 'Batch status updated'))
})

export const bulkImportBatches = asyncHandler(async (req, res, next) => {
  const { batches } = req.body // Expecting an array of batch objects
  if (!batches || !Array.isArray(batches)) return next(new ApiError(400, 'Invalid data format'))

  const result = await BatchNumber.insertMany(batches, { ordered: false }) // ordered: false to continue on duplicate keys
  
  res.status(201).json(new ApiResponse(201, { importedCount: result.length }, 'Bulk import successful'))
})

export const getRecalledBatches = asyncHandler(async (req, res, next) => {
  const { state } = req.query
  const query = { status: 'RECALLED' }
  if (state) query.affectedStates = state

  const batches = await BatchNumber.find(query).sort({ recallDate: -1 })
  res.status(200).json(new ApiResponse(200, batches, 'Recalled batches fetched'))
})
