import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function MagicLinkCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  useEffect(() => {
    const token = params.get('token')
    if (!token) { navigate('/login'); return }
    authApi.verifyToken(token)
      .then(({ jwt }) => {
        // Decode email from JWT payload (base64)
        const payload = JSON.parse(atob(jwt.split('.')[1]))
        login(payload.sub, jwt)
        navigate('/boards')
      })
      .catch(() => navigate('/login'))
  }, [])

  return <div style={{ padding: 32 }}>Signing you in…</div>
}
