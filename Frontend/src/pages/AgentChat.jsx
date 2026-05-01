import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import api from '../services/api.js'

const SUGGESTED_QUERIES = [
  "Is Dolo 650 safe to take?",
  "Check batch number BNW2404002",
  "Find verified chemist near me",
  "What are alternatives to Combiflam?",
  "Show me critical drug alerts",
  "Report a fake medicine I found"
]

export default function AgentChat() {
  const [messages, setMessages] = useState([{
    id: 1,
    role: 'agent',
    content: `👋 Hello! I am **MediGuard AI Agent**.

I can automatically:
- 🔍 Verify batch numbers against recalled list
- 💊 Find medicine information and alternatives  
- 🚨 Check CDSCO drug safety alerts
- 🏪 Find verified chemists near you
- 📋 Submit fake medicine reports
- 📊 Calculate medicine safety scores

Just ask me anything about a medicine and I will handle everything automatically!`,
    toolsUsed: [],
    timestamp: new Date()
  }])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingStep, setThinkingStep] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    )
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const thinkingMessages = [
    '🤔 Analyzing your question...',
    '🔍 Searching medicine database...',
    '📋 Checking CDSCO records...',
    '🌐 Gathering information...',
    '🧮 Calculating safety score...',
    '✍️ Preparing response...'
  ]

  const sendMessage = async () => {
    if (!input.trim() || isThinking) return

    const userMessage = input.trim()
    setInput('')

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])

    setIsThinking(true)

    // Cycle through thinking messages
    let stepIndex = 0
    setThinkingStep(thinkingMessages[0])
    const thinkingInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % thinkingMessages.length
      setThinkingStep(thinkingMessages[stepIndex])
    }, 1500)

    try {
      const response = await api.post('/agent/chat', {
        message: userMessage,
        context: {
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          medicineContext: messages
            .filter(m => m.role === 'agent' && m.medicineContext)
            .slice(-1)[0]?.medicineContext || ''
        }
      })

      const { reply, toolsUsed, iterations } = response.data.data

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'agent',
        content: reply,
        toolsUsed,
        iterations,
        timestamp: new Date()
      }])

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'agent',
        content: 'I encountered an error. Please try again.',
        toolsUsed: [],
        timestamp: new Date()
      }])
    } finally {
      clearInterval(thinkingInterval)
      setIsThinking(false)
      setThinkingStep('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', maxWidth: '800px', margin: '0 auto', padding: '16px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,180,216,0.1), rgba(0,119,182,0.1))',
        border: '1px solid rgba(0,180,216,0.3)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px', height: '40px',
          background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
          boxShadow: '0 0 20px rgba(0,180,216,0.4)',
          animation: 'pulse-glow 2s infinite'
        }}>🤖</div>
        <div>
          <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '16px' }}>
            MediGuard AI Agent
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Autonomous medicine safety assistant • Uses multiple tools automatically
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          width: '10px', height: '10px',
          background: '#06D6A0',
          borderRadius: '50%',
          boxShadow: '0 0 8px #06D6A0',
          animation: 'blink 1.5s infinite'
        }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '16px' }}>

        {messages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            {msg.role === 'agent' && (
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: '14px'
              }}>🤖</div>
            )}

            <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: '6px' }}>

              {/* Tools used badges */}
              {msg.toolsUsed?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {msg.toolsUsed.map((tool, i) => (
                    <span key={i} style={{
                      padding: '2px 8px',
                      background: 'rgba(0,180,216,0.1)',
                      border: '1px solid rgba(0,180,216,0.2)',
                      borderRadius: '20px',
                      color: '#00B4D8',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      ⚡ {tool.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Message bubble */}
              <div style={{
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #00B4D8, #0077B6)'
                  : 'var(--bg-card, #111827)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border, #1F2937)',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                padding: '14px 16px',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {msg.role === 'user' ? msg.content : (
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => <strong style={{ color: '#00B4D8' }}>{children}</strong>,
                      h2: ({ children }) => <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>{children}</h2>,
                      h3: ({ children }) => <h3 style={{ color: '#00B4D8', fontSize: '14px', marginBottom: '6px' }}>{children}</h3>,
                      ul: ({ children }) => <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>{children}</ul>,
                      li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                      p: ({ children }) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
                      code: ({ children }) => <code style={{ background: 'rgba(0,180,216,0.1)', padding: '2px 6px', borderRadius: '4px', color: '#00B4D8', fontFamily: 'monospace' }}>{children}</code>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>

              {/* Timestamp and iterations */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#6B7280', fontSize: '11px' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                {msg.iterations && (
                  <span style={{ color: '#6B7280', fontSize: '11px' }}>
                    • {msg.iterations} reasoning step{msg.iterations > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'spin 2s linear infinite'
            }}>🤖</div>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(0,180,216,0.3)',
              borderRadius: '4px 18px 18px 18px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px',
                    background: '#00B4D8',
                    borderRadius: '50%',
                    animation: `bounce 1s infinite ${i * 0.2}s`
                  }} />
                ))}
              </div>
              <span style={{ color: '#9CA3AF', fontSize: '13px' }}>{thinkingStep}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested queries — show only if no messages yet */}
      {messages.length === 1 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '8px' }}>
            💡 Try asking:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUGGESTED_QUERIES.map((q, i) => (
              <button
                key={i}
                onClick={() => { setInput(q); }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(0,180,216,0.08)',
                  border: '1px solid rgba(0,180,216,0.2)',
                  borderRadius: '20px',
                  color: '#00B4D8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '10px',
        background: 'var(--bg-card)',
        border: '1px solid rgba(0,180,216,0.3)',
        borderRadius: '12px',
        padding: '8px 12px',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '18px' }}>🤖</span>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask agent anything about a medicine..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isThinking || !input.trim()}
          style={{
            width: '36px', height: '36px',
            background: isThinking || !input.trim()
              ? 'rgba(0,180,216,0.2)'
              : 'linear-gradient(135deg, #00B4D8, #0077B6)',
            border: 'none',
            borderRadius: '8px',
            cursor: isThinking || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            fontSize: '16px'
          }}
        >
          {isThinking ? '⏳' : '→'}
        </button>
      </div>

      <style>{`
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(0,180,216,0.4)} 50%{box-shadow:0 0 30px rgba(0,180,216,0.8)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
