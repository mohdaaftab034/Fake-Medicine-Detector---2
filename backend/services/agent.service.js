import axios from 'axios'
import { analyzeImage } from './groq.service.js'
import BatchNumber from '../models/BatchNumber.model.js'
import Alert from '../models/Alert.model.js'
import Chemist from '../models/Chemist.model.js'
import Medicine from '../models/Medicine.model.js'

// ============================================================
// TOOL DEFINITIONS — Agent ke paas ye tools available hain
// ============================================================

const TOOLS = [
  {
    name: 'verify_batch_number',
    description: 'Check if a medicine batch number has been recalled by CDSCO or state drug authorities. Use this whenever a batch number is mentioned or detected.',
    input_schema: {
      type: 'object',
      properties: {
        batch_number: {
          type: 'string',
          description: 'The batch/lot number of the medicine to verify'
        }
      },
      required: ['batch_number']
    }
  },
  {
    name: 'search_medicine_info',
    description: 'Search for detailed information about a medicine including uses, dosage, side effects, price, and warnings. Use this when user asks about a medicine.',
    input_schema: {
      type: 'object',
      properties: {
        medicine_name: {
          type: 'string',
          description: 'Name of the medicine to search'
        },
        query_type: {
          type: 'string',
          enum: ['general', 'price', 'side_effects', 'dosage', 'alternatives', 'interactions'],
          description: 'What specific information is needed'
        }
      },
      required: ['medicine_name']
    }
  },
  {
    name: 'check_cdsco_alerts',
    description: 'Check current drug safety alerts from CDSCO. Use when user asks about drug safety or if a medicine is safe.',
    input_schema: {
      type: 'object',
      properties: {
        medicine_name: {
          type: 'string',
          description: 'Medicine name to check alerts for (optional)'
        },
        severity: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'ALL'],
          description: 'Filter by severity level'
        }
      },
      required: []
    }
  },
  {
    name: 'find_nearby_chemists',
    description: 'Find verified chemists near user location. Use when user asks where to buy medicine or needs a trusted pharmacy.',
    input_schema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'User latitude' },
        lng: { type: 'number', description: 'User longitude' },
        radius_km: { type: 'number', description: 'Search radius in km, default 5' }
      },
      required: ['lat', 'lng']
    }
  },
  {
    name: 'get_medicine_alternatives',
    description: 'Find alternative medicines with same generic composition. Use when a medicine is recalled or user asks for alternatives.',
    input_schema: {
      type: 'object',
      properties: {
        medicine_name: { type: 'string', description: 'Medicine to find alternatives for' },
        generic_name: { type: 'string', description: 'Generic/chemical name if known' }
      },
      required: ['medicine_name']
    }
  },
  {
    name: 'report_fake_medicine',
    description: 'Automatically create a report for a suspected fake or substandard medicine. Use when user wants to report.',
    input_schema: {
      type: 'object',
      properties: {
        medicine_name: { type: 'string' },
        batch_number: { type: 'string' },
        chemist_name: { type: 'string' },
        city: { type: 'string' },
        issue_description: { type: 'string' }
      },
      required: ['medicine_name', 'city']
    }
  },
  {
    name: 'calculate_medicine_safety_score',
    description: 'Calculate overall safety score for a medicine based on all available data. Use after gathering all information.',
    input_schema: {
      type: 'object',
      properties: {
        medicine_name: { type: 'string' },
        batch_number: { type: 'string' },
        packaging_status: { type: 'string', enum: ['GENUINE', 'SUSPICIOUS', 'FAKE'] },
        has_alerts: { type: 'boolean' },
        is_recalled: { type: 'boolean' }
      },
      required: ['medicine_name']
    }
  }
]

// ============================================================
// TOOL EXECUTION — Actual tool logic
// ============================================================

