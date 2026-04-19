import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { api } from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/login/', formData)
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('user_role', data.user.role)
        localStorage.setItem('user_name', data.user.full_name)
        localStorage.setItem('user_email', data.user.email)
        localStorage.setItem('user_id', data.user.id)
        navigate('/profile')
      } else {
        setToast({ message: 'Invalid email or password', type: 'error' })
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
      <div className="max-w-md mx-auto py-20 px-6 animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-3xl text-text-primary mb-2">Welcome Back</h1>
          <p className="font-body text-text-secondary">Log in to your FoodBridge account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <Button type="submit" loading={loading} className="w-full">Log In</Button>
        </form>

        <p className="mt-8 text-center font-body text-text-secondary">
          Don't have an account? <a href="/register" className="text-primary font-bold hover:underline">Sign up</a>
        </p>
      </div>
    </Layout>
  )
}
