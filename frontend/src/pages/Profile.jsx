import { useState, useEffect } from 'react'
import { User, LogOut, Pencil, Mail, Phone, Calendar, ShieldCheck, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import StatusBadge from '../components/ui/StatusBadge'
import { api } from '../utils/api'
import { timeAgo } from '../utils/timeAgo'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ full_name: '', phone_number: '' })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setEditData({ full_name: data.full_name, phone_number: data.phone_number || '' })
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
      const res = await api.put('/profile/update/', editData)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        localStorage.setItem('user_name', data.full_name)
        setEditing(false)
        setToast({ message: 'Profile updated successfully', type: 'success' })
      }
    } catch {
      setToast({ message: 'Update failed', type: 'error' })
    }
  }

  const handleLogout = () => {
    const refresh = localStorage.getItem('refresh_token')
    api.post('/logout/', { refresh })
    localStorage.clear()
    navigate('/login')
  }

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-fade-up">
          <div className="w-32 h-32 rounded-full bg-primary-light flex items-center justify-center text-primary border-4 border-white shadow-card">
            <User size={64} strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="font-heading font-bold text-3xl text-text-primary">{profile.full_name}</h1>
              <span className="px-3 py-1 bg-surface-muted rounded-badge font-mono text-xs font-bold text-text-secondary uppercase">{profile.role}</span>
              {profile.is_email_verified ? <StatusBadge status="VERIFIED" /> : <StatusBadge status="PENDING" />}
            </div>
            <p className="font-body text-text-secondary">{profile.email}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="md:self-start"><LogOut size={18} /> Logout</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-heading font-bold text-xl">Account Details</h2>
                <button onClick={() => setEditing(!editing)} className="text-primary hover:text-primary-dark transition-colors">
                  <Pencil size={20} />
                </button>
              </div>

              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="form-label">Full Name</label>
                    <input type="text" className="input-field" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="input-field" value={editData.phone_number} onChange={e => setEditData({...editData, phone_number: e.target.value})} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" className="flex-1">Save Changes</Button>
                    <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary"><Mail size={18} /></div>
                    <div><p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Email</p><p className="font-body text-text-primary">{profile.email}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary"><Phone size={18} /></div>
                    <div><p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Phone</p><p className="font-body text-text-primary">{profile.phone_number || 'Not provided'}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-secondary"><Calendar size={18} /></div>
                    <div><p className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Joined</p><p className="font-body text-text-primary">{timeAgo(profile.created_at)}</p></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6 bg-primary-light border-primary/10">
              <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-primary"/> Verification</h3>
              <p className="font-body text-sm text-text-secondary mb-4">Verification helps maintain trust in the FoodBridge community.</p>
              {profile.is_email_verified ? (
                <div className="flex items-center gap-2 text-green-700 font-bold text-sm"><ShieldCheck size={16}/> Email Verified</div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-700 font-bold text-sm"><Shield size={16}/> Email Pending</div>
              )}
            </div>
            {profile.role === 'NGO' && (
               <Button onClick={() => navigate('/org/profile')} className="w-full">Manage NGO Profile</Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
