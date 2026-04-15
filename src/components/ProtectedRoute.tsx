import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

type RequiredRole = 'customer' | 'seller' | 'admin' | 'courier';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: RequiredRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [courierChecked, setCourierChecked] = useState(false);
  const [courierAuth, setCourierAuth] = useState(false);

  useEffect(() => {
    if (requiredRole === 'courier') {
      supabase.auth.getUser().then(({ data }) => {
        setCourierAuth(!!data.user);
        setCourierChecked(true);
      });
    }
  }, [requiredRole]);

  if (loading) return null;

  // Courier uses Supabase auth
  if (requiredRole === 'courier') {
    if (!courierChecked) return null;
    if (!courierAuth) return <Navigate to="/login" replace />;
    return <>{children}</>;
  }

  // All other roles use localStorage auth
  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
