import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AnalysisReportCard = ({ text, status, confidence }) => {
  const navigate = useNavigate()
  const [showFull, setShowFull] = useState(false)

  // Parse sections from text
  const parseSection = (text, ...keywords) => {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*([\\s\\S]*?)(?=MEDICINE DETAILS|VISUAL RED FLAGS|IMPORTANT NOTE|PACKAGING ANALYSIS|OVERALL STATUS|MANDATORY FIELDS|$)`, 'i')
      const match = text.match(regex)
      if (match?.[1]?.trim()) return match[1].trim()
    }
    return null
  }

  const medicineName = text.match(/Medicine Name[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not detected'
  const manufacturer = text.match(/Manufacturer[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not detected'
  const batchNumber = text.match(/Batch Number[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not visible'
  const expiryDate = text.match(/Expiry Date[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not visible'
  const mrp = text.match(/MRP[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not visible'
  const drugLicense = text.match(/Drug License[^\n:]*[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not visible'
  const manufacturerAddress = text.match(/Manufacturer Address[:\s]*([^\n]+)/i)?.[1]?.trim() || 'Not visible'
  const redFlags = text.match(/VISUAL RED FLAGS[:\s]*([^\n]+(?:\n(?!IMPORTANT|PACKAGING|MEDICINE|OVERALL)[^\n]+)*)/i)?.[1]?.trim() || 'None detected'
  const confidence_val = text.match(/Confidence[:\s]*(\d+)%/i)?.[1] || confidence || '0'

  // Status config
  const statusConfig = {
    GENUINE: { 
      color: '#06D6A0', 
      bg: 'rgba(6,214,160,0.1)', 
      border: 'rgba(6,214,160,0.3)',
      icon: '✅', 
      label: 'Packaging Looks Professional',
      textColor: '#06D6A0'
    },
    FAKE: { 
      color: '#EF233C', 
      bg: 'rgba(239,35,60,0.1)', 
      border: 'rgba(239,35,60,0.3)',
      icon: '🚨', 
      label: 'Packaging Issues Detected',
      textColor: '#EF233C'
    },
    SUSPICIOUS: { 
      color: '#FFB703', 
      bg: 'rgba(255,183,3,0.1)', 
      border: 'rgba(255,183,3,0.3)',
      icon: '⚠️', 
      label: 'Suspicious Packaging',
      textColor: '#FFB703'
    }
  }

  const cfg = statusConfig[status] || statusConfig.SUSPICIOUS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '100%', marginBottom: '15px' }}>

      {/* Header Status Card */}
      <div style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>{cfg.icon}</span>
          <div>
            <div style={{ color: cfg.textColor, fontWeight: '700', fontSize: '16px' }}>
              {cfg.label}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Visual packaging inspection result
            </div>
          </div>
        </div>
        {/* Confidence Circle */}
        <div style={{
          width: '60px', height: '60px',
          borderRadius: '50%',
          background: `conic-gradient(${cfg.color} ${confidence_val * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '46px', height: '46px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ color: cfg.color, fontWeight: '700', fontSize: '13px', lineHeight: 1 }}>
              {confidence_val}%
            </span>
          </div>
        </div>
      </div>

      {/* Medicine Details Card */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          💊 Medicine Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Medicine Name', value: medicineName, full: true },
            { label: 'Manufacturer', value: manufacturer, full: true },
            { label: 'Batch Number', value: batchNumber },
            { label: 'Expiry Date', value: expiryDate },
            { label: 'MRP', value: mrp },
            { label: 'Drug License', value: drugLicense },
          ].map((item, i) => (
            <div key={i} style={{
              gridColumn: item.full ? '1 / -1' : 'auto',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '8px 10px'
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div style={{
                color: item.value === 'Not visible' || item.value === 'Not detected'
                  ? '#6B7280'
                  : 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '500',
                wordBreak: 'break-word'
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Fields Checklist */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '14px'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', marginBottom: '10px' }}>
          📋 Mandatory Fields Check
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'Medicine Name', value: medicineName },
            { label: 'Manufacturer', value: manufacturer },
            { label: 'Batch Number', value: batchNumber },
            { label: 'Expiry Date', value: expiryDate },
            { label: 'MRP', value: mrp },
            { label: 'Drug License No', value: drugLicense },
            { label: 'Manufacturer Address', value: manufacturerAddress },
          ].map((item, i) => {
            const isVisible = item.value && item.value !== 'Not visible' && item.value !== 'Not detected'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 8px',
                borderRadius: '6px',
                background: isVisible ? 'rgba(6,214,160,0.05)' : 'rgba(239,35,60,0.05)'
              }}>
                <span style={{ fontSize: '14px' }}>{isVisible ? '✅' : '❌'}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', flex: 1 }}>
                  {item.label}
                </span>
                <span style={{
                  color: isVisible ? '#06D6A0' : '#EF233C',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {isVisible ? 'Found' : 'Not Visible'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Red Flags */}
      <div style={{
        background: redFlags === 'None detected' || redFlags.toLowerCase().includes('no visual')
          ? 'rgba(6,214,160,0.05)'
          : 'rgba(239,35,60,0.05)',
        border: `1px solid ${redFlags === 'None detected' || redFlags.toLowerCase().includes('no visual')
          ? 'rgba(6,214,160,0.2)'
          : 'rgba(239,35,60,0.2)'}`,
        borderRadius: '12px',
        padding: '14px'
      }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', marginBottom: '6px' }}>
          🚩 Visual Red Flags
        </div>
        <div style={{
          color: redFlags === 'None detected' || redFlags.toLowerCase().includes('no visual')
            ? '#06D6A0'
            : '#EF233C',
          fontSize: '13px'
        }}>
          {redFlags}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(255,183,3,0.05)',
        border: '1px solid rgba(255,183,3,0.2)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: '16px' }}>⚠️</span>
        <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.5' }}>
          <strong style={{ color: '#FFB703' }}>Important: </strong>
          AI packaging analysis cannot confirm if medicine contents are genuine. 
          Always verify batch number and purchase from verified chemists for maximum safety.
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            if (batchNumber && batchNumber !== 'Not visible') {
              navigate(`/batch-verify`, { state: { batchNumber } })
            } else {
              navigate('/batch-verify')
            }
          }}
          style={{
            flex: 1, minWidth: '140px',
            padding: '10px 16px',
            background: 'rgba(0,180,216,0.15)',
            border: '1px solid rgba(0,180,216,0.4)',
            borderRadius: '8px',
            color: '#00B4D8',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔍 Verify Batch Number
        </button>
        <button
          onClick={() => navigate('/nearby-chemist')}
          style={{
            flex: 1, minWidth: '140px',
            padding: '10px 16px',
            background: 'rgba(6,214,160,0.15)',
            border: '1px solid rgba(6,214,160,0.4)',
            borderRadius: '8px',
            color: '#06D6A0',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🏪 Find Verified Chemist
        </button>
      </div>

    </div>
  )
}

export default AnalysisReportCard
