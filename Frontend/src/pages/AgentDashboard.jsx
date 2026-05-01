import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import api from '../services/api.js'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: '📸', label: 'Scan Medicine', action: 'scan', color: '#00B4D8' },
  { icon: '🔢', label: 'Verify Batch', action: 'batch', color: '#FFB703' },
  { icon: '💊', label: 'Medicine Info', action: 'info', color: '#06D6A0' },
  { icon: '🚨', label: 'Check Alerts', action: 'alerts', color: '#EF233C' },
  { icon: '🏪', label: 'Find Chemist', action: 'chemist', color: '#8B5CF6' },
  { icon: '📝', label: 'Report Fake', action: 'report', color: '#F97316' },
]

const AGENT_TOOLS = [
  { name: 'scan_medicine', icon: '📸', label: 'Scanning image' },
  { name: 'verify_batch', icon: '🔢', label: 'Checking batch' },
  { name: 'search_medicine', icon: '💊', label: 'Medicine lookup' },
  { name: 'check_alerts', icon: '🚨', label: 'CDSCO alerts' },
  { name: 'find_chemists', icon: '🏪', label: 'Nearby chemists' },
  { name: 'calculate_score', icon: '📊', label: 'Safety score' },
  { name: 'web_search', icon: '🌐', label: 'Web search' },
  { name: 'submit_report', icon: '📝', label: 'Submitting report' },
]

