import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'freelancer';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    const redirectTo = user?.role === 'client' ? '/find-talent' : '/find-work';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
