import axios from 'axios'
import Scan from '../models/Scan.model.js'
import BatchNumber from '../models/BatchNumber.model.js'
import Chemist from '../models/Chemist.model.js'
import { ApiError, ApiResponse } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { analyzeImage, askGroq } from '../services/groq.service.js'

export const chatAboutMedicine = asyncHandler(async (req, res) => {
  const { message, medicineContext, conversationHistory, scanId } = req.body

  if (!message) throw new ApiError(400, 'Message is required')

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY

  // Build medicine context from scan if scanId provided
  let fullContext = medicineContext || ''
  if (scanId && !fullContext) {
    const scan = await Scan.findById(scanId).lean()
    if (scan) {
      fullContext = `Medicine: ${scan.medicineDetails?.name || 'Unknown'}
Manufacturer: ${scan.medicineDetails?.manufacturer || 'Unknown'}
Category: ${scan.medicineDetails?.category || 'Unknown'}
Batch Status: ${scan.batchStatus}
Risk Level: ${scan.riskLevel}`
    }
  }

  const systemPrompt = `You are MediGuard Safety Assistant, an expert in Indian pharmaceuticals and drug safety.

CRITICAL CONTEXT FROM RECENT SCAN:
${fullContext}

INSTRUCTIONS:
1. Use the scan context above as your primary source of truth for the specific medicine being discussed.
2. If the user asks about pricing, availability, alternatives, or detailed use cases, ALWAYS use the provided Google Search tool to find the most recent and accurate information for the Indian market.
3. Provide answers in a professional, empathetic tone.
4. Format your response with clear headings, **bold** key terms, and bullet points.
5. If the scan report indicates a "FAKE" or "RECALLED" status, prioritize safety warnings in your response.
6. Always include a disclaimer that you are an AI assistant and users should consult a healthcare professional for medical decisions.`

  // FALLBACK TO GROQ IF GEMINI KEY IS MISSING
  if (!GEMINI_API_KEY) {
    console.log('[CHAT] Gemini API key missing, falling back to Groq...')
    const reply = await askGroq(message, conversationHistory, fullContext)
    return res.json(new ApiResponse(200, {
      reply,
      searchQueries: [],
      sources: []
    }))
  }

  // Build conversation for Gemini
  const contents = []
  if (conversationHistory?.length > 0) {
    conversationHistory.slice(-6).forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })
    })
  }
  contents.push({
    role: 'user',
    parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }]
  })

  try {
    // Call Gemini with Google Search grounding
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents,
        tools: [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "unspecified" } } }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    )

    const text = response?.data?.candidates?.[0]?.content?.parts
      ?.filter(p => p.text)
      ?.map(p => p.text)
      ?.join('\n') || ''

    // Get search queries used if available
    const groundingMetadata = response?.data?.candidates?.[0]?.groundingMetadata
    const searchQueries = groundingMetadata?.webSearchQueries || []
    const sources = groundingMetadata?.groundingChunks
      ?.map(chunk => ({
        title: chunk.web?.title,
        url: chunk.web?.uri
      }))
      ?.filter(s => s.title && s.url)
      ?.slice(0, 3) || []

    if (!text) throw new Error('Gemini returned empty response')

    return res.json(new ApiResponse(200, {
      reply: text,
      searchQueries,
      sources
    }))
  } catch (geminiError) {
    console.error('[CHAT] Gemini Error:', geminiError.response?.data || geminiError.message)
    // Fallback to Groq on any Gemini API error
    const reply = await askGroq(message, conversationHistory, fullContext)
    return res.json(new ApiResponse(200, {
      reply,
      searchQueries: [],
      sources: []
    }))
  }
})

