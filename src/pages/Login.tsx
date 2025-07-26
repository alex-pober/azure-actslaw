import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { loginRequest } from '../authConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Scale, 
  Shield, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Building2
} from 'lucide-react';

function Login() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await instance.loginPopup(loginRequest);
      // Navigation will be handled by the useEffect above when isAuthenticated changes
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error: any) {
      console.error('Login redirect failed:', error);
      setError(error.message || 'Login redirect failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Don't render the login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-muted/40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main Login Card */}
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <CardHeader className="space-y-4 pb-6">
            {/* Logo/Brand */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-20 w-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <Scale className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  ACTS Law
                </CardTitle>
                <Badge variant="outline" className="px-3 py-1">
                  Legal Case Management System
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <CardDescription className="text-center text-base leading-relaxed">
              Access your secure legal dashboard with Microsoft's enterprise authentication
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5 mr-3" />
                    Continue with Microsoft
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                onClick={handleRedirectLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 hover:bg-muted/50 transition-all duration-200"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-3 h-5 w-5" />
                    Sign in via Redirect
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Security Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="secondary" className="text-xs">Enterprise Security</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Protected by Microsoft's enterprise-grade authentication with multi-factor support
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/20 border">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs font-medium">SSL Encrypted</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-xs font-medium">GDPR Compliant</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            © 2025 ACTS Law Firm. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Microsoft Azure Active Directory
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