const executeTool = async (toolName, toolInput, userContext) => {
  console.log(`[AGENT] Executing tool: ${toolName}`, toolInput)

  switch (toolName) {

    case 'verify_batch_number': {
      const batch = toolInput.batch_number?.trim().toUpperCase()
      if (!batch) return { found: false, message: 'No batch number provided' }

      const record = await BatchNumber.findOne({
        batchNumber: { $regex: new RegExp(batch.replace(/[^a-zA-Z0-9]/g, '.*'), 'i') }
      }).lean()

      if (!record) {
        return {
          found: false,
          status: 'NOT_IN_RECALLED_LIST',
          batch_number: batch,
          message: 'This batch is not in our recalled medicines database',
          note: 'Not being listed does not guarantee genuineness'
        }
      }

      return {
        found: true,
        status: record.status,
        batch_number: record.batchNumber,
        medicine: record.medicine,
        manufacturer: record.manufacturer,
        recall_date: record.recallDate,
        recall_reason: record.recallReason,
        recall_authority: record.recallAuthority,
        severity: record.severity,
        affected_states: record.affectedStates
      }
    }

    case 'search_medicine_info': {
      const name = toolInput.medicine_name
      const queryType = toolInput.query_type || 'general'

      // Check local database first
      const localMed = await Medicine.findOne({
        name: { $regex: new RegExp(name, 'i') }
      }).lean()

      if (localMed) {
        return {
          found: true,
          source: 'MediGuard Database',
          name: localMed.name,
          generic_name: localMed.genericName,
          manufacturer: localMed.manufacturer,
          category: localMed.category,
          indications: localMed.indications,
          dosage: localMed.dosageInstructions,
          warnings: localMed.warnings,
          side_effects: localMed.sideEffects,
          interactions: localMed.drugInteractions,
          storage: localMed.storageInstructions,
          requires_prescription: localMed.requiresPrescription,
          search_count: localMed.searchCount
        }
      }

      // Try OpenFDA
      try {
        const res = await axios.get(
          `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(name)}"&limit=1`,
          { timeout: 8000 }
        )
        if (res.data?.results?.length > 0) {
          const r = res.data.results[0]
          return {
            found: true,
            source: 'OpenFDA',
            name: r.openfda?.brand_name?.[0] || name,
            generic_name: r.openfda?.generic_name?.[0],
            manufacturer: r.openfda?.manufacturer_name?.[0],
            indications: r.indications_and_usage?.[0]?.substring(0, 300),
            warnings: r.warnings?.[0]?.substring(0, 300),
            side_effects: r.adverse_reactions?.[0]?.substring(0, 300),
            interactions: r.drug_interactions?.[0]?.substring(0, 200)
          }
        }
      } catch (e) {
        console.log('[AGENT] OpenFDA failed:', e.message)
      }

      return { found: false, message: `No information found for ${name}` }
    }

    case 'check_cdsco_alerts': {
      const filter = { isActive: true }
      if (toolInput.medicine_name) {
        filter.$or = [
          { affectedMedicine: { $regex: new RegExp(toolInput.medicine_name, 'i') } },
          { title: { $regex: new RegExp(toolInput.medicine_name, 'i') } }
        ]
      }
      if (toolInput.severity && toolInput.severity !== 'ALL') {
        filter.severity = toolInput.severity
      }

      const alerts = await Alert.find(filter)
        .sort({ severity: -1, createdAt: -1 })
        .limit(5)
        .lean()

      return {
        total_alerts: alerts.length,
        has_critical: alerts.some(a => a.severity === 'CRITICAL'),
        alerts: alerts.map(a => ({
          title: a.title,
          severity: a.severity,
          medicine: a.affectedMedicine,
          action: a.actionRequired,
          source: a.source,
          date: a.createdAt
        }))
      }
    }

    case 'find_nearby_chemists': {
      const { lat, lng, radius_km = 5 } = toolInput
      const delta = radius_km * 0.009

      const chemists = await Chemist.find({
        isVerified: true,
        isBlacklisted: false,
        'coordinates.lat': { $gte: lat - delta, $lte: lat + delta },
        'coordinates.lng': { $gte: lng - delta, $lte: lng + delta }
      })
      .select('shopName address city phone rating coordinates licenseNumber')
      .limit(5)
      .lean()

      return {
        found: chemists.length > 0,
        total: chemists.length,
        chemists: chemists.map(c => ({
          name: c.shopName,
          address: `${c.address}, ${c.city}`,
          phone: c.phone,
          rating: c.rating,
          license: c.licenseNumber,
          directions_url: `https://www.google.com/maps/dir/?api=1&destination=${c.coordinates?.lat},${c.coordinates?.lng}`
        }))
      }
    }

    case 'get_medicine_alternatives': {
      const { medicine_name, generic_name } = toolInput
      const searchTerm = generic_name || medicine_name

      const alternatives = await Medicine.find({
        $or: [
          { genericName: { $regex: new RegExp(searchTerm, 'i') } },
          { name: { $regex: new RegExp(searchTerm, 'i') } }
        ],
        name: { $ne: medicine_name }
      })
      .limit(5)
      .lean()

      return {
        found: alternatives.length > 0,
        alternatives: alternatives.map(a => ({
          name: a.name,
          generic_name: a.genericName,
          manufacturer: a.manufacturer,
          requires_prescription: a.requiresPrescription
        })),
        note: 'Always consult doctor before switching medicines'
      }
    }

    case 'report_fake_medicine': {
      const Report = (await import('../models/Report.model.js')).default
      const caseId = `MG-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`

      const report = await Report.create({
        reporter: userContext?.userId,
        isAnonymous: !userContext?.userId,
        medicine: {
          name: toolInput.medicine_name,
          batchNumber: toolInput.batch_number
        },
        chemistShop: {
          name: toolInput.chemist_name || 'Unknown',
          city: toolInput.city,
          state: userContext?.state || ''
        },
        status: 'pending',
        caseId,
        severity: 'MEDIUM'
      })

      return {
        success: true,
        case_id: caseId,
        message: 'Report submitted successfully',
        next_steps: 'CDSCO and local drug authority will be notified within 24 hours'
      }
    }

    case 'calculate_medicine_safety_score': {
      let score = 100
      const factors = []

      if (toolInput.is_recalled) {
        score -= 60
        factors.push({ factor: 'Batch Recalled by Government', impact: -60 })
      }
      if (toolInput.has_alerts) {
        score -= 20
        factors.push({ factor: 'Active CDSCO Alert', impact: -20 })
      }
      if (toolInput.packaging_status === 'FAKE') {
        score -= 30
        factors.push({ factor: 'Packaging Issues Detected', impact: -30 })
      } else if (toolInput.packaging_status === 'SUSPICIOUS') {
        score -= 15
        factors.push({ factor: 'Suspicious Packaging', impact: -15 })
      }

      score = Math.max(0, score)

      return {
        safety_score: score,
        risk_level: score >= 80 ? 'LOW' : score >= 50 ? 'MEDIUM' : score >= 20 ? 'HIGH' : 'CRITICAL',
        factors,
        recommendation: score >= 80
          ? 'Medicine appears safe to use. Always verify with pharmacist.'
          : score >= 50
          ? 'Some concerns detected. Verify with pharmacist before use.'
          : 'Serious concerns. Do not use without professional verification.'
      }
    }

    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}

// ============================================================
// MAIN AGENT FUNCTION — Multi-step reasoning
// ============================================================

export const runMediGuardAgent = async (userMessage, context = {}) => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key required for agent')
  }

  const systemPrompt = `You are MediGuard AI Agent — an intelligent medicine safety assistant for India.

You have access to powerful tools to help users verify medicine safety, find information, and take action.

AGENT BEHAVIOR:
- Always think step by step before responding
- Use multiple tools when needed to give complete answers
- If a medicine is recalled or dangerous, be very clear and urgent about it
- Always recommend consulting a doctor for medical decisions
- Be proactive — if user mentions a medicine, check alerts automatically
- If batch number is mentioned anywhere, always verify it
- Calculate safety score when you have enough information
- Suggest alternatives if medicine has issues

CONTEXT:
User Location: ${context.lat && context.lng ? `Lat ${context.lat}, Lng ${context.lng}` : 'Not provided'}
Scan Result: ${context.scanResult ? JSON.stringify(context.scanResult) : 'No scan'}
Medicine Context: ${context.medicineContext || 'None'}

Respond in a helpful, clear manner. Use markdown formatting for important information.
Always end with actionable recommendations.`

  const messages = [
    { role: 'user', content: userMessage }
  ]

  let finalResponse = ''
  let toolsUsed = []
  let iterations = 0
  const MAX_ITERATIONS = 5

  // Agentic loop — keeps running until Claude stops using tools
  while (iterations < MAX_ITERATIONS) {
    iterations++
    console.log(`[AGENT] Iteration ${iterations}`)

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        tools: TOOLS,
        messages
      },
      {
        headers: {
          'x-api-key': ANTHROPIC_API_KEY.trim(),
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    const responseContent = response.data.content
    const stopReason = response.data.stop_reason

    console.log(`[AGENT] Stop reason: ${stopReason}`)

    // Add assistant response to messages
    messages.push({ role: 'assistant', content: responseContent })

    // If Claude is done — no more tools to use
    if (stopReason === 'end_turn') {
      finalResponse = responseContent
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')
      break
    }

    // If Claude wants to use tools
    if (stopReason === 'tool_use') {
      const toolUseBlocks = responseContent.filter(block => block.type === 'tool_use')
      const toolResults = []

      // Execute all requested tools
      for (const toolUse of toolUseBlocks) {
        console.log(`[AGENT] Using tool: ${toolUse.name}`)
        toolsUsed.push(toolUse.name)

        const result = await executeTool(toolUse.name, toolUse.input, context)

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        })
      }

      // Add tool results back to messages so Claude can continue
      messages.push({
        role: 'user',
        content: toolResults
      })
    }
  }

  return {
    response: finalResponse,
    toolsUsed: [...new Set(toolsUsed)], // unique tools
    iterations
  }
}
