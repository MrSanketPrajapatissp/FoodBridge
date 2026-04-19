import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building2, Mail, Lock, UserCircle } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { api } from '../utils/api'

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('DONOR')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/register/', { ...formData, role })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('user_role', data.user.role)
        localStorage.setItem('user_name', data.user.full_name)
        localStorage.setItem('user_email', data.user.email)
        localStorage.setItem('user_id', data.user.id)
        
        setToast({ message: 'Registration successful! Verification email sent.', type: 'success' })
        setTimeout(() => navigate(data.redirect_to_org ? '/org/create' : '/profile'), 1500)
      } else {
        const err = await res.json()
        setToast({ message: Object.values(err)[0][0] || 'Registration failed', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-md mx-auto py-12 px-6 animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-3xl text-text-primary mb-2">Create Account</h1>
          <p className="font-body text-text-secondary">Join FoodBridge and help reduce food waste</p>
        </div>

        <div className="flex p-1 bg-surface-muted rounded-button mb-8">
          <button onClick={() => setRole('DONOR')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-button font-heading font-bold transition-all ${role === 'DONOR' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`}>
            <User size={18} /> Donor
          </button>
          <button onClick={() => setRole('NGO')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-button font-heading font-bold transition-all ${role === 'NGO' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary'}`}>
            <Building2 size={18} /> NGO
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"><UserCircle size={20} /></span>
              <input type="text" required className="input-field pl-12" placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"><Mail size={20} /></span>
              <input type="email" required className="input-field pl-12" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"><Lock size={20} /></span>
              <input type="password" required className="input-field pl-12" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full">Sign Up as {role}</Button>
        </form>

        <p className="mt-8 text-center font-body text-text-secondary">
          Already have an account? <a href="/login" className="text-primary font-bold hover:underline">Log in</a>
        </p>
      </div>
    </Layout>
  )
}
