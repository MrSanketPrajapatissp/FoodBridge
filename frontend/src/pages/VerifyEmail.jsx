import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import { api } from '../utils/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      api.get(`/verify-email/?token=${token}`)
        .then(res => setStatus(res.ok ? 'success' : 'error'))
        .catch(() => setStatus('error'))
    } else {
        setStatus('error')
    }
  }, [token])

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 px-6 text-center animate-fade-up">
        {status === 'loading' && <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>}
        
        {status === 'success' && (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-text-primary mb-4">Email Verified!</h1>
            <p className="font-body text-text-secondary text-lg mb-8">Your account is now verified. You can now fully use all features of FoodBridge.</p>
            <Button onClick={() => navigate('/profile')} className="w-full">Go to Profile <ArrowRight size={18}/></Button>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-text-primary mb-4">Verification Failed</h1>
            <p className="font-body text-text-secondary text-lg mb-8">The verification link is invalid or has expired.</p>
            <Button variant="secondary" onClick={() => navigate('/login')} className="w-full">Back to Login</Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
