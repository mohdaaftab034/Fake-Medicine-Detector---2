import React, { useState, useEffect } from 'react'
import { getScanHistory, getScanById } from '../../services/scannerService'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Calendar, ChevronRight, Eye, Trash2, LayoutGrid, List } from 'lucide-react'
import FullReportCard from '../../components/scanner/FullReportCard'
import toast from 'react-hot-toast'

const ScanHistory = () => {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid') // grid or list
  const [selectedScan, setSelectedScan] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({ total: 0, fake: 0, genuine: 0, suspicious: 0 })
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await getScanHistory()
      const history = res.data.scans
      setScans(history)
      
      // Calculate stats
      const s = { total: history.length, fake: 0, genuine: 0, suspicious: 0 }
      history.forEach(scan => {
        if (scan.result === 'FAKE') s.fake++
        else if (scan.result === 'GENUINE') s.genuine++
        else if (scan.result === 'SUSPICIOUS') s.suspicious++
      })
      setStats(s)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load scan history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleViewDetails = async (scanId) => {
    try {
      const res = await getScanById(scanId)
      setSelectedScan(res.data)
      setShowModal(true)
    } catch (err) {
      toast.error('Could not fetch scan details')
    }
  }

  const handleDelete = async (e, scanId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this scan from history?')) return
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/scan/${scanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setScans(prev => prev.filter(s => s._id !== scanId))
      toast.success('Scan deleted')
    } catch (err) {
      toast.error('Delete failed')
    }
  }

  const filteredScans = scans.filter(s => {
    const matchesFilter = filter === 'ALL' || s.result === filter
    const matchesSearch = (s.medicineDetails?.name || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Scan History</h1>
            <p className="text-text-secondary mt-1">Review your past medicine verifications</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-bg-secondary p-4 rounded-2xl border border-border-color min-w-[120px] text-center">
              <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
              <div className="text-[10px] text-text-secondary uppercase font-bold">Total Scans</div>
            </div>
            <div className="bg-danger/10 p-4 rounded-2xl border border-danger/20 min-w-[120px] text-center">
              <div className="text-2xl font-bold text-danger">{stats.fake}</div>
              <div className="text-[10px] text-danger/70 uppercase font-bold">Fake Detected</div>
            </div>
            <div className="bg-success/10 p-4 rounded-2xl border border-success/20 min-w-[120px] text-center">
              <div className="text-2xl font-bold text-success">{stats.genuine}</div>
              <div className="text-[10px] text-success/70 uppercase font-bold">Genuine</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text"
              placeholder="Search by medicine name..."
              className="w-full bg-bg-secondary border border-border-color rounded-xl py-3 px-12 text-text-primary outline-none focus:border-primary transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            {['ALL', 'GENUINE', 'FAKE', 'SUSPICIOUS'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f ? 'bg-primary text-white' : 'bg-bg-secondary text-text-secondary border border-border-color hover:border-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex bg-bg-secondary p-1 rounded-xl border border-border-color">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary'}`}>
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Scan List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredScans.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => (
                <motion.div
                  key={scan._id}
                  whileHover={{ y: -5 }}
                  className="bg-bg-secondary rounded-2xl border border-border-color overflow-hidden group cursor-pointer"
                  onClick={() => handleViewDetails(scan._id)}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img src={scan.imageUrl} alt="Medicine" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-lg ${
                        scan.result === 'GENUINE' ? 'bg-success text-white' : scan.result === 'FAKE' ? 'bg-danger text-white' : 'bg-warning text-white'
                      }`}>
                        {scan.result}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-text-primary text-lg">{scan.medicineDetails?.name || 'Unknown Medicine'}</h3>
                      <button 
                        onClick={(e) => handleDelete(e, scan._id)}
                        className="p-2 text-text-secondary hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Calendar size={14} />
                        {new Date(scan.createdAt).toLocaleDateString()} at {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <div className={`w-2 h-2 rounded-full ${
                          scan.riskLevel === 'LOW' ? 'bg-success' : scan.riskLevel === 'MEDIUM' ? 'bg-warning' : 'bg-danger'
                        }`} />
                        Risk: {scan.riskLevel}
                      </div>
                    </div>
                    <button className="w-full py-3 bg-bg-primary border border-border-color rounded-xl text-sm font-bold text-text-primary hover:border-primary transition-all flex items-center justify-center gap-2">
                      <Eye size={16} /> View Report
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-bg-secondary rounded-2xl border border-border-color overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-primary/50 text-left">
                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Medicine</th>
                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Date</th>
                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Result</th>
                    <th className="p-4 text-xs font-bold text-text-secondary uppercase">Risk</th>
                    <th className="p-4 text-xs font-bold text-text-secondary uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {filteredScans.map((scan) => (
                    <tr 
                      key={scan._id} 
                      className="hover:bg-bg-primary/30 cursor-pointer transition-all"
                      onClick={() => handleViewDetails(scan._id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={scan.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div className="font-bold text-text-primary">{scan.medicineDetails?.name || 'Unknown'}</div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          scan.result === 'GENUINE' ? 'bg-success/20 text-success' : scan.result === 'FAKE' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                        }`}>
                          {scan.result}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-medium ${
                          scan.riskLevel === 'CRITICAL' ? 'text-danger' : scan.riskLevel === 'HIGH' ? 'text-orange-500' : scan.riskLevel === 'MEDIUM' ? 'text-warning' : 'text-success'
                        }`}>
                          {scan.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-text-secondary hover:text-primary"><Eye size={18} /></button>
                          <button 
                            onClick={(e) => handleDelete(e, scan._id)}
                            className="p-2 text-text-secondary hover:text-danger"
                          ><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bg-bg-secondary rounded-2xl border border-border-color p-20 text-center">
            <div className="p-4 rounded-full bg-bg-primary w-fit mx-auto mb-4 border border-border-color text-text-secondary">
              <Search size={40} />
            </div>
            <h2 className="text-xl font-bold text-text-primary">No scans found</h2>
            <p className="text-text-secondary mt-2">Try adjusting your filters or start a new medicine scan.</p>
            <button 
              onClick={() => navigate('/scanner')}
              className="mt-6 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Start Scanning
            </button>
          </div>
        )}

      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedScan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-all"
              >
                ✕
              </button>
              <FullReportCard pipeline={selectedScan.pipeline} scanId={selectedScan._id} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ScanHistory
