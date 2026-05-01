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
    <div className="mg-root">
      <section className="mg-hero py-12 bg-bg-0 border-b border-line overflow-hidden">
        <div className="mg-hero__bg-grid" aria-hidden />
        <div className="mg-container relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="max-w-2xl">
              <span className="mg-badge mg-badge--red mb-4">
                <span className="mg-badge__dot" />
                Live Safety Monitor
              </span>
              <h1 className="mg-hero__headline text-4xl md:text-5xl mb-3 text-left">Drug Safety Alerts</h1>
              <p className="mg-hero__sub text-left m-0">Official advisories from CDSCO and State Drug Control Departments.</p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <div className="mg-badge mg-badge--green text-sm py-2 px-4">
                <span className="mg-badge__dot" />
                Auto-Sync Active
              </div>
              {lastUpdated && (
                <span className="text-[10px] uppercase tracking-widest text-text-lo font-bold">
                  Last Update: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 p-2 bg-bg-1 border border-line rounded-2xl w-fit">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => {
              const count = sev === 'ALL' ? total : alerts.filter(a => a.severity === sev).length
              const isActive = filter === sev
              
              return (
                <button
                  key={sev}
                  onClick={() => setFilter(sev)}
                  className={`mg-btn mg-btn--sm px-5 transition-all ${
                    isActive 
                    ? (sev === 'CRITICAL' ? 'bg-red text-white border-red' : 
                       sev === 'HIGH' ? 'bg-amber text-white border-amber' :
                       sev === 'MEDIUM' ? 'bg-accent text-white border-accent' :
                       'bg-accent text-white border-accent')
                    : 'mg-btn--ghost'
                  }`}
                >
                  {sev} {sev !== 'ALL' && `(${count})`}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="mg-container py-12">
        {/* CDSCO Helpline Banner */}
        <div className="mg-card mb-8 p-6 bg-red-dim border-red/20 border-2">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 rounded-2xl bg-red text-white shadow-lg">
              <span className="text-2xl font-bold">HELPLINE</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-red mb-1">CDSCO Safety: 1800-180-3024</h3>
              <p className="text-text-md text-sm">Official government helpline for reporting suspected fake or substandard medicines.</p>
            </div>
            <a
              href="https://cdsco.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mg-btn mg-btn--primary bg-red border-red hover:bg-red-lo shadow-glow px-8"
            >
              CDSCO Portal
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="mg-card h-32 animate-pulse bg-bg-2" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20 bg-bg-1 rounded-3xl border border-line">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-text-hi">All Clear</h3>
            <p className="text-text-md">No active safety alerts found for the selected criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map(alert => {
              const cfg = severityConfig[alert.severity] || severityConfig.MEDIUM
              const isExpanded = expandedId === alert._id

              return (
                <div
                  key={alert._id}
                  className={`mg-card overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'ring-2 ring-accent border-accent/20' : 'hover:border-line-hi'
                  }`}
                >
                  {/* Alert Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : alert._id)}
                    className="cursor-pointer flex gap-5 items-start p-2"
                  >
                    <div className={`p-3 rounded-xl flex-shrink-0 flex flex-col items-center gap-1 ${
                      alert.severity === 'CRITICAL' ? 'bg-red text-white' : 
                      alert.severity === 'HIGH' ? 'bg-amber text-white' : 
                      'bg-accent text-white'
                    }`}>
                      <span className="text-xl">{cfg.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter">{alert.severity}</span>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-text-hi leading-tight mb-2">
                        {alert.title}
                      </h4>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-[10px] font-bold text-text-lo uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-text-lo" />
                          {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-text-lo uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-text-lo" />
                          {alert.source}
                        </span>
                        {alert.affectedMedicine && (
                          <span className="mg-badge mg-badge--green text-[10px]">
                            {alert.affectedMedicine}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`p-2 rounded-lg bg-bg-2 text-text-lo transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-line space-y-6">
                      <p className="text-text-md leading-relaxed">
                        {alert.description}
                      </p>

                      {alert.actionRequired && (
                        <div className="p-5 rounded-2xl bg-accent-glow border border-accent/20">
                          <h5 className="text-xs font-bold text-accent uppercase tracking-widest mb-2">⚡ Official Instruction</h5>
                          <p className="text-text-hi font-medium">{alert.actionRequired}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {alert.batchNumbers?.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-text-lo uppercase tracking-widest mb-3">Affected Batches</h5>
                            <div className="flex flex-wrap gap-2">
                              {alert.batchNumbers.map((bn, i) => (
                                <span key={i} className="px-3 py-1 bg-red-dim border border-red/20 text-red font-mono text-xs rounded-lg">
                                  {bn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {alert.affectedStates?.length > 0 && (
                          <div>
                            <h5 className="text-[10px] font-bold text-text-lo uppercase tracking-widest mb-3">Regions Impacted</h5>
                            <div className="flex flex-wrap gap-2">
                              {alert.affectedStates.map((state, i) => (
                                <span key={i} className="mg-badge bg-bg-2 border-line text-text-md">
                                  📍 {state}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {alert.sourceUrl && (
                        <div className="pt-4">
                          <a
                            href={alert.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mg-btn mg-btn--ghost w-full justify-center gap-2"
                          >
                            View Official Publication ↗
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
