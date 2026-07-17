import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await authApi.requestLink(email)
      setSent(true)
    } catch {
      setError('Email domain not allowed or server error.')
    }
  }

  if (sent) return (
    <div style={styles.center}>
      <h2>Check your email</h2>
      <p>A login link has been sent to <strong>{email}</strong>. It expires in 15 minutes.</p>
    </div>
  )

  return (
    <div style={styles.center}>
      <h1 style={{ margin: '0 0 8px' }}>nello</h1>
      <p style={{ color: '#666', margin: '0 0 24px' }}>Enter your email to receive a login link</p>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email" required placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>Send link</button>
        {error && <p style={{ color: 'red', margin: '8px 0 0' }}>{error}</p>}
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  form: { display: 'flex', flexDirection: 'column', gap: 8, width: 300 },
  input: { padding: '8px 12px', fontSize: 14, border: '1px solid #ccc', borderRadius: 4 },
  btn: { padding: '8px 12px', background: '#0052cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 },
}
