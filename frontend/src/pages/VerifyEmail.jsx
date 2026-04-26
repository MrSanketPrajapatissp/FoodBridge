import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight, Building2 } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/ui/Button'
import { api } from '../utils/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [isNgo, setIsNgo] = useState(false)
  const token = searchParams.get('token')

  // useRef guard prevents React StrictMode double-invoke in dev
  // (React 18 strict mode mounts components twice — without this guard,
  //  the API would be called twice: 1st clears the token, 2nd fails)
  const calledRef = useRef(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    // Skip if already called (React StrictMode guard)
    if (calledRef.current) return
    calledRef.current = true

    api.get(`/verify-email/?token=${token}`)
      .then(async res => {
        if (res.ok) {
          const data = await res.json()
          setIsNgo(data.role === 'NGO')
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 px-6 text-center animate-fade-up">

        {/* Loading spinner */}
        {status === 'loading' && (
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 mx-auto">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-text-primary mb-4">Email Verified!</h1>

            {isNgo ? (
              <>
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-card flex items-start gap-3 text-left">
                  <Building2 size={20} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading font-bold text-text-primary text-sm mb-1">NGO Account Activated!</p>
                    <p className="font-body text-text-secondary text-sm leading-relaxed">
                      Your NGO has been automatically verified. You can now claim food donations.
                      Check your email for a confirmation.
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/my-claims')} className="w-full">
                  Browse Food to Claim <ArrowRight size={18} />
                </Button>
              </>
            ) : (
              <>
                <p className="font-body text-text-secondary text-lg mb-8">
                  Your account is now verified. You can now fully use all features of FoodBridge.
                </p>
                <Button onClick={() => navigate('/donate')} className="w-full">
                  Start Donating <ArrowRight size={18} />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="font-heading font-bold text-3xl text-text-primary mb-4">Verification Failed</h1>
            <p className="font-body text-text-secondary text-lg mb-8">
              The verification link is invalid or has already been used.
              If you are already logged in, your account may already be verified.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/login')} className="w-full">Back to Login</Button>
              <Button variant="secondary" onClick={() => navigate('/profile')} className="w-full">
                Go to My Profile
              </Button>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
