import { useState, useEffect } from 'react'
import { Building2, Pencil, MapPin, ShieldCheck, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import Toast from '../components/ui/Toast'
import { api } from '../utils/api'

export default function OrgProfile() {
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchOrg()
  }, [])

  const fetchOrg = async () => {
    try {
      const res = await api.get('/orgs/my/')
      if (res.ok) {
        const data = await res.json()
        setOrg(data)
        setFormData(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/orgs/update/', formData)
      if (res.ok) {
        const data = await res.json()
        setOrg(data)
        setEditing(false)
        setToast({ message: 'Organization profile updated', type: 'success' })
      }
    } catch {
      setToast({ message: 'Update failed', type: 'error' })
    }
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>
  if (!org) return <Layout><div className="text-center py-20">No organization found.</div></Layout>

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 animate-fade-up">
          <div className="w-20 h-20 rounded-card bg-primary-light flex items-center justify-center text-primary shadow-sm"><Building2 size={40} /></div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-1">
              <h1 className="font-heading font-bold text-3xl text-text-primary">{org.organization_name}</h1>
              <StatusBadge status={org.verification_status} />
            </div>
            <p className="font-body text-text-secondary">Reg: {org.registration_number}</p>
          </div>
          {!editing && <Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={18} /> Edit Profile</Button>}
        </div>

        {org.verification_status === 'REJECTED' && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-card flex items-start gap-4 animate-fade-up">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-heading font-bold text-red-800">Verification Rejected</h3>
              <p className="font-body text-red-700 mt-1">{org.rejection_reason || 'Please contact support for more details.'}</p>
            </div>
          </div>
        )}

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-6 animate-fade-in">
             <div className="card p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="form-label">Organization Name</label>
                  <input type="text" className="input-field" value={formData.organization_name} onChange={e => setFormData({...formData, organization_name: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">City</label>
                  <input type="text" className="input-field" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input type="text" className="input-field" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="form-label">Address</label>
                  <textarea className="textarea-field h-24" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Save Changes</Button>
                  <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
                </div>
             </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
             <div className="md:col-span-2 space-y-6">
                <div className="card p-8">
                  <h2 className="font-heading font-bold text-xl mb-6 flex items-center gap-2"><MapPin size={22} className="text-primary"/> Location Info</h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-1">Address</p>
                      <p className="font-body text-text-primary">{org.address}, {org.city}, {org.state}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-1">Coordinates</p>
                        <p className="font-body text-text-primary text-sm">{org.location_lat}, {org.location_lng}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-1">Service Radius</p>
                        <p className="font-body text-text-primary">{org.service_radius_km} km</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="space-y-6">
               <div className="card p-6 bg-surface-muted">
                 <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-primary"/> Verification Hub</h3>
                 <p className="font-body text-sm text-text-secondary mb-6">Your profile is currently {org.verification_status.toLowerCase()}. You'll be notified via email once our team reviews your documents.</p>
                 <StatusBadge status={org.verification_status} />
               </div>
             </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
