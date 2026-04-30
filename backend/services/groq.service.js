import axios from 'axios'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile'

const PACKAGING_ANALYSIS_PROMPT = `You are a medicine packaging quality inspector. Your job is ONLY to check if the packaging looks professionally made or has visual problems. You CANNOT determine if a medicine is fake or genuine from image alone - only lab tests can do that.

CHECK ONLY THESE VISUAL THINGS:
1. Is the text printed clearly without blurring or smudging?
2. Are there any obvious spelling mistakes on the label?
3. Are these mandatory fields visible: medicine name, manufacturer name, batch number, expiry date, MRP, manufacturer address, drug license number?
4. Does the packaging look professionally printed or does it look photocopied/low quality?
5. Is there any sign of label tampering or sticker over sticker?
6. Is a hologram or security seal visible?

RESPOND WITH EXACTLY THIS FORMAT AND DO NOT USE ANY EMOJIS OR SPECIAL SYMBOLS:

PACKAGING INSPECTION REPORT

WHAT I CAN SEE
[Describe exactly what text and elements are visible]

PACKAGING STATUS
Status: [LOOKS PROFESSIONAL / HAS ISSUES / IMAGE TOO UNCLEAR]
Confidence: [number]%

MANDATORY FIELDS CHECK
Medicine Name: [found/not found]
Manufacturer: [exact text or not visible]
Batch Number: [exact text or not visible]
Expiry Date: [exact text or not visible]
MRP: [exact price or not visible]
Drug License No: [found/not visible]
Manufacturer Address: [found/not visible]

VISUAL RED FLAGS FOUND
[List any problems OR write "No visual red flags detected"]

MEDICINE DETAILS READ FROM IMAGE
Name: [exact text from packaging]
Manufacturer: [exact text from packaging]
MRP: [exact price from packaging or Not visible]
Batch: [exact number from packaging or Not visible]
Expiry: [exact date from packaging or Not visible]

IMPORTANT DISCLAIMER
This is only a visual packaging check. A professionally looking package does NOT guarantee the medicine inside is genuine. For certainty, verify the batch number with authorities and purchase only from licensed chemists.

RECOMMENDED NEXT STEPS
1. Verify batch number in the Batch Verification section
2. Purchase from a verified chemist on our platform
3. If in doubt, contact the manufacturer directly or report to CDSCO helpline 1800-180-3024`

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

const parseStatus = (text) => {
  const upper = text.toUpperCase()
  if (upper.includes('HAS ISSUES')) return 'HAS_ISSUES'
  if (upper.includes('IMAGE TOO UNCLEAR')) return 'UNCLEAR'
  if (upper.includes('LOOKS PROFESSIONAL')) return 'LOOKS_PROFESSIONAL'
  return 'LOOKS_PROFESSIONAL'
}

const parseConfidence = (text) => {
  const match = text.match(/Confidence:\s*(\d{1,3})\s*%/i)
  return match ? Math.min(100, Number(match[1])) : 70
}

const parseFields = (text) => ({
  medicineName: /Medicine Name:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible',
  manufacturer: /Manufacturer:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible',
  batchNumber: /Batch:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible',
  expiryDate: /Expiry:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible',
  mrp: /MRP:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible',
  drugLicense: /Drug License No:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible',
  manufacturerAddress: /Manufacturer Address:\s*(.+)/i.exec(text)?.[1]?.trim() || 'Not visible'
})

const parseRedFlags = (text) => {
  const match = text.match(/VISUAL RED FLAGS FOUND\s*\n([\s\S]*?)(?=MEDICINE DETAILS READ FROM IMAGE|IMPORTANT DISCLAIMER|$)/i)
  if (!match) return []

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^[-•*\d.\s]+/, '').trim())
    .filter((line) => line.length > 5 && !/^No visual red flags detected$/i.test(line))
}

const extractText = (response) => {
  return (response?.data?.choices || [])
    .map((choice) => choice?.message?.content)
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .join('\n')
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

    return {
      text,
      status: parseStatus(text),
      confidence: parseConfidence(text),
      fields: parseFields(text),
      redFlags: parseRedFlags(text)
    }
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
