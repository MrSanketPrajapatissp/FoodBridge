import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import { CheckCircle2, XCircle } from 'lucide-react'
import Layout from '../components/Layout'

export default function HealthCheck() {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get('/health/')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'ok') setStatus('ok')
        else setStatus('error')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 px-6 text-center animate-fade-up">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="font-heading font-bold text-2xl text-text-primary">Checking Backend Connection...</h1>
          </div>
        )}
        {status === 'ok' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-text-primary mb-4">M0 Complete!</h1>
            <p className="font-body text-text-secondary text-lg">Backend API is securely connected and healthy.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-text-primary mb-4">Connection Failed</h1>
            <p className="font-body text-text-secondary text-lg">Cannot reach Backend API at this time.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
