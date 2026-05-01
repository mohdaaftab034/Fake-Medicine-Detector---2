import React, { useState, useEffect } from 'react'
import api from '../../services/api.js'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Search, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  FileText,
  Bell
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function UserDashboard() {
  const [recentScans, setRecentScans] = useState([])
  const [totalScans, setTotalScans] = useState(0)
  const [myReports, setMyReports] = useState([])
  const [totalReports, setTotalReports] = useState(0)
  const [activeAlerts, setActiveAlerts] = useState([])
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [scansRes, reportsRes, alertsRes, notifRes] = await Promise.allSettled([
        api.get('/scan/history?limit=5'),
        api.get('/reports/my-reports?limit=5'),
        api.get('/alerts?limit=3&severity=CRITICAL'),
        api.get('/alerts/unread/count')
      ])

      if (scansRes.status === 'fulfilled') {
        const data = scansRes.value.data?.data
        setRecentScans(data?.scans || [])
        setTotalScans(data?.total || 0)
      }
      if (reportsRes.status === 'fulfilled') {
        // Handle if backend returns { reports, total } or just array
        const resData = reportsRes.value.data?.data
        if (Array.isArray(resData)) {
          setMyReports(resData)
          setTotalReports(resData.length)
        } else {
          setMyReports(resData?.reports || [])
          setTotalReports(resData?.total || 0)
        }
      }
      if (alertsRes.status === 'fulfilled') {
        setActiveAlerts(alertsRes.value.data?.data?.alerts || [])
      }
      if (notifRes.status === 'fulfilled') {
        setUnreadAlerts(notifRes.value.data?.data?.count || 0)
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      toast.error('Failed to load some dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Total Scans', value: totalScans, icon: Activity, color: '#00B4D8' },
    { label: 'Fake Detected', value: recentScans.filter(s => s.result === 'FAKE' || s.riskLevel === 'CRITICAL').length, icon: ShieldCheck, color: '#EF233C' },
    { label: 'Reports Filed', value: totalReports, icon: FileText, color: '#FFB703' },
    { label: 'Unread Alerts', value: unreadAlerts, icon: Bell, color: '#06D6A0' }
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#F8F9FA' }}>User Dashboard</h1>
        <p style={{ color: '#9CA3AF', marginTop: '4px' }}>Welcome back to MediGuard. Stay safe with real-time medicine verification.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ 
              width: '48px', height: '48px', 
              borderRadius: '12px', 
              background: `${stat.color}15`, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color
            }}>
              <stat.icon size={24} />
            </div>
            <div>
              <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
              <div style={{ color: '#F8F9FA', fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Recent Scans */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F9FA' }}>Recent Scan History</h3>
            <button onClick={() => navigate('/dashboard/user/history')} style={{ background: 'transparent', border: 'none', color: '#00B4D8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentScans.length > 0 ? recentScans.map((scan, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={scan.imageUrl} alt="Medicine" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#F8F9FA', fontWeight: '600', fontSize: '14px' }}>{scan.medicineDetails?.name || 'Unknown Medicine'}</div>
                  <div style={{ color: '#6B7280', fontSize: '11px' }}>{new Date(scan.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  background: scan.result === 'GENUINE' ? 'rgba(6,214,160,0.1)' : 'rgba(239,35,60,0.1)',
                  color: scan.result === 'GENUINE' ? '#06D6A0' : '#EF233C',
                  fontSize: '10px', fontWeight: '700'
                }}>
                  {scan.result}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontSize: '14px' }}>No scans yet</div>
            )}
          </div>
        </div>

        {/* My Reports */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F8F9FA' }}>My Reports</h3>
            <button onClick={() => navigate('/report-fake')} style={{ background: 'transparent', border: 'none', color: '#00B4D8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              New Report <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myReports.length > 0 ? myReports.map((report, i) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ color: '#F8F9FA', fontWeight: '600', fontSize: '14px' }}>{report.medicineName}</div>
                  <div style={{ 
                    padding: '2px 8px', borderRadius: '4px', 
                    background: report.status === 'CONFIRMED' ? 'rgba(239,35,60,0.1)' : 'rgba(0,180,216,0.1)',
                    color: report.status === 'CONFIRMED' ? '#EF233C' : '#00B4D8',
                    fontSize: '10px', fontWeight: '700'
                  }}>
                    {report.status}
                  </div>
                </div>
                <div style={{ color: '#6B7280', fontSize: '11px' }}>Report ID: {report.caseId || i + 1001} | {new Date(report.createdAt).toLocaleDateString()}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontSize: '14px' }}>No reports filed</div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts and Quick Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Active Critical Alerts */}
        <div style={{ background: 'rgba(239,35,60,0.05)', border: '1px solid rgba(239,35,60,0.2)', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#EF233C', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Critical Safety Alerts
            </h3>
            <button onClick={() => navigate('/alerts')} style={{ background: 'transparent', border: 'none', color: '#EF233C', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
              View All Alerts
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeAlerts.length > 0 ? activeAlerts.map((alert, i) => (
              <div key={i} style={{ padding: '14px', background: 'rgba(239,35,60,0.05)', borderRadius: '12px', border: '1px solid rgba(239,35,60,0.1)' }}>
                <div style={{ color: '#F8F9FA', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{alert.title}</div>
                <div style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: '1.4' }}>{alert.description.substring(0, 100)}...</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                  <span style={{ fontSize: '10px', color: '#EF233C', fontWeight: '700' }}>⚠️ {alert.severity}</span>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>🏛️ {alert.source}</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontSize: '14px' }}>No active critical alerts</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Scan Medicine', icon: Zap, route: '/scanner', color: '#00B4D8' },
            { label: 'Verify Batch', icon: ShieldCheck, route: '/batch-verify', color: '#06D6A0' },
            { label: 'Find Chemist', icon: MapPin, route: '/nearby-chemist', color: '#FFB703' },
            { label: 'Report Fake', icon: AlertTriangle, route: '/report-fake', color: '#EF233C' }
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.route)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ color: action.color }}><action.icon size={28} /></div>
              <div style={{ color: '#F8F9FA', fontSize: '13px', fontWeight: '700' }}>{action.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

    </div>
  )
}
