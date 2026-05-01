import React from 'react'

const PipelineProgress = ({ currentStep, stepResults, steps }) => (
  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {steps.map((step, index) => {
      const stepNum = index + 1
      const isDone = currentStep > stepNum
      const isActive = currentStep === stepNum
      const isPending = currentStep < stepNum

      return (
        <div key={step.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: isDone ? 'rgba(6,214,160,0.08)'
            : isActive ? 'rgba(0,180,216,0.08)'
            : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isDone ? 'rgba(6,214,160,0.2)' 
            : isActive ? 'rgba(0,180,216,0.3)' 
            : 'rgba(255,255,255,0.06)'}`,
          transition: 'all 0.3s ease'
        }}>
          {/* Step icon */}
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '50%',
            background: isDone ? '#06D6A0' : isActive ? '#00B4D8' : 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isDone ? '14px' : '16px',
            flexShrink: 0
          }}>
            {isDone ? '✓' : isActive ? (
              <div style={{
                width: '14px', height: '14px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
            ) : step.icon}
          </div>

          {/* Step info */}
          <div style={{ flex: 1 }}>
            <div style={{
              color: isDone ? '#06D6A0' : isActive ? '#00B4D8' : '#6B7280',
              fontWeight: '600', fontSize: '13px'
            }}>
              {step.label}
            </div>
            {isActive && (
              <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>
                {step.description}
              </div>
            )}
            {isDone && stepResults[stepNum] && (
              <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>
                {stepResults[stepNum].summary}
              </div>
            )}
          </div>

          {/* Step badge */}
          {isDone && stepResults[stepNum] && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              background: stepResults[stepNum].alert ? 'rgba(239,35,60,0.15)' : 'rgba(6,214,160,0.15)',
              color: stepResults[stepNum].alert ? '#EF233C' : '#06D6A0'
            }}>
              {stepResults[stepNum].badge}
            </span>
          )}
        </div>
      )
    })}
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
)

export default PipelineProgress