const SUGGESTED = [
  'Is Dolo 650 safe to use right now?',
  'Verify batch number BNW2404002',
  'Find chemist near me for Metformin',
  'What are CDSCO critical alerts today?',
  'Alternatives to Combiflam 400mg?',
  'Report fake Crocin I bought from chemist',
]

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function AgentDashboard() {
  // Chat state
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingTool, setThinkingTool] = useState(null)
  const [activeTool, setActiveTool] = useState(null)

  // Right panel state
  const [rightPanel, setRightPanel] = useState('welcome') 
  // values: welcome | scan | batch | result | alerts | chemists | score | report

  // Data states
  const [scanResult, setScanResult] = useState(null)
  const [batchResult, setBatchResult] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [chemists, setChemists] = useState([])
  const [medicineInfo, setMedicineInfo] = useState(null)
  const [agentLog, setAgentLog] = useState([])

  // Upload state
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [batchInput, setBatchInput] = useState('')
  const [userLocation, setUserLocation] = useState(null)

  const chatBottomRef = useRef(null)
  const fileInputRef = useRef(null)

  // Get location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null)
    )

    // Welcome message
    setMessages([{
      id: 1,
      role: 'agent',
      content: `# 👋 MediGuard AI Agent

I am your autonomous medicine safety assistant. I can:

- **📸 Scan** medicine images to check packaging
- **🔢 Verify** batch numbers against CDSCO recalled list  
- **💊 Look up** medicine info, dosage, side effects
- **🚨 Check** real-time drug safety alerts
- **🏪 Find** verified chemists near you
- **📊 Calculate** medicine safety score automatically
- **🌐 Search** web for latest medicine information

Just tell me what you need or click a quick action below!`,
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─── LOG AGENT ACTION ───
  const logAction = useCallback((tool, status, detail) => {
    setAgentLog(prev => [{
      id: `${Date.now()}-${Math.random()}`,
      tool,
      status, // running | done | error
      detail,
      time: new Date()
    }, ...prev.slice(0, 9)]) // keep last 10
  }, [])

  // ─── ADD AGENT MESSAGE ───
  const addAgentMessage = useCallback((content, extra = {}) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      role: 'agent',
      content,
      ...extra,
      timestamp: new Date()
    }])
  }, [])

  // ─── ADD USER MESSAGE ───
  const addUserMessage = useCallback((content) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      role: 'user',
      content,
      timestamp: new Date()
    }])
  }, [])

  // ─────────────────────────────────────────────
  // AGENT TOOLS — Frontend executes these
  // ─────────────────────────────────────────────

  const toolScanMedicine = async (imageFile) => {
    logAction('scan_medicine', 'running', 'Uploading and analyzing image...')
    setActiveTool('scan_medicine')
    setRightPanel('scan')

    const formData = new FormData()
    formData.append('medicineImage', imageFile)
    if (userLocation) {
      formData.append('lat', userLocation.lat)
      formData.append('lng', userLocation.lng)
    }

    const res = await api.post(`/scan/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000 // Increase timeout to 2 minutes for AI analysis
    })

    const data = res.data.data
    setScanResult(data)
    setRightPanel('result')
    logAction('scan_medicine', 'done', `Status: ${data.pipeline?.finalStatus || data.result}`)
    setActiveTool(null)
    return data
  }

  const toolVerifyBatch = async (batchNumber) => {
    logAction('verify_batch', 'running', `Checking batch ${batchNumber}...`)
    setActiveTool('verify_batch')

    const res = await api.get(`/batch/verify?batch=${encodeURIComponent(batchNumber)}`)
    const data = res.data.data

    setBatchResult(data)
    setRightPanel('batch')
    logAction('verify_batch', 'done', `Status: ${data.status}`)
    setActiveTool(null)
    return data
  }

  const toolCheckAlerts = async (medicine = '') => {
    logAction('check_alerts', 'running', 'Fetching CDSCO alerts...')
    setActiveTool('check_alerts')

    const params = medicine ? `?medicine=${encodeURIComponent(medicine)}` : ''
    const res = await api.get(`/alerts${params}`)
    const data = res.data.data.alerts

    setAlerts(data)
    setRightPanel('alerts')
    logAction('check_alerts', 'done', `${data.length} alerts found`)
    setActiveTool(null)
    return data
  }

  const toolFindChemists = async () => {
    if (!userLocation) {
      return { error: 'Location not available' }
    }

    logAction('find_chemists', 'running', 'Searching verified chemists...')
    setActiveTool('find_chemists')

    const res = await api.get(
      `/chemists/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=5000`
    )
    const data = res.data.data

    setChemists(data)
    setRightPanel('chemists')
    logAction('find_chemists', 'done', `${data.length} chemists found`)
    setActiveTool(null)
    return data
  }

  const toolSearchMedicine = async (name) => {
    logAction('search_medicine', 'running', `Looking up ${name}...`)
    setActiveTool('search_medicine')

    const res = await api.get(`/medicines/search?query=${encodeURIComponent(name)}`)
    const data = res.data.data

    if (data.length > 0) {
      setMedicineInfo(data[0])
      setRightPanel('medicine')
    }

    logAction('search_medicine', 'done', data.length > 0 ? 'Found' : 'Not found')
    setActiveTool(null)
    return data
  }

  const toolWebSearch = async (query, medicineContext) => {
    logAction('web_search', 'running', `Searching: ${query}`)
    setActiveTool('web_search')

    const res = await api.post(`/agent/chat`, {
      message: query,
      context: { medicineContext, lat: userLocation?.lat, lng: userLocation?.lng }
    })

    logAction('web_search', 'done', 'Search complete')
    setActiveTool(null)
    return res.data.data
  }

  // ─────────────────────────────────────────────
  // AGENT BRAIN — Decides which tools to use
  // ─────────────────────────────────────────────

  const runAgent = async (userInput, imageFile = null) => {
    setIsThinking(true)

    const lowerInput = userInput.toLowerCase()

    try {
      // ── SCAN: Image uploaded ──
      if (imageFile) {
        setThinkingTool('scan_medicine')
        addAgentMessage('📸 I can see you uploaded a medicine image. Let me analyze it completely...')

        const scanData = await toolScanMedicine(imageFile)
        const fields = scanData.pipeline?.step1_packaging?.fields || {}
        const medicineName = fields.medicineName || 'Unknown'
        const batchNum = fields.batchNumber

        let response = `## 📊 Complete Medicine Analysis

**Medicine:** ${medicineName}
**Manufacturer:** ${fields.manufacturer || 'Not detected'}
**Status:** ${scanData.pipeline?.finalRiskLevel || 'Unknown'} Risk`

        // Auto verify batch if detected
        if (batchNum && batchNum !== 'Not visible') {
          setThinkingTool('verify_batch')
          addAgentMessage(`🔢 Batch number **${batchNum}** detected. Checking recalled list...`)
          const batchData = await toolVerifyBatch(batchNum)

          if (batchData.status === 'RECALLED') {
            response += `\n\n### 🚨 CRITICAL: Batch Recalled!\n${batchData.recallReason}`
          } else {
            response += `\n\n### ✅ Batch Verification\nBatch ${batchNum} not in recalled list.`
          }
        }

        // Auto check alerts for this medicine
        if (medicineName !== 'Unknown') {
          setThinkingTool('check_alerts')
          const alertData = await toolCheckAlerts(medicineName)
          if (alertData.length > 0) {
            response += `\n\n### ⚠️ Active Alerts\n${alertData.length} alerts found for this medicine.`
          }
        }

        // Auto find nearby chemists
        if (userLocation) {
          setThinkingTool('find_chemists')
          const chemistData = await toolFindChemists()
          response += `\n\n### 🏪 Verified Chemists\n${chemistData.length} verified chemists found near you.`
        }

        response += `\n\n*All results shown in the panel →*`
        addAgentMessage(response)
      }

      // ── BATCH VERIFICATION ──
      else if (
        lowerInput.includes('batch') ||
        lowerInput.includes('verify') ||
        /[A-Z0-9]{6,}/.test(userInput)
      ) {
        const batchMatch = userInput.match(/[A-Z0-9]{4,}[-\/]?[A-Z0-9]*/i)
        if (batchMatch) {
          setThinkingTool('verify_batch')
          addAgentMessage(`🔢 Verifying batch number **${batchMatch[0]}**...`)

          const data = await toolVerifyBatch(batchMatch[0])

          if (data.status === 'RECALLED') {
            addAgentMessage(`## 🚨 CRITICAL ALERT

Batch **${data.batchNumber}** has been **RECALLED**!

**Medicine:** ${data.medicine}
**Reason:** ${data.recallReason}
**Authority:** ${data.recallAuthority}

⛔ **DO NOT CONSUME this medicine. Return to chemist immediately.**
📞 CDSCO Helpline: 1800-180-3024`)
          } else if (data.status === 'UNDER_INVESTIGATION') {
            addAgentMessage(`## ⚠️ Under Investigation

Batch **${data.batchNumber}** is currently under investigation by drug authorities.

Avoid using until cleared. Contact CDSCO: 1800-180-3024`)
          } else {
            addAgentMessage(`## ✅ Batch Clear

Batch **${batchMatch[0]}** is **not in our recalled medicines database**.

*Note: This doesn't guarantee genuineness. Always purchase from verified chemists.*`)
          }
        } else {
          setThinkingTool('batch')
          setRightPanel('batch_input')
          addAgentMessage('Please enter the batch number. You can type it or I can read it from a medicine image.')
        }
      }

      // ── ALERTS ──
      else if (
        lowerInput.includes('alert') ||
        lowerInput.includes('recall') ||
        lowerInput.includes('cdsco') ||
        (lowerInput.includes('safe') && lowerInput.includes('today'))
      ) {
        setThinkingTool('check_alerts')
        addAgentMessage('🚨 Checking latest CDSCO drug safety alerts...')

        const data = await toolCheckAlerts()
        const critical = data.filter(a => a.severity === 'CRITICAL')

        addAgentMessage(`## 🚨 CDSCO Drug Safety Alerts

**Total Active:** ${data.length} alerts
**Critical:** ${critical.length} alerts requiring immediate attention

${critical.slice(0, 3).map(a => `### ${a.title}\n${a.actionRequired || ''}`).join('\n\n')}

*Full details shown in panel →*`)
      }

      // ── FIND CHEMIST ──
      else if (
        lowerInput.includes('chemist') ||
        lowerInput.includes('pharmacy') ||
        lowerInput.includes('medical store') ||
        (lowerInput.includes('where') && lowerInput.includes('buy'))
      ) {
        setThinkingTool('find_chemists')
        addAgentMessage('🏪 Finding verified chemists near your location...')

        const data = await toolFindChemists()

        if (data.length === 0) {
          addAgentMessage(`## 🏪 No Verified Chemists Found

No MediGuard-verified chemists found near you yet.

**Tips:**
- Check the Find Chemist page for OSM pharmacies nearby
- Look for chemists with proper license displayed
- Avoid buying from unlicensed vendors`)
        } else {
          addAgentMessage(`## 🏪 Verified Chemists Near You

Found **${data.length}** MediGuard-verified chemist(s):

${data.slice(0, 3).map((c, i) => `**${i + 1}. ${c.shopName}**\n${c.address}\n📞 ${c.phone}`).join('\n\n')}

*Full map and directions in panel →*`)
        }
      }

      // ── REPORT FAKE ──
      else if (
        lowerInput.includes('report') ||
        lowerInput.includes('fake') ||
        lowerInput.includes('spurious')
      ) {
        setRightPanel('report')
        addAgentMessage(`## 📝 Report Fake Medicine

I will help you report this medicine to CDSCO.

Please provide:
1. **Medicine name** 
2. **Chemist shop name and city**
3. **Batch number** (if visible)
4. **What seems wrong** with the medicine

Or upload a photo and I will extract details automatically.

*Report form is now open in the panel →*`)
      }

      // ── MEDICINE INFO ──
      else if (
        lowerInput.includes('what is') ||
        lowerInput.includes('tell me about') ||
        lowerInput.includes('information') ||
        lowerInput.includes('side effect') ||
        lowerInput.includes('dosage') ||
        lowerInput.includes('price') ||
        lowerInput.includes('use') ||
        lowerInput.includes('alternative')
      ) {
        // Extract medicine name from input
        const medicineWords = userInput
          .replace(/what is|tell me about|information about|side effects of|dosage of|price of|uses of|alternatives to/gi, '')
          .trim()

        setThinkingTool('web_search')
        addAgentMessage(`🌐 Searching for information about **${medicineWords}**...`)

        const data = await toolWebSearch(userInput, `User is asking about: ${medicineWords}`)

        addAgentMessage(data.reply, {
          sources: data.sources,
          toolsUsed: ['web_search']
        })

        // Also search local db
        if (medicineWords.length > 2) {
          await toolSearchMedicine(medicineWords)
        }
      }

      // ── GENERAL / FALLBACK ──
      else {
        setThinkingTool('web_search')
        addAgentMessage('🌐 Let me find information about this...')

        const data = await toolWebSearch(userInput, '')
        addAgentMessage(data.reply, {
          sources: data.sources,
          toolsUsed: ['web_search']
        })
      }

    } catch (error) {
      console.error('[AGENT] Error:', error)
      addAgentMessage(`❌ I encountered an error: ${error.response?.data?.message || error.message}

Please try again or rephrase your question.`)
      logAction(activeTool || 'unknown', 'error', error.message)
    } finally {
      setIsThinking(false)
      setThinkingTool(null)
      setActiveTool(null)
    }
  }

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────

  const handleSend = async () => {
    if ((!input.trim() && !uploadedImage) || isThinking) return

    const userText = input.trim() || (uploadedImage ? 'Analyze this medicine image' : '')
    const imageToProcess = uploadedImage

    setInput('')
    setUploadedImage(null)
    setImagePreview(null)

    addUserMessage(userText)
    await runAgent(userText, imageToProcess)
  }

  const handleImageUpload = (file) => {
    if (!file) return
    setUploadedImage(file)
    setImagePreview(URL.createObjectURL(file))
    setInput('Analyze this medicine image')
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'scan':
        fileInputRef.current?.click()
        break
      case 'batch':
        setInput('Verify batch number ')
        setRightPanel('batch_input')
        break
      case 'info':
        setInput('Tell me about ')
        break
      case 'alerts':
        addUserMessage('Show me critical drug alerts')
        runAgent('Show me critical drug alerts')
        break
      case 'chemist':
        addUserMessage('Find verified chemist near me')
        runAgent('Find verified chemist near me')
        break
      case 'report':
        addUserMessage('I want to report a fake medicine')
        runAgent('I want to report a fake medicine')
        break
    }
  }

  // ─────────────────────────────────────────────
  // RIGHT PANEL CONTENT
  // ─────────────────────────────────────────────

  const renderRightPanel = () => {
    switch (rightPanel) {

      case 'welcome':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', padding: '32px' }}>
            <div style={{ fontSize: '64px', animation: 'float 3s ease-in-out infinite' }}>🛡️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: '700' }}>
                MediGuard AI Agent
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '8px' }}>
                Results will appear here as the agent works
              </div>
            </div>

            {/* Agent capabilities */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', marginTop: '16px' }}>
              {AGENT_TOOLS.map(tool => (
                <div key={tool.name} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>{tool.icon}</span>
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{tool.label}</span>
                </div>
              ))}
            </div>
          </div>
        )

      case 'result':
        if (!scanResult) return null
        const pipeline = scanResult.pipeline || {}
        const fields = pipeline.step1_packaging?.fields || {}
        const riskColors = {
          CRITICAL: '#EF233C', HIGH: '#FF6B35', MEDIUM: '#FFB703', LOW: '#06D6A0'
        }
        const riskColor = riskColors[pipeline.finalRiskLevel] || '#FFB703'

        return (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: '100%' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>
              📊 Analysis Report
            </div>

            {/* Risk Banner */}
            <div style={{ background: `${riskColor}15`, border: `2px solid ${riskColor}40`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>
                {pipeline.finalRiskLevel === 'LOW' ? '✅' : pipeline.finalRiskLevel === 'MEDIUM' ? '⚠️' : '🚨'}
              </div>
              <div>
                <div style={{ color: riskColor, fontWeight: '800', fontSize: '18px' }}>
                  {pipeline.finalRiskLevel || 'UNKNOWN'} RISK
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  Confidence: {pipeline.step1_packaging?.confidence || 0}%
                </div>
              </div>
            </div>

            {/* Medicine Details */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ color: '#00B4D8', fontWeight: '600', fontSize: '13px', marginBottom: '10px' }}>
                💊 Medicine Details
              </div>
              {[
                ['Name', fields.medicineName],
                ['Generic', fields.genericName],
                ['Manufacturer', fields.manufacturer],
                ['MRP', fields.mrp],
                ['Batch', fields.batchNumber],
                ['Expiry', fields.expiryDate],
                ['Drug License', fields.drugLicense],
              ].map(([label, value]) => value && value !== 'Not visible' && value !== 'Not detected' && (
                <div key={label} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280', fontSize: '12px', minWidth: '100px' }}>{label}:</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: '500' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Batch Result */}
            {pipeline.step2_batch && (
              <div style={{
                background: pipeline.step2_batch.status === 'RECALLED' ? 'rgba(239,35,60,0.08)' : 'rgba(6,214,160,0.05)',
                border: `1px solid ${pipeline.step2_batch.status === 'RECALLED' ? 'rgba(239,35,60,0.3)' : 'rgba(6,214,160,0.2)'}`,
                borderRadius: '12px', padding: '14px'
              }}>
                <div style={{ fontWeight: '600', fontSize: '13px', color: pipeline.step2_batch.status === 'RECALLED' ? '#EF233C' : '#06D6A0', marginBottom: '6px' }}>
                  {pipeline.step2_batch.status === 'RECALLED' ? '🚨 Batch RECALLED' : '✅ Batch Clear'}
                </div>
                {pipeline.step2_batch.recallReason && (
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{pipeline.step2_batch.recallReason}</div>
                )}
              </div>
            )}

            {/* Nearby Chemists */}
            {pipeline.step4_chemists?.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ color: '#8B5CF6', fontWeight: '600', fontSize: '13px', marginBottom: '10px' }}>
                  🏪 Nearby Verified Chemists
                </div>
                {pipeline.step4_chemists.slice(0, 3).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(139,92,246,0.05)', borderRadius: '8px', marginBottom: '6px' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600' }}>{c.shopName}</div>
                      <div style={{ color: '#6B7280', fontSize: '11px' }}>{c.city}</div>
                    </div>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.coordinates?.lat},${c.coordinates?.lng}`, '_blank')}
                      style={{ padding: '4px 10px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#8B5CF6', fontSize: '11px', cursor: 'pointer' }}
                    >
                      📍 Go
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => fields.batchNumber && fields.batchNumber !== 'Not visible' && toolVerifyBatch(fields.batchNumber)}
                style={{ flex: 1, padding: '10px', background: 'rgba(0,180,216,0.1)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '8px', color: '#00B4D8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                🔢 Re-verify Batch
              </button>
              <button
                onClick={() => toolFindChemists()}
                style={{ flex: 1, padding: '10px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#8B5CF6', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                🏪 More Chemists
              </button>
            </div>
          </div>
        )

      case 'batch':
        if (!batchResult) return null
        const isRecalled = batchResult.status === 'RECALLED'
        return (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>
              🔢 Batch Verification
            </div>
            <div style={{
              background: isRecalled ? 'rgba(239,35,60,0.08)' : 'rgba(6,214,160,0.08)',
              border: `2px solid ${isRecalled ? 'rgba(239,35,60,0.4)' : 'rgba(6,214,160,0.4)'}`,
              borderRadius: '16px', padding: '20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {isRecalled ? '🚨' : '✅'}
              </div>
              <div style={{ color: isRecalled ? '#EF233C' : '#06D6A0', fontWeight: '800', fontSize: '20px' }}>
                {isRecalled ? 'BATCH RECALLED' : batchResult.status === 'UNDER_INVESTIGATION' ? 'UNDER INVESTIGATION' : 'NOT IN RECALLED LIST'}
              </div>
              <div style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '8px', fontFamily: 'monospace', fontWeight: '600' }}>
                {batchResult.batchNumber}
              </div>
            </div>

            {isRecalled && (
              <div style={{ background: 'rgba(239,35,60,0.05)', border: '1px solid rgba(239,35,60,0.2)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['Medicine', batchResult.medicine],
                  ['Manufacturer', batchResult.manufacturer],
                  ['Recall Date', batchResult.recallDate],
                  ['Reason', batchResult.recallReason],
                  ['Authority', batchResult.recallAuthority],
                  ['Severity', batchResult.severity],
                ].map(([label, value]) => value && (
                  <div key={label} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#6B7280', fontSize: '12px', minWidth: '110px' }}>{label}:</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{value}</span>
                  </div>
                ))}
                {batchResult.affectedStates && (
                  <div>
                    <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '6px' }}>Affected States:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {batchResult.affectedStates.map((s, i) => (
                        <span key={i} style={{ padding: '2px 8px', background: 'rgba(255,183,3,0.1)', borderRadius: '20px', color: '#FFB703', fontSize: '11px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ background: 'rgba(239,35,60,0.15)', borderRadius: '8px', padding: '12px', color: '#EF233C', fontWeight: '700', textAlign: 'center', marginTop: '8px' }}>
                  ⛔ DO NOT CONSUME — Return to chemist
                </div>
              </div>
            )}

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📞</span>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>CDSCO Helpline</div>
                <div style={{ color: '#00B4D8', fontSize: '16px', fontWeight: '700' }}>1800-180-3024</div>
              </div>
            </div>
          </div>
        )

      case 'alerts':
        return (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>
                🚨 CDSCO Alerts
              </div>
              <span style={{ padding: '4px 12px', background: 'rgba(239,35,60,0.1)', border: '1px solid rgba(239,35,60,0.3)', borderRadius: '20px', color: '#EF233C', fontSize: '12px', fontWeight: '600' }}>
                {alerts.length} Active
              </span>
            </div>
            {alerts.map(alert => {
              const sColors = { CRITICAL: '#EF233C', HIGH: '#FF6B35', MEDIUM: '#FFB703', LOW: '#00B4D8' }
              const sc = sColors[alert.severity] || '#FFB703'
              return (
                <div key={alert._id} style={{ background: `${sc}08`, border: `1px solid ${sc}30`, borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ padding: '3px 8px', background: `${sc}15`, borderRadius: '6px', color: sc, fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                      {alert.severity}
                    </span>
                    <div style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
                      {alert.title}
                    </div>
                  </div>
                  {alert.actionRequired && (
                    <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.5' }}>
                      {alert.actionRequired}
                    </div>
                  )}
                  {alert.batchNumbers?.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {alert.batchNumbers.map((bn, i) => (
                        <span key={i} style={{ padding: '2px 8px', background: 'rgba(239,35,60,0.1)', borderRadius: '6px', color: '#EF233C', fontSize: '11px', fontFamily: 'monospace' }}>
                          {bn}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )

      case 'chemists':
        return (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: '100%' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>
              🏪 Verified Chemists Nearby
            </div>
            {chemists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏪</div>
                <div>No verified chemists found near you</div>
              </div>
            ) : (
              chemists.map((c, i) => (
                <div key={i} style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '14px' }}>{c.shopName}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>{c.address}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '12px' }}>📞 {c.phone}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        <span style={{ padding: '2px 8px', background: 'rgba(6,214,160,0.1)', borderRadius: '20px', color: '#06D6A0', fontSize: '11px', fontWeight: '600' }}>
                          ✅ Verified
                        </span>
                        {c.rating > 0 && (
                          <span style={{ padding: '2px 8px', background: 'rgba(255,183,3,0.1)', borderRadius: '20px', color: '#FFB703', fontSize: '11px' }}>
                            ⭐ {c.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.coordinates?.lat},${c.coordinates?.lng}`, '_blank')}
                      style={{ padding: '8px 14px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: '#8B5CF6', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      📍 Directions
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )

      case 'batch_input':
        return (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ fontSize: '64px' }}>🔢</div>
            <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '18px', textAlign: 'center' }}>
              Enter Batch Number
            </div>
            <input
              value={batchInput}
              onChange={e => setBatchInput(e.target.value.toUpperCase())}
              placeholder="e.g. BNW2404002"
              style={{
                width: '100%', maxWidth: '300px',
                padding: '14px', background: 'var(--bg-card)',
                border: '2px solid rgba(0,180,216,0.4)',
                borderRadius: '12px', color: 'var(--text-primary)',
                fontSize: '18px', textAlign: 'center',
                fontFamily: 'monospace', outline: 'none'
              }}
            />
            <button
              onClick={async () => {
                if (!batchInput.trim()) return
                addUserMessage(`Verify batch ${batchInput}`)
                await runAgent(`Verify batch number ${batchInput}`)
                setBatchInput('')
              }}
              style={{
                padding: '14px 32px', background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '16px', fontWeight: '700', cursor: 'pointer', width: '100%', maxWidth: '300px'
              }}
            >
              🔍 Verify Now
            </button>
          </div>
        )

      default:
        return null
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div style={{
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary, #0A0F1E)'
    }}>

      {/* Top Bar */}
      <div style={{
        padding: '12px 20px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px', height: '36px',
          background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 0 15px rgba(0,180,216,0.4)',
          animation: 'pulse-glow 2s infinite'
        }}>🤖</div>
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '15px' }}>
            MediGuard AI Agent
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
            Autonomous • Multi-tool • Real-time
          </div>
        </div>

        {/* Active tool indicator */}
        {activeTool && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px',
            background: 'rgba(0,180,216,0.1)',
            border: '1px solid rgba(0,180,216,0.3)',
            borderRadius: '20px'
          }}>
            <div style={{ width: '8px', height: '8px', background: '#00B4D8', borderRadius: '50%', animation: 'blink 1s infinite' }} />
            <span style={{ color: '#00B4D8', fontSize: '12px', fontWeight: '600' }}>
              {AGENT_TOOLS.find(t => t.name === activeTool)?.label || 'Working...'}
            </span>
          </div>
        )}

        {/* Agent log */}
        {agentLog.length > 0 && (
          <div style={{ marginLeft: activeTool ? '8px' : 'auto', display: 'flex', gap: '4px' }}>
            {agentLog.slice(0, 4).map(log => {
              const tool = AGENT_TOOLS.find(t => t.name === log.tool)
              return (
                <span key={log.id} title={`${log.tool}: ${log.detail}`} style={{
                  width: '28px', height: '28px',
                  background: log.status === 'done' ? 'rgba(6,214,160,0.1)'
                    : log.status === 'error' ? 'rgba(239,35,60,0.1)'
                    : 'rgba(0,180,216,0.1)',
                  border: `1px solid ${log.status === 'done' ? 'rgba(6,214,160,0.3)'
                    : log.status === 'error' ? 'rgba(239,35,60,0.3)'
                    : 'rgba(0,180,216,0.3)'}`,
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', cursor: 'help'
                }}>
                  {tool?.icon || '⚡'}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT — Chat */}
        <div style={{
          width: '42%',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border)'
        }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '8px', alignItems: 'flex-start'
              }}>
                {msg.role === 'agent' && (
                  <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #00B4D8, #0077B6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px' }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '85%',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #00B4D8, #0077B6)'
                    : 'var(--bg-card)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  padding: '12px 14px',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: '13px', lineHeight: '1.6'
                }}>
                  {msg.role === 'user' ? msg.content : (
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => <strong style={{ color: '#00B4D8' }}>{children}</strong>,
                        h2: ({ children }) => <h2 style={{ color: 'var(--text-primary)', fontSize: '15px', margin: '8px 0 6px' }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ color: '#00B4D8', fontSize: '13px', margin: '6px 0 4px' }}>{children}</h3>,
                        ul: ({ children }) => <ul style={{ paddingLeft: '16px', margin: '6px 0' }}>{children}</ul>,
                        li: ({ children }) => <li style={{ marginBottom: '3px', fontSize: '13px' }}>{children}</li>,
                        p: ({ children }) => <p style={{ margin: '0 0 6px 0' }}>{children}</p>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}

                  {/* Sources */}
                  {msg.sources?.length > 0 && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ color: '#6B7280', fontSize: '11px', marginBottom: '4px' }}>🔍 Sources:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {msg.sources.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#00B4D8', fontSize: '11px', textDecoration: 'none' }}>
                            → {s.title?.substring(0, 40)}...
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking */}
            {isThinking && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #00B4D8, #0077B6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', animation: 'spin 2s linear infinite' }}>
                  🤖
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: '5px', height: '5px', background: '#00B4D8', borderRadius: '50%', animation: `bounce 1s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
                    {thinkingTool ? `${AGENT_TOOLS.find(t => t.name === thinkingTool)?.icon} ${AGENT_TOOLS.find(t => t.name === thinkingTool)?.label}...` : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested queries */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => setInput(q)}
                  style={{ padding: '5px 10px', background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.15)', borderRadius: '20px', color: '#00B4D8', fontSize: '11px', cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div style={{ padding: '0 16px 8px', position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="upload preview" style={{ height: '60px', borderRadius: '8px', border: '2px solid rgba(0,180,216,0.4)' }} />
              <button onClick={() => { setUploadedImage(null); setImagePreview(null); setInput('') }}
                style={{ position: 'absolute', top: '-6px', right: '10px', width: '20px', height: '20px', background: '#EF233C', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', fontSize: '12px' }}>
                ×
              </button>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: '12px', padding: '8px 12px', alignItems: 'center' }}>
              <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', flexShrink: 0 }}>
                📸
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask anything or upload medicine image..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px' }}
              />
              <button
                onClick={handleSend}
                disabled={isThinking || (!input.trim() && !uploadedImage)}
                style={{
                  width: '32px', height: '32px',
                  background: isThinking || (!input.trim() && !uploadedImage) ? 'rgba(0,180,216,0.2)' : 'linear-gradient(135deg, #00B4D8, #0077B6)',
                  border: 'none', borderRadius: '8px', cursor: isThinking ? 'not-allowed' : 'pointer',
                  color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Live Results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {renderRightPanel()}
          </div>
        </div>
      </div>

      {/* Bottom Quick Actions */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        display: 'flex', gap: '8px', overflowX: 'auto'
      }}>
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.action}
            onClick={() => handleQuickAction(action.action)}
            disabled={isThinking}
            style={{
              padding: '8px 16px',
              background: `${action.color}12`,
              border: `1px solid ${action.color}40`,
              borderRadius: '20px',
              color: action.color,
              fontSize: '13px',
              fontWeight: '600',
              cursor: isThinking ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              opacity: isThinking ? 0.5 : 1
            }}
          >
            {action.icon} {action.label}
          </button>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0])}
      />

      <style>{`
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 15px rgba(0,180,216,0.4)} 50%{box-shadow:0 0 25px rgba(0,180,216,0.7)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
    </div>
  )
}
