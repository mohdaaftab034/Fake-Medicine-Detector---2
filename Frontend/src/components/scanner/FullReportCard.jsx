import React from 'react'
import { Link } from 'react-router-dom'

const FullReportCard = ({ pipeline, scanId }) => {
  if (!pipeline) return null
  const { step1_packaging, step2_batch, step3_medicineDb, step4_chemists, finalRiskLevel } = pipeline

  // Read directly from structured fields — no regex needed in frontend
  const fields = step1_packaging.fields || {}
  const medicineName = fields.medicineName || fields.name || 'Not detected'
  const genericName = fields.genericName || 'Not detected'
  const manufacturer = fields.manufacturer || 'Not detected'
  const batchNumber = fields.batchNumber || 'Not visible'
  const expiryDate = fields.expiryDate || 'Not visible'
  const mrp = fields.mrp || 'Not visible'
  const drugLicense = fields.drugLicense || 'Not visible'
  const manufacturerAddress = fields.manufacturerAddress || 'Not visible'
  const requiresPrescription = step1_packaging.fields?.requiresPrescription || false

  // Risk level config
  const riskConfig = {
    CRITICAL: { color: '#EF233C', bg: 'rgba(239,35,60,0.1)', icon: '🚨', label: 'CRITICAL RISK — Do NOT consume' },
    HIGH: { color: '#FF6B35', bg: 'rgba(255,107,53,0.1)', icon: '⛔', label: 'HIGH RISK — Serious concerns detected' },
    MEDIUM: { color: '#FFB703', bg: 'rgba(255,183,3,0.1)', icon: '⚠️', label: 'MEDIUM RISK — Verify before consuming' },
    LOW: { color: '#06D6A0', bg: 'rgba(6,214,160,0.1)', icon: '✅', label: 'LOW RISK — Packaging looks professional' }
  }
  const risk = riskConfig[finalRiskLevel] || riskConfig.MEDIUM

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', color: 'white', maxWidth: '600px', margin: '0 auto' }}>

      {/* Risk Banner */}
      <div style={{
        background: risk.bg,
        border: `1px solid ${risk.color}40`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '28px' }}>{risk.icon}</span>
        <div>
          <div style={{ color: risk.color, fontWeight: '700', fontSize: '16px' }}>
            {risk.label}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>
            Confidence: {step1_packaging.confidence}%
          </div>
        </div>
      </div>

      {/* Medicine Identity Card */}
      <div style={{
        background: 'rgba(17, 24, 39, 0.8)',
        border: '1px solid rgba(31, 41, 55, 1)',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>💊</span>
          <span style={{ color: '#F8F9FA', fontWeight: '700', fontSize: '15px' }}>
            {medicineName}
          </span>
          {requiresPrescription && (
            <span style={{
              padding: '2px 8px',
              background: 'rgba(239,35,60,0.15)',
              color: '#EF233C',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600'
            }}>Rx Only</span>
          )}
          {!requiresPrescription && medicineName !== 'Not detected' && (
            <span style={{
              padding: '2px 8px',
              background: 'rgba(6,214,160,0.15)',
              color: '#06D6A0',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600'
            }}>OTC</span>
          )}
        </div>

        {genericName !== 'Not detected' && (
          <div style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '12px', fontStyle: 'italic' }}>
            {genericName}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Manufacturer', value: manufacturer, icon: '🏭' },
            { label: 'Drug License', value: drugLicense, icon: '📄' },
            { label: 'Batch Number', value: batchNumber, icon: '🔢' },
            { label: 'Expiry Date', value: expiryDate, icon: '📅' },
            { label: 'MRP', value: mrp, icon: '💰' },
            { label: 'Category', value: fields.category || 'Not detected', icon: '🏷️' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '8px 10px'
            }}>
              <div style={{ color: '#6B7280', fontSize: '11px', marginBottom: '2px' }}>
                {item.icon} {item.label}
              </div>
              <div style={{
                color: item.value === 'Not visible' || item.value === 'Not detected'
                  ? '#4B5563' : '#F8F9FA',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {manufacturerAddress !== 'Not visible' && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '8px 10px'
          }}>
            <div style={{ color: '#6B7280', fontSize: '11px', marginBottom: '2px' }}>
              📍 Manufacturer Address
            </div>
            <div style={{ color: '#F8F9FA', fontSize: '13px' }}>
              {manufacturerAddress}
            </div>
          </div>
        )}
      </div>

      {/* Batch Verification Result */}
      <div style={{
        background: step2_batch.status === 'RECALLED'
          ? 'rgba(239,35,60,0.08)'
          : step2_batch.status === 'NOT_IN_RECALLED_LIST'
          ? 'rgba(6,214,160,0.05)'
          : 'rgba(255,183,3,0.05)',
        border: `1px solid ${step2_batch.status === 'RECALLED'
          ? 'rgba(239,35,60,0.3)'
          : step2_batch.status === 'NOT_IN_RECALLED_LIST'
          ? 'rgba(6,214,160,0.2)'
          : 'rgba(255,183,3,0.2)'}`,
        borderRadius: '12px',
        padding: '14px'
      }}>
        <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: '#F8F9FA' }}>
          📋 Batch Verification
        </div>

        {step2_batch.status === 'RECALLED' && (
          <div>
            <div style={{ color: '#EF233C', fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>
              🚨 THIS BATCH HAS BEEN RECALLED
            </div>
            <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.6' }}>
              <div>Medicine: {step2_batch.medicine}</div>
              <div>Reason: {step2_batch.recallReason}</div>
              <div>Authority: {step2_batch.recallAuthority}</div>
              <div>Affected States: {step2_batch.affectedStates?.join(', ')}</div>
              <div style={{ marginTop: '8px', color: '#EF233C', fontWeight: '600' }}>
                Do NOT consume. Return to chemist immediately.
              </div>
              <div>Helpline: 1800-180-3024</div>
            </div>
          </div>
        )}

        {step2_batch.status === 'NOT_IN_RECALLED_LIST' && (
          <div>
            <div style={{ color: '#06D6A0', fontWeight: '600', fontSize: '13px' }}>
              ✅ Batch {step2_batch.batchNumber} not found in recalled list
            </div>
            <div style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
              Note: Not being in recalled list does not guarantee medicine is genuine.
            </div>
          </div>
        )}

        {step2_batch.status === 'NOT_DETECTED' && (
          <div>
            <div style={{ color: '#FFB703', fontWeight: '600', fontSize: '13px' }}>
              ⚠️ Batch number not visible in image
            </div>
            <div style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
              Enter batch number manually in Batch Verify page for verification.
            </div>
          </div>
        )}
      </div>

      {/* Medicine Database Info */}
      {step3_medicineDb.found && step3_medicineDb.details && (
        <div style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(31, 41, 55, 1)',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: '#F8F9FA' }}>
            📚 Medicine Database Info
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              background: 'rgba(0,180,216,0.15)',
              color: '#00B4D8',
              borderRadius: '20px',
              fontSize: '11px'
            }}>
              {step3_medicineDb.source}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {step3_medicineDb.details.indications && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px 10px' }}>
                <div style={{ color: '#6B7280', fontSize: '11px' }}>Used For</div>
                <div style={{ color: '#F8F9FA', fontSize: '13px', marginTop: '2px' }}>
                  {step3_medicineDb.details.indications}
                </div>
              </div>
            )}
            {step3_medicineDb.details.warnings && (
              <div style={{ background: 'rgba(255,183,3,0.05)', borderRadius: '8px', padding: '8px 10px', border: '1px solid rgba(255,183,3,0.1)' }}>
                <div style={{ color: '#FFB703', fontSize: '11px' }}>⚠️ Warnings</div>
                <div style={{ color: '#F8F9FA', fontSize: '13px', marginTop: '2px' }}>
                  {step3_medicineDb.details.warnings}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby Chemists */}
      {step4_chemists?.length > 0 && (
        <div style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(31, 41, 55, 1)',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: '#F8F9FA' }}>
            🏪 Verified Chemists Nearby
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {step4_chemists.map((chemist, i) => (
              <div key={i} style={{
                background: 'rgba(6,214,160,0.05)',
                border: '1px solid rgba(6,214,160,0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#F8F9FA', fontWeight: '600', fontSize: '13px' }}>
                    {chemist.shopName}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px' }}>
                    {chemist.address}, {chemist.city}
                  </div>
                </div>
                <button
                  onClick={() => window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${chemist.coordinates?.lat},${chemist.coordinates?.lng}`,
                    '_blank'
                  )}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(6,214,160,0.15)',
                    border: '1px solid rgba(6,214,160,0.3)',
                    borderRadius: '6px',
                    color: '#06D6A0',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📍 Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {step1_packaging.redFlags?.length > 0 && (
        <div style={{
          background: 'rgba(239,35,60,0.05)',
          border: '1px solid rgba(239,35,60,0.2)',
          borderRadius: '12px',
          padding: '14px'
        }}>
          <div style={{ color: '#EF233C', fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>
            🚩 Visual Red Flags Detected
          </div>
          {step1_packaging.redFlags.map((flag, i) => (
            <div key={i} style={{ color: '#9CA3AF', fontSize: '13px', padding: '3px 0' }}>
              • {flag}
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(255,183,3,0.05)',
        border: '1px solid rgba(255,183,3,0.15)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex', gap: '8px'
      }}>
        <span>⚠️</span>
        <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.5' }}>
          <strong style={{ color: '#FFB703' }}>Disclaimer: </strong>
          AI packaging analysis cannot confirm medicine contents are genuine.
          Always verify batch number and purchase from verified chemists for maximum safety.
          Helpline: 1800-180-3024
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => window.location.href = `/batch-verify?batch=${encodeURIComponent(batchNumber)}`}
          style={{ flex: 1, minWidth: '130px', padding: '10px', background: 'rgba(0,180,216,0.15)', border: '1px solid rgba(0,180,216,0.4)', borderRadius: '8px', color: '#00B4D8', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          🔍 Verify Batch
        </button>
        <button onClick={() => window.location.href = '/find-chemist'}
          style={{ flex: 1, minWidth: '130px', padding: '10px', background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.4)', borderRadius: '8px', color: '#06D6A0', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          🏪 Find Chemist
        </button>
        <button onClick={() => window.location.href = `/medicine-info?search=${encodeURIComponent(medicineName)}`}
          style={{ flex: 1, minWidth: '130px', padding: '10px', background: 'rgba(255,183,3,0.15)', border: '1px solid rgba(255,183,3,0.4)', borderRadius: '8px', color: '#FFB703', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          📚 Medicine Info
        </button>
      </div>

    </div>
  )
}

export default FullReportCard
