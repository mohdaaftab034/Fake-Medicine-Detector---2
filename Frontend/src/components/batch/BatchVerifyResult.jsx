import React from 'react'

const BatchVerifyResult = ({ result }) => {
  if (!result) return null

  const isRecalled = result.status === 'RECALLED'
  const isInvestigation = result.status === 'UNDER_INVESTIGATION'
  const isNotListed = result.status === 'NOT_IN_RECALLED_LIST'

  const config = isRecalled
    ? { color: '#EF233C', bg: 'rgba(239,35,60,0.08)', border: 'rgba(239,35,60,0.3)', icon: '🚨', title: 'BATCH RECALLED' }
    : isInvestigation
    ? { color: '#FFB703', bg: 'rgba(255,183,3,0.08)', border: 'rgba(255,183,3,0.3)', icon: '⚠️', title: 'UNDER INVESTIGATION' }
    : { color: '#06D6A0', bg: 'rgba(6,214,160,0.08)', border: 'rgba(6,214,160,0.3)', icon: '✅', title: 'NOT IN RECALLED LIST' }

  return (
    <div style={{ maxWidth: '600px', margin: '24px auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Status Banner */}
      <div style={{
        background: config.bg, border: `2px solid ${config.border}`,
        borderRadius: '16px', padding: '20px',
        display: 'flex', alignItems: 'center', gap: '16px',
        backdropFilter: 'blur(10px)'
      }}>
        <span style={{ fontSize: '40px' }}>{config.icon}</span>
        <div>
          <div style={{ color: config.color, fontWeight: '800', fontSize: '20px' }}>
            {config.title}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px' }}>
            Batch Number: <strong style={{ color: '#F8F9FA', fontFamily: 'monospace' }}>
              {result.batchNumber}
            </strong>
          </div>
        </div>
      </div>

      {/* Recall Details */}
      {isRecalled && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(239,35,60,0.2)',
          borderRadius: '12px', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '10px'
        }}>
          {[
            { label: '💊 Medicine', value: result.medicine },
            { label: '🏭 Manufacturer', value: result.manufacturer },
            { label: '📅 Recall Date', value: result.recallDate },
            { label: '⚡ Reason', value: result.recallReason },
            { label: '🏛️ Authority', value: result.recallAuthority },
            { label: '🔴 Severity', value: result.severity },
          ].map((item, i) => item.value && (
            <div key={i} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ color: '#6B7280', fontSize: '13px', minWidth: '140px' }}>{item.label}</span>
              <span style={{ color: '#F8F9FA', fontSize: '13px', fontWeight: '500' }}>{item.value}</span>
            </div>
          ))}

          {result.affectedStates?.length > 0 && (
            <div>
              <div style={{ color: '#6B7280', fontSize: '13px', marginBottom: '6px' }}>📍 Affected States:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {result.affectedStates.map((s, i) => (
                  <span key={i} style={{
                    padding: '3px 10px', background: 'rgba(255,183,3,0.1)',
                    borderRadius: '20px', color: '#FFB703', fontSize: '12px'
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{
            marginTop: '8px', padding: '12px',
            background: 'rgba(239,35,60,0.1)', borderRadius: '8px',
            color: '#EF233C', fontWeight: '700', fontSize: '14px', textAlign: 'center'
          }}>
            ⛔ DO NOT CONSUME — Return to chemist immediately
          </div>
        </div>
      )}

      {/* Not Listed Message */}
      {isNotListed && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(6,214,160,0.2)',
          borderRadius: '12px', padding: '16px'
        }}>
          <div style={{ color: '#06D6A0', fontWeight: '600', marginBottom: '8px' }}>
            ✅ Batch {result.batchNumber} is not in our recalled medicines database
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.6' }}>
            This means no government authority has officially recalled this batch yet.
            However, this does not guarantee the medicine is genuine.
            Always purchase from verified chemists and check packaging carefully.
          </div>
        </div>
      )}

      {/* Helpline */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '14px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>📞</span>
        <div>
          <div style={{ color: '#F8F9FA', fontWeight: '600', fontSize: '14px' }}>
            CDSCO Helpline: 1800-180-3024
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
            Report fake medicines or get drug safety information
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={() => window.location.href = '/scanner'}
          style={{ flex: 1, padding: '12px', background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.4)', borderRadius: '10px', color: '#00B4D8', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          🔍 Scan Medicine Image
        </button>
        <button onClick={() => window.location.href = '/find-chemist'}
          style={{ flex: 1, padding: '12px', background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.4)', borderRadius: '10px', color: '#06D6A0', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
          🏪 Find Verified Chemist
        </button>
      </div>
    </div>
  )
}

export default BatchVerifyResult