export const analyzeMedicine = asyncHandler(async (req, res) => {
  if (!req.file && !req.body.imageUrl) throw new ApiError(400, 'No image uploaded')

  const cloudinaryUrl = req.file?.path || req.body.imageUrl
  const publicId = req.file?.filename || req.body.imagePublicId

  if (!cloudinaryUrl || !cloudinaryUrl.startsWith('http')) {
    throw new ApiError(500, 'Image upload to Cloudinary failed or invalid URL provided')
  }

  console.log('[SCAN] Starting complete analysis pipeline for:', cloudinaryUrl)

  // ── STEP 1: AI Packaging Analysis ──────────────────────────────
  console.log('[SCAN] Step 1: AI packaging analysis...')
  const aiResult = await analyzeImage(cloudinaryUrl)

  console.log('[SCAN CONTROLLER] Medicine details from AI:', JSON.stringify(aiResult.medicineDetails, null, 2))
  console.log('[SCAN CONTROLLER] Fields from AI:', JSON.stringify(aiResult.fields, null, 2))

  // ── STEP 2: Batch Number Verification ──────────────────────────
  console.log('[SCAN] Step 2: Batch number verification...')
  let batchResult = { status: 'NOT_CHECKED', details: null }

  const detectedBatch = aiResult.fields?.batchNumber || aiResult.medicineDetails?.batchNumber || aiResult.batchNumber || ''
  const cleanBatch = detectedBatch.replace(/not\s*(clearly\s*)?visible/i, '').trim()

  if (cleanBatch && cleanBatch.length > 2) {
    const batchRecord = await BatchNumber.findOne({
      batchNumber: { $regex: new RegExp(cleanBatch.replace(/[^a-zA-Z0-9]/g, '.*'), 'i') }
    })

    if (batchRecord) {
      batchResult = {
        status: batchRecord.status,
        batchNumber: batchRecord.batchNumber,
        medicine: batchRecord.medicine,
        manufacturer: batchRecord.manufacturer,
        recallDate: batchRecord.recallDate,
        recallReason: batchRecord.recallReason,
        recallAuthority: batchRecord.recallAuthority,
        severity: batchRecord.severity,
        affectedStates: batchRecord.affectedStates
      }
    } else {
      batchResult = {
        status: 'NOT_IN_RECALLED_LIST',
        batchNumber: cleanBatch,
        message: 'This batch number is not in our recalled medicines database'
      }
    }
  } else {
    batchResult = {
      status: 'NOT_DETECTED',
      message: 'Batch number not clearly visible in image. Please enter manually for verification.'
    }
  }

  // ── STEP 3: Medicine Database Check ────────────────────────────
  console.log('[SCAN] Step 3: Medicine database check...')
  let medicineDbResult = { found: false, details: null }

  const detectedName = aiResult.fields?.medicineName || aiResult.medicineDetails?.name || ''
  const cleanName = detectedName.replace(/not\s*(clearly\s*)?visible|not detected/i, '').trim()

  if (cleanName && cleanName.length > 2) {
    // Check local Indian medicines first
    try {
      const { indianMedicines } = await import('../utils/indianMedicines.js')
      const localMatch = indianMedicines.find(m =>
        m.name.toLowerCase().includes(cleanName.toLowerCase()) ||
        cleanName.toLowerCase().includes(m.name.toLowerCase()) ||
        m.genericName.toLowerCase().includes(cleanName.toLowerCase())
      )

      if (localMatch) {
        medicineDbResult = {
          found: true,
          source: 'Local Indian Database',
          details: {
            name: localMatch.name,
            genericName: localMatch.genericName,
            manufacturer: localMatch.manufacturer,
            category: localMatch.category,
            requiresPrescription: localMatch.requiresPrescription,
            indications: localMatch.indications,
            warnings: localMatch.warnings
          }
        }
      } else {
        // Try OpenFDA
        try {
          const fdaRes = await axios.get(
            `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(cleanName)}"&limit=1`,
            { timeout: 8000 }
          )
          if (fdaRes.data?.results?.length > 0) {
            const r = fdaRes.data.results[0]
            medicineDbResult = {
              found: true,
              source: 'OpenFDA',
              details: {
                name: r.openfda?.brand_name?.[0] || cleanName,
                genericName: r.openfda?.generic_name?.[0] || 'Not available',
                manufacturer: r.openfda?.manufacturer_name?.[0] || 'Not available',
                category: r.openfda?.product_type?.[0] || 'Not specified',
                requiresPrescription: r.openfda?.product_type?.[0] === 'PRESCRIPTION',
                indications: r.indications_and_usage?.[0]?.substring(0, 200) || 'Not available',
                warnings: r.warnings?.[0]?.substring(0, 200) || 'Not available'
              }
            }
          }
        } catch (fdaError) {
          console.log('[SCAN] OpenFDA lookup failed:', fdaError.message)
        }
      }
    } catch (e) {
      console.log('[SCAN] Local database check failed:', e.message)
    }
  }

  // ── STEP 4: Nearby Verified Chemists ───────────────────────────
  console.log('[SCAN] Step 4: Nearby chemists check...')
  let nearbyChemists = []
  const lat = parseFloat(req.body.lat)
  const lng = parseFloat(req.body.lng)

  if (lat && lng) {
    nearbyChemists = await Chemist.find({
      isVerified: true,
      isBlacklisted: false,
      'coordinates.lat': { $gte: lat - 0.05, $lte: lat + 0.05 },
      'coordinates.lng': { $gte: lng - 0.05, $lte: lng + 0.05 }
    })
    .select('shopName address city phone rating coordinates licenseNumber')
    .limit(3)
    .lean()
  }

  // ── Calculate Final Risk Level ──────────────────────────────────
  let finalRiskLevel = 'LOW'
  let finalStatus = aiResult.status || 'SUSPICIOUS'

  if (batchResult.status === 'RECALLED') {
    finalRiskLevel = 'CRITICAL'
    finalStatus = 'FAKE'
  } else if (batchResult.status === 'UNDER_INVESTIGATION') {
    finalRiskLevel = 'HIGH'
    finalStatus = 'SUSPICIOUS'
  } else if (aiResult.status === 'FAKE' || (aiResult.redFlags && aiResult.redFlags.length > 2)) {
    finalRiskLevel = 'HIGH'
    finalStatus = 'FAKE'
  } else if (aiResult.status === 'SUSPICIOUS') {
    finalRiskLevel = 'MEDIUM'
    finalStatus = 'SUSPICIOUS'
  } else {
    finalRiskLevel = 'LOW'
    finalStatus = 'GENUINE'
  }

  // ── Save to Database ────────────────────────────────────────────
  const validStatuses = ['GENUINE', 'FAKE', 'SUSPICIOUS']
  const dbStatus = validStatuses.includes(finalStatus) ? finalStatus : 'SUSPICIOUS'

  const scan = await Scan.create({
    user: req.user?._id,
    imageUrl: cloudinaryUrl,
    imagePublicId: publicId,
    result: dbStatus,
    confidence: aiResult.confidence || 75,
    reasons: aiResult.reasons || [],
    recommendations: aiResult.recommendations || [],
    medicineDetails: aiResult.medicineDetails || aiResult.fields || {},
    analysisText: aiResult.text || '',
    batchStatus: batchResult.status,
    batchDetails: batchResult,
    medicineDbResult,
    nearbyChemists,
    riskLevel: finalRiskLevel,
    location: {
      city: req.body.city || '',
      state: req.body.state || '',
      coordinates: { lat: lat || 0, lng: lng || 0 }
    }
  })

  // ── Return Complete Pipeline Result ─────────────────────────────
  return res.status(200).json(new ApiResponse(200, {
    scanId: scan._id,
    pipeline: {
      step1_packaging: {
        status: aiResult.status,
        confidence: aiResult.confidence,
        fields: aiResult.fields || aiResult.medicineDetails,
        redFlags: aiResult.redFlags || [],
        text: aiResult.text
      },
      step2_batch: batchResult,
      step3_medicineDb: medicineDbResult,
      step4_chemists: nearbyChemists,
      finalRiskLevel,
      finalStatus: dbStatus
    }
  }, 'Complete analysis done'))
})

export const getScanHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20

  const scans = await Scan.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('imageUrl result confidence riskLevel medicineDetails batchStatus createdAt')
    .lean()

  const total = await Scan.countDocuments({ user: req.user._id })

  return res.json(new ApiResponse(200, {
    scans,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  }, 'Scan history fetched'))
})

export const getScanById = asyncHandler(async (req, res) => {
  const scan = await Scan.findOne({ 
    _id: req.params.scanId, 
    user: req.user._id 
  }).lean()

  if (!scan) throw new ApiError(404, 'Scan not found')
  return res.json(new ApiResponse(200, scan, 'Scan details fetched'))
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

