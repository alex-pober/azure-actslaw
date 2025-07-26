import { useIsAuthenticated } from '@azure/msal-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

interface AuthenticationGuardProps {
  children: React.ReactNode;
}

function AuthenticationGuard({ children }: AuthenticationGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default AuthenticationGuard;
