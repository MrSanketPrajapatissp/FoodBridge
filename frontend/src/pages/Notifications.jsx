import React, { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, Clock, XCircle, ShieldCheck, ShieldX } from 'lucide-react'
import Layout from '../components/Layout'

export default function Notifications() {
  const [notifs, setNotifs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifs()
  }, [])

  const fetchNotifs = async () => {
    const res = await api.get('/notifications/')
    if (res) setNotifs(await res.json())
  }

  const handleMarkAllRead = async () => {
    const res = await api.put('/notifications/read-all/')
    if (res && res.status === 200) fetchNotifs()
  }

  const handleClick = async (n) => {
    if (!n.is_read) await api.put(`/notifications/${n.id}/read/`)
    if (n.related_donation_id) navigate(`/donations/${n.related_donation_id}`)
    else fetchNotifs()
  }

  const getTypeStyle = (type) => {
    switch(type) {
      case 'DONATION_CLAIMED': return 'bg-yellow-50 text-yellow-700'
      case 'PICKUP_COMPLETE': return 'bg-green-50 text-green-700'
      case 'HOLD_EXPIRED': return 'bg-red-50 text-red-700'
      case 'NO_SHOW': return 'bg-red-50 text-red-700'
      case 'NGO_VERIFIED': return 'bg-green-50 text-green-700'
      case 'NGO_REJECTED': return 'bg-red-50 text-red-700'
      default: return 'bg-surface-muted text-text-secondary'
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'DONATION_CLAIMED': return <Clock className="size-5 text-yellow-600" />
      case 'PICKUP_COMPLETE': return <CheckCircle2 className="size-5 text-green-600" />
      case 'HOLD_EXPIRED': return <XCircle className="size-5 text-red-600" />
      case 'NO_SHOW': return <XCircle className="size-5 text-red-600" />
      case 'NGO_VERIFIED': return <ShieldCheck className="size-5 text-green-600" />
      case 'NGO_REJECTED': return <ShieldX className="size-5 text-red-600" />
      default: return <Bell className="size-5 text-text-secondary" />
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-up">
        <div className="flex justify-between items-center mb-8">
        <h1 className="font-heading font-bold text-3xl text-text-primary">Notifications</h1>
        {notifs.some(n => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="rounded-button border-2 border-primary text-primary font-heading font-bold py-2 px-4 hover:bg-primary-light">
            Mark All Read
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16 rounded-card border-2 border-dashed border-surface-border">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="size-8 text-primary" />
          </div>
          <h2 className="font-heading font-bold text-xl text-text-primary mb-2">No notifications yet</h2>
          <p className="font-body text-text-secondary">When something happens, you'll see it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifs.map(n => (
            <div 
              key={n.id} 
              onClick={() => handleClick(n)}
              className={`p-6 rounded-card border cursor-pointer transition-all hover:shadow-card-hover ${n.is_read ? 'bg-surface border-surface-border' : 'bg-primary-light border-primary/20'}`}
            >
              <div className="flex items-start">
                <div className="mr-4 mt-1">{getIcon(n.notification_type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-heading font-bold text-lg text-text-primary">{n.title}</h3>
                    <span className={`font-mono text-xs uppercase px-2 py-1 rounded-badge ${getTypeStyle(n.notification_type)}`}>
                      {n.notification_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-body text-text-secondary mb-2">{n.message}</p>
                  <span className="font-mono text-xs text-text-muted">{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </Layout>
  )
}
