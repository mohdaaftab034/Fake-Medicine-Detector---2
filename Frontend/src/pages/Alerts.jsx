import React, { useState, useEffect } from 'react'
import api from '../services/api.js'

const severityConfig = {
  CRITICAL: { color: '#EF233C', bg: 'rgba(239,35,60,0.1)', border: 'rgba(239,35,60,0.3)', icon: '🚨', label: 'CRITICAL' },
  HIGH: { color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)', icon: '⛔', label: 'HIGH' },
  MEDIUM: { color: '#FFB703', bg: 'rgba(255,183,3,0.1)', border: 'rgba(255,183,3,0.3)', icon: '⚠️', label: 'MEDIUM' },
  LOW: { color: '#00B4D8', bg: 'rgba(0,180,216,0.1)', border: 'rgba(0,180,216,0.3)', icon: 'ℹ️', label: 'LOW' }
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchAlerts()
    // Auto refresh every 6 hours
    const interval = setInterval(fetchAlerts, 6 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const params = filter !== 'ALL' ? `?severity=${filter}` : ''
      const res = await api.get(`/alerts${params}`)
      
      // Handle ApiResponse structure
      const data = res.data?.data
      if (data) {
        setAlerts(data.alerts || [])
        setTotal(data.total || 0)
      }
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F8F9FA', margin: 0 }}>
              🚨 Drug Safety Alerts
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '4px' }}>
              Official alerts from CDSCO and State Drug Authorities. Updated every 6 hours.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{
              padding: '6px 14px',
              background: 'rgba(6,214,160,0.1)',
              border: '1px solid rgba(6,214,160,0.3)',
              borderRadius: '20px',
              color: '#06D6A0',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              🔄 Auto-updates every 6 hours
            </span>
            {lastUpdated && (
              <span style={{ color: '#6B7280', fontSize: '11px' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => {
            const cfg = sev === 'ALL' ? { color: '#00B4D8', bg: 'rgba(0,180,216,0.1)', border: 'rgba(0,180,216,0.3)', icon: '📋' } : severityConfig[sev]
            const count = sev === 'ALL' ? total : alerts.filter(a => a.severity === sev).length
            return (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                style={{
                  padding: '8px 16px',
                  background: filter === sev ? cfg.bg : 'transparent',
                  border: `1px solid ${filter === sev ? cfg.border : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: filter === sev ? cfg.color : '#6B7280',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                {cfg.icon} {sev} {sev !== 'ALL' && `(${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* CDSCO Helpline Banner */}
      <div style={{
        background: 'rgba(239,35,60,0.05)',
        border: '1px solid rgba(239,35,60,0.2)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '20px' }}>📞</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#EF233C', fontWeight: '700', fontSize: '14px' }}>
            CDSCO Drug Safety Helpline: 1800-180-3024
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Report suspected fake medicines • Free helpline • Available 9 AM – 6 PM
          </div>
        </div>
        
        <a
          href="https://cdsco.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '6px 14px',
            background: 'rgba(239,35,60,0.15)',
            border: '1px solid rgba(239,35,60,0.3)',
            borderRadius: '8px',
            color: '#EF233C',
            fontSize: '12px',
            fontWeight: '600',
            textDecoration: 'none'
          }}
        >
          Visit CDSCO →
        </a>
      </div>

      {/* Alerts List */}
      {loading ? (
        // Skeleton loaders
        Array(5).fill(0).map((_, i) => (
          <div key={i} style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            animation: 'pulse 1.5s infinite'
          }}>
            <div style={{ height: '16px', background: '#1F2937', borderRadius: '4px', width: '60%', marginBottom: '8px' }} />
            <div style={{ height: '12px', background: '#1F2937', borderRadius: '4px', width: '90%' }} />
          </div>
        ))
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>No active alerts</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>No drug safety alerts for selected filter</div>
        </div>
      ) : (
        alerts.map(alert => {
          const cfg = severityConfig[alert.severity] || severityConfig.MEDIUM
          const isExpanded = expandedId === alert._id

          return (
            <div
              key={alert._id}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${isExpanded ? cfg.border : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                marginBottom: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              {/* Alert Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : alert._id)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                {/* Severity indicator */}
                <div style={{
                  padding: '6px 10px',
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: '8px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <span style={{ fontSize: '18px' }}>{cfg.icon}</span>
                  <span style={{ color: cfg.color, fontSize: '10px', fontWeight: '700' }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ color: '#F8F9FA', fontWeight: '600', fontSize: '14px', lineHeight: '1.4' }}>
                    {alert.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#6B7280', fontSize: '11px' }}>
                      📅 {new Date(alert.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span style={{ color: '#6B7280', fontSize: '11px' }}>
                      🏛️ {alert.source}
                    </span>
                    {alert.affectedMedicine && (
                      <span style={{
                        padding: '1px 8px',
                        background: 'rgba(0,180,216,0.1)',
                        borderRadius: '20px',
                        color: '#00B4D8',
                        fontSize: '11px'
                      }}>
                        💊 {alert.affectedMedicine}
                      </span>
                    )}
                    {alert.affectedStates?.includes('All States') && (
                      <span style={{
                        padding: '1px 8px',
                        background: 'rgba(239,35,60,0.1)',
                        borderRadius: '20px',
                        color: '#EF233C',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        🇮🇳 All India
                      </span>
                    )}
                  </div>
                </div>

                <span style={{ color: '#6B7280', fontSize: '18px', flexShrink: 0 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  padding: '0 16px 16px 16px',
                  borderTop: `1px solid ${cfg.border}`,
                  paddingTop: '16px'
                }}>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
                    {alert.description}
                  </div>

                  {/* Action Required */}
                  {alert.actionRequired && (
                    <div style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ color: cfg.color, fontWeight: '700', fontSize: '12px', marginBottom: '4px' }}>
                        ⚡ ACTION REQUIRED:
                      </div>
                      <div style={{ color: '#F8F9FA', fontSize: '13px' }}>
                        {alert.actionRequired}
                      </div>
                    </div>
                  )}

                  {/* Batch Numbers */}
                  {alert.batchNumbers?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px' }}>
                        Affected Batch Numbers:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {alert.batchNumbers.map((bn, i) => (
                          <span key={i} style={{
                            padding: '4px 10px',
                            background: 'rgba(239,35,60,0.1)',
                            border: '1px solid rgba(239,35,60,0.2)',
                            borderRadius: '6px',
                            color: '#EF233C',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: '600'
                          }}>
                            {bn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affected States */}
                  {alert.affectedStates?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '6px' }}>
                        Affected States:
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {alert.affectedStates.map((state, i) => (
                          <span key={i} style={{
                            padding: '3px 8px',
                            background: 'rgba(255,183,3,0.1)',
                            borderRadius: '20px',
                            color: '#FFB703',
                            fontSize: '11px'
                          }}>
                            📍 {state}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Source link */}
                  {alert.sourceUrl && (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: 'rgba(0,180,216,0.1)',
                        border: '1px solid rgba(0,180,216,0.2)',
                        borderRadius: '8px',
                        color: '#00B4D8',
                        fontSize: '12px',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}
                    >
                      🔗 View Official Notice
                    </a>
                  )}
                </div>
              )}
            </div>
          )
        })
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
