import { useIsAuthenticated } from '@azure/msal-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

interface AuthenticationGuardProps {
  children: React.ReactNode;
}

function AuthenticationGuard({ children }: AuthenticationGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default AuthenticationGuard;
