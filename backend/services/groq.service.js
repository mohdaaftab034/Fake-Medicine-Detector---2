import axios from 'axios'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile'

const PACKAGING_ANALYSIS_PROMPT = `You are a medicine packaging analyst with expert knowledge of Indian medicines.

Analyze this medicine packaging image carefully. Read ALL text visible on the packaging.

RESPOND EXACTLY IN THIS FORMAT — do not change the labels:

MEDICINE_NAME: [Write the exact medicine brand name as printed on packaging. Example: Dabitor 150, Dolo 650, Pan 40, Crocin Advance]
GENERIC_NAME: [Write the generic/chemical name. Example: Dabigatran Etexilate Capsules 150mg, Paracetamol Tablets 650mg]
MANUFACTURER: [Exact manufacturer name from packaging]
MRP: [Exact MRP price with Rs or rupee symbol if visible, else write NOT_VISIBLE]
BATCH_NUMBER: [Exact batch/lot number if visible, else write NOT_VISIBLE]
EXPIRY_DATE: [Exact expiry date if visible, else write NOT_VISIBLE]
DRUG_LICENSE: [Drug license number if visible, else write NOT_VISIBLE]
MANUFACTURER_ADDRESS: [Address if visible, else write NOT_VISIBLE]
CATEGORY: [Tablet or Capsule or Syrup or Injection or Cream or Drops]
REQUIRES_PRESCRIPTION: [YES if Rx symbol visible, NO if OTC]

PACKAGING_STATUS: [Write exactly one of: LOOKS_PROFESSIONAL or HAS_ISSUES or IMAGE_UNCLEAR]
CONFIDENCE: [Number between 0 and 100]

RED_FLAGS:
[List each red flag on a new line starting with dash. Write NONE if no red flags]

WHAT_I_SEE:
[Describe all visible text and elements on the packaging in 2-3 sentences]

SAFETY_ADVICE:
[Write 2-3 practical steps the user should take]

IMPORTANT: Medicine name is the most critical field. Read it exactly as printed — large text on the packaging is usually the brand name.`

const fetchImageAsBase64 = async (imageUrl) => {
  let fetchUrl = imageUrl
  if (/res\.cloudinary\.com/i.test(imageUrl) && imageUrl.includes('/upload/')) {
    fetchUrl = imageUrl.replace('/upload/', '/upload/f_jpg,q_90,w_1600/')
  }

  const response = await axios.get(fetchUrl, {
    responseType: 'arraybuffer',
    timeout: 30000
  })

  const contentType = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const mimeType = supported.includes(contentType) ? contentType : 'image/jpeg'
  const base64Data = Buffer.from(response.data).toString('base64')
  return { base64Data, mimeType }
}

