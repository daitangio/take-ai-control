import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MagicLinkCallbackPage from './pages/MagicLinkCallbackPage'
import BoardListPage from './pages/BoardListPage'
import BoardPage from './pages/BoardPage'
import { useAuthStore } from './store/authStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const jwt = useAuthStore(s => s.jwt)
  return jwt ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<MagicLinkCallbackPage />} />
        <Route path="/boards" element={<RequireAuth><BoardListPage /></RequireAuth>} />
        <Route path="/boards/:boardId" element={<RequireAuth><BoardPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/boards" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
