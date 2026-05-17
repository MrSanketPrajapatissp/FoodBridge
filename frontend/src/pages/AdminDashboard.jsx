import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { BarChart3, ShieldCheck, Mail, CheckCircle2, UtensilsCrossed, XCircle, Phone, MapPin, AlertTriangle } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingNgos, setPendingNgos] = useState([])
  const [emailLogs, setEmailLogs] = useState([])
  const [view, setView] = useState('stats') // stats | ngos | emails

  useEffect(() => {
    fetchStats()
    fetchNgos()
    fetchEmails()
  }, [])

  const fetchStats = async () => {
    const res = await api.get('/admin/stats/')
    if (res) setStats(await res.json())
  }
  const fetchNgos = async () => {
    const res = await api.get('/admin/ngos/pending/')
    if (res) setPendingNgos(await res.json())
  }
  const fetchEmails = async () => {
    const res = await api.get('/admin/email-logs/')
    if (res) setEmailLogs(await res.json())
  }

  const handleVerify = async (id) => {
    const res = await api.post(`/admin/ngos/${id}/verify/`, {})
    if (res && res.status === 200) fetchNgos()
  }

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return
    const res = await api.post(`/admin/ngos/${id}/reject/`, { rejection_reason: reason })
    if (res && res.status === 200) fetchNgos()
  }

  const renderStats = () => {
    if (!stats) return null
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
        <div className="rounded-card shadow-card bg-white p-6 relative overflow-hidden">
          <UtensilsCrossed className="absolute top-4 right-4 size-12 text-primary/10" />
          <h3 className="font-mono text-xs uppercase tracking-wide text-text-muted mb-2">Total Donations</h3>
          <p className="font-heading font-extrabold text-4xl text-primary">{stats.total_donations}</p>
        </div>
        <div className="rounded-card shadow-card bg-white p-6 relative overflow-hidden">
          <CheckCircle2 className="absolute top-4 right-4 size-12 text-primary/10" />
          <h3 className="font-mono text-xs uppercase tracking-wide text-text-muted mb-2">Total Picked Up</h3>
          <p className="font-heading font-extrabold text-4xl text-primary">{stats.total_picked_up}</p>
        </div>
        <div className="rounded-card shadow-card bg-white p-6 relative overflow-hidden">
          <BarChart3 className="absolute top-4 right-4 size-12 text-primary/10" />
          <h3 className="font-mono text-xs uppercase tracking-wide text-text-muted mb-2">Pickup Success Rate</h3>
          <p className="font-heading font-extrabold text-4xl text-primary">{stats.pickup_success_rate.toFixed(1)}%</p>
        </div>
      </div>
    )
  }

  const renderNgos = () => {
    if (pendingNgos.length === 0) return (
      <div className="text-center py-12 rounded-card border-2 border-dashed border-surface-border animate-fade-in">
        <ShieldCheck className="size-12 mx-auto text-primary-dark mb-4" />
        <h3 className="font-heading font-bold text-xl">All caught up! No pending NGOs.</h3>
      </div>
    )
    return (
      <div className="space-y-6 animate-fade-up">
        {pendingNgos.map(ngo => (
          <div key={ngo.id} className="rounded-card shadow-card bg-white overflow-hidden">

            {/* Header Section */}
            <div className="p-6 border-b border-surface-border">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-xl text-text-primary">{ngo.organization_name}</h3>
                  <p className="font-body text-sm text-text-secondary mt-1">
                    Reg: {ngo.registration_number} • {ngo.city}, {ngo.state}
                  </p>
                  {ngo.address && (
                    <p className="font-body text-xs text-text-muted mt-1 flex items-center gap-1">
                      <MapPin className="size-3 flex-shrink-0" /> {ngo.address}
                    </p>
                  )}
                  {ngo.service_radius_km && (
                    <span className="inline-block mt-1 font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-badge">
                      {ngo.service_radius_km} km radius
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleVerify(ngo.id)} className="rounded-button bg-primary text-white font-heading font-bold py-2 px-5 hover:bg-primary-dark transition-colors">Approve</button>
                  <button onClick={() => handleReject(ngo.id)} className="rounded-button border-2 border-red-500 text-red-500 font-heading font-bold py-2 px-5 hover:bg-red-500 hover:text-white transition-colors">Reject</button>
                </div>
              </div>
            </div>

            {/* Contact & Verification Details */}
            <div className="p-5 bg-surface-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Contact Person */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-body">Contact Person</p>
                    <p className="font-heading font-bold text-sm text-text-primary">{ngo.user_name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-body">Email</p>
                    <p className="font-heading font-bold text-sm text-text-primary truncate max-w-[180px]">{ngo.user_email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-body">Phone</p>
                    <p className="font-heading font-bold text-sm text-text-primary">
                      {ngo.user_phone !== 'Not provided' ? `+91 ${ngo.user_phone}` : 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Applied Date */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-body">Applied</p>
                    <p className="font-heading font-bold text-sm text-text-primary">{new Date(ngo.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Verification Status Badges */}
              <div className="mt-4 pt-3 border-t border-surface-border flex flex-wrap items-center gap-3">
                {/* Email Verified Badge */}
                {ngo.is_email_verified ? (
                  <span className="flex items-center gap-1.5 bg-green-50 text-green-700 font-mono text-xs font-bold px-3 py-1.5 rounded-badge border border-green-200">
                    <CheckCircle2 className="size-3.5" /> Email Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-red-50 text-red-600 font-mono text-xs font-bold px-3 py-1.5 rounded-badge border border-red-200">
                    <XCircle className="size-3.5" /> Email Not Verified
                  </span>
                )}

                {/* Phone Provided Badge */}
                {ngo.is_phone_provided ? (
                  <span className="flex items-center gap-1.5 bg-green-50 text-green-700 font-mono text-xs font-bold px-3 py-1.5 rounded-badge border border-green-200">
                    <CheckCircle2 className="size-3.5" /> Phone Provided
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 font-mono text-xs font-bold px-3 py-1.5 rounded-badge border border-amber-200">
                    <AlertTriangle className="size-3.5" /> Phone Not Provided
                  </span>
                )}

                {/* Auto-approve hint */}
                {ngo.is_email_verified && (
                  <span className="flex items-center gap-1.5 text-xs text-text-muted font-body italic ml-auto">
                    <AlertTriangle className="size-3" /> Email is verified — this NGO should have been auto-approved. Click Approve to fix.
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    )
  }

  const renderEmails = () => {
    return (
      <div className="rounded-card shadow-card overflow-hidden border border-surface-border bg-white animate-fade-up">
        <table className="w-full text-left">
          <thead className="bg-surface-muted border-b border-surface-border">
            <tr>
              <th className="font-mono text-xs uppercase tracking-wide px-6 py-4">Status</th>
              <th className="font-mono text-xs uppercase tracking-wide px-6 py-4">Recipient</th>
              <th className="font-mono text-xs uppercase tracking-wide px-6 py-4">Subject</th>
              <th className="font-mono text-xs uppercase tracking-wide px-6 py-4">Error</th>
              <th className="font-mono text-xs uppercase tracking-wide px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.map(log => (
              // Each row shows one email attempt — SENT (green) or FAILED (red with reason)
              <tr key={log.id} className="border-b border-surface-border last:border-0 hover:bg-surface-muted transition-colors font-body text-sm">

                {/* Status badge: green for success, red for failure */}
                <td className="px-6 py-4">
                  {log.status === 'SENT' ? (
                    <span className="bg-green-50 text-green-700 font-mono text-xs uppercase rounded-badge px-2 py-1">SENT</span>
                  ) : (
                    <span className="bg-red-50 text-red-700 font-mono text-xs uppercase rounded-badge px-2 py-1">FAILED</span>
                  )}
                </td>

                <td className="px-6 py-4">{log.recipient_email}</td>
                <td className="px-6 py-4 max-w-xs truncate">{log.subject}</td>

                {/* Error column: shows the exact SMTP/email error reason when status is FAILED */}
                <td className="px-6 py-4">
                  {log.error_message ? (
                    <span
                      className="text-red-600 font-mono text-xs bg-red-50 px-2 py-1 rounded block max-w-xs truncate"
                      title={log.error_message}  // Full error on hover
                    >
                      {log.error_message}
                    </span>
                  ) : (
                    <span className="text-green-600 font-mono text-xs">—</span>
                  )}
                </td>

                <td className="px-6 py-4 font-mono text-xs text-text-muted">
                  {new Date(log.sent_at).toLocaleString()}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="font-heading font-bold text-3xl text-primary flex items-center">
            {view === 'stats' && <BarChart3 className="mr-3 size-8" />}
            {view === 'ngos' && <ShieldCheck className="mr-3 size-8" />}
            {view === 'emails' && <Mail className="mr-3 size-8" />}
            Admin Dashboard
          </h1>
          <button onClick={() => {
            localStorage.clear()
            window.location.href = '/foodbridgeapplication/admin'
          }} className="font-body text-sm text-text-secondary hover:text-red-500">
            Sign Out
          </button>
        </header>

        <div className="flex space-x-4 mb-8">
          <button onClick={() => setView('stats')} className={`rounded-button font-heading font-bold py-2 px-6 ${view === 'stats' ? 'bg-primary text-white shadow-button' : 'border-2 border-primary text-primary hover:bg-primary-light'}`}>Overview</button>
          <button onClick={() => setView('ngos')} className={`rounded-button font-heading font-bold py-2 px-6 ${view === 'ngos' ? 'bg-primary text-white shadow-button' : 'border-2 border-primary text-primary hover:bg-primary-light'}`}>Pending NGOs</button>
          <button onClick={() => setView('emails')} className={`rounded-button font-heading font-bold py-2 px-6 ${view === 'emails' ? 'bg-primary text-white shadow-button' : 'border-2 border-primary text-primary hover:bg-primary-light'}`}>Email Logs</button>
        </div>

        {view === 'stats' && renderStats()}
        {view === 'ngos' && renderNgos()}
        {view === 'emails' && renderEmails()}
      </div>
    </div>
  )
}