const parseStructuredResponse = (text) => {
  const getField = (fieldName) => {
    const patterns = [
      new RegExp(`${fieldName}:\\s*([^\\n]+)`, 'i'),
      new RegExp(`${fieldName}\\s*=\\s*([^\\n]+)`, 'i'),
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match?.[1]) {
        const value = match[1].trim()
        if (
          value &&
          value !== 'NOT_VISIBLE' &&
          value !== 'N/A' &&
          !value.match(/^\[.*\]$/) &&
          value.length > 1
        ) {
          return value
        }
      }
    }
    return null
  }

  const medicineName = getField('MEDICINE_NAME')
  const genericName = getField('GENERIC_NAME')
  const manufacturer = getField('MANUFACTURER')
  const mrp = getField('MRP')
  const batchNumber = getField('BATCH_NUMBER')
  const expiryDate = getField('EXPIRY_DATE')
  const drugLicense = getField('DRUG_LICENSE')
  const manufacturerAddress = getField('MANUFACTURER_ADDRESS')
  const category = getField('CATEGORY')
  const requiresPrescription = getField('REQUIRES_PRESCRIPTION')

  // Parse red flags
  const redFlagsMatch = text.match(/RED_FLAGS:\n([\s\S]*?)(?=WHAT_I_SEE:|SAFETY_ADVICE:|$)/i)
  const redFlagsText = redFlagsMatch?.[1]?.trim() || ''
  const redFlags = redFlagsText === 'NONE' || !redFlagsText
    ? []
    : redFlagsText
        .split('\n')
        .map(l => l.replace(/^[-•*]\s*/, '').trim())
        .filter(l => l.length > 5 && l.toLowerCase() !== 'none')

  // Parse what AI sees
  const whatISeeMatch = text.match(/WHAT_I_SEE:\n([\s\S]*?)(?=SAFETY_ADVICE:|RED_FLAGS:|$)/i)
  const whatISee = whatISeeMatch?.[1]?.trim() || ''

  // Parse safety advice
  const safetyMatch = text.match(/SAFETY_ADVICE:\n([\s\S]*?)$/i)
  const safetyAdvice = safetyMatch?.[1]?.trim() || ''

  // Parse status
  const packagingStatusMatch = text.match(/PACKAGING_STATUS:\s*([^\n]+)/i)
  const packagingStatus = packagingStatusMatch?.[1]?.trim() || 'IMAGE_UNCLEAR'

  // Parse confidence
  const confidenceMatch = text.match(/CONFIDENCE:\s*(\d+)/i)
  const confidence = confidenceMatch ? Math.min(100, Number(confidenceMatch[1])) : 70

  // Map packaging status to DB status
  const statusMap = {
    'LOOKS_PROFESSIONAL': 'GENUINE',
    'HAS_ISSUES': 'FAKE',
    'IMAGE_UNCLEAR': 'SUSPICIOUS'
  }
  const dbStatus = statusMap[packagingStatus] || 'SUSPICIOUS'

  // Build display name — use brand name if available, fall back to generic
  const displayName = medicineName || genericName || 'Could not detect medicine name'

  console.log('[AI SERVICE] Parsed medicine name:', displayName)
  console.log('[AI SERVICE] Parsed manufacturer:', manufacturer)
  console.log('[AI SERVICE] Packaging status:', packagingStatus)

  return {
    // For DB storage
    status: dbStatus,
    confidence,
    packagingStatus,
    redFlags,

    // Medicine details
    medicineDetails: {
      name: displayName,
      genericName: genericName || 'Not detected',
      manufacturer: manufacturer || 'Not detected',
      mrp: mrp || 'Not visible',
      batchNumber: batchNumber || 'Not visible',
      expiryDate: expiryDate || 'Not visible',
      drugLicense: drugLicense || 'Not visible',
      manufacturerAddress: manufacturerAddress || 'Not visible',
      category: category || 'Not detected',
      requiresPrescription: requiresPrescription === 'YES'
    },

    // For frontend display
    fields: {
      medicineName: displayName,
      genericName: genericName || 'Not detected',
      manufacturer: manufacturer || 'Not detected',
      batchNumber: batchNumber || 'Not visible',
      expiryDate: expiryDate || 'Not visible',
      mrp: mrp || 'Not visible',
      drugLicense: drugLicense || 'Not visible',
      manufacturerAddress: manufacturerAddress || 'Not visible',
      category: category || 'Not detected',
      requiresPrescription: requiresPrescription === 'YES'
    },

    // Summary text for chat
    whatISee,
    safetyAdvice,
    text // full raw text
  }
}

const extractText = (response) => {
  return response?.data?.choices?.[0]?.message?.content || ''
}

export const analyzeImage = async (imageUrl) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is missing')
    }

    if (typeof imageUrl !== 'string' || !/^https?:\/\//i.test(imageUrl)) {
      throw new Error('Image URL must be a valid HTTP(S) URL')
    }

    const { base64Data, mimeType } = await fetchImageAsBase64(imageUrl)
    const dataUrl = `data:${mimeType};base64,${base64Data}`

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: PACKAGING_ANALYSIS_PROMPT
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2048
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    const text = extractText(response)

    if (!text || text.trim().length < 50) {
      throw new Error('Groq returned empty response')
    }

    console.log('[AI SERVICE] Raw response:', text.substring(0, 500))

    // Use new structured parser
    const parsed = parseStructuredResponse(text)

    console.log('[AI SERVICE] Final medicine name:', parsed.medicineDetails.name)

    return parsed
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error.message || 'Image analysis failed')
  }
}


export const askGroq = async (userMessage, conversationHistory = [], medicineContext = '') => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is missing')
    }

    const systemContext = medicineContext
      ? `You are MediGuard AI assistant. The user previously analyzed a medicine. Here is the analysis:\n\n${medicineContext}\n\nAnswer the user's follow-up question about this medicine. Be helpful, accurate, and concise. Keep response under 200 words. If asked something unrelated to medicine or health, politely redirect.`
      : 'You are MediGuard AI assistant specialized in Indian medicines. Answer medicine-related questions helpfully and accurately.'

    const messages = [
      {
        role: 'system',
        content: systemContext
      }
    ]

    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })
      })
    }

    messages.push({
      role: 'user',
      content: userMessage
    })

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_CHAT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    const text = response?.data?.choices?.[0]?.message?.content
    if (!text) throw new Error('Groq returned empty response')
    return text
  } catch (error) {
    throw new Error(error?.response?.data?.error?.message || error.message || 'Chat response failed')
  }
}
