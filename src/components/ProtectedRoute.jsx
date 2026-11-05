import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sem sessão -> login. Rotas de admin também são bloqueadas para atendentes
// (a API bloqueia de qualquer forma; aqui é só experiência de uso).
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Carregando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
