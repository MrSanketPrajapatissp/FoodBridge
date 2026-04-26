import React, { useState } from 'react'
import { api } from '../utils/api'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const res = await api.post('/login/', { email, password })
    if (!res) return
    if (res.status === 401) {
      setErr('Invalid admin credentials')
    } else {
      const data = await res.json()
      if (data.user.role !== 'ADMIN') {
        setErr('Access Denied: Admins only')
        return
      }
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user_role', data.user.role)
      window.location.href = '/foodbridgeapplication/admin/dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-card shadow-card p-8 border border-surface-border">
        <h1 className="font-heading font-bold text-3xl text-primary text-center mb-6">Admin Panel</h1>
        {err && <div className="mb-4 text-red-600 text-sm font-body text-center bg-red-50 p-2 rounded-card border border-red-200">{err}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-body font-medium text-text-primary mb-1">Admin Email</label>
            <input 
              type="email" 
              required 
              className="w-full rounded-input border-2 border-surface-border px-4 py-2 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
              value={email} onChange={e=>setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-body font-medium text-text-primary mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full rounded-input border-2 border-surface-border px-4 py-2 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none"
              value={password} onChange={e=>setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full rounded-button bg-primary hover:bg-primary-dark text-white font-heading font-bold py-3 shadow-button hover:scale-105 transition-all">
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  )
}
