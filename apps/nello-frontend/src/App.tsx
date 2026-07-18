import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { MagicLinkCallbackPage } from "./pages/MagicLinkCallbackPage";
import { BoardListPage } from "./pages/BoardListPage";
import { BoardPage } from "./pages/BoardPage";
import { useAuthStore } from "./store/authStore";

function ProtectedRoute() {
  const jwt = useAuthStore((state) => state.jwt);
  return jwt ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth/callback" element={<MagicLinkCallbackPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/boards" element={<BoardListPage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Route>
    </Routes>
  );
}
