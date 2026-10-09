import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ apenasAdmin = false }: { apenasAdmin?: boolean }) {
  const { usuario, isAdmin } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (apenasAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
