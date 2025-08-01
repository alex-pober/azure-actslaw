import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';

function UserProfile() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { isConnected, setBearerToken } = useSmartAdvocate();
  const [saCredentials, setSaCredentials] = useState({ username: '', password: '' });
  const [showSaLogin, setShowSaLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
      mainWindowRedirectUri: '/'
    });
  };

  const handleSmartAdvocateLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://sa.actslaw.com/CaseSyncAPI/Users/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: saCredentials.username,
          Password: saCredentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      const bearerToken = data.token;
      console.log(data)

      // Store token in context
      setBearerToken(bearerToken);
      setShowSaLogin(false);
      setSaCredentials({ username: '', password: '' });
    } catch (error) {
      console.error('SmartAdvocate login failed:', error);
      alert('SmartAdvocate login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartAdvocateLogout = () => {
    setBearerToken(null);
  };


  console.log('UserProfile render:', { isAuthenticated, accountsLength: accounts.length });

  if (!isAuthenticated || accounts.length === 0) {
    return null;
  }

  const account = accounts[0];
  console.log('Account:', account);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={account.idTokenClaims?.picture as string} alt={account.name || account.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(account.name || account.username)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-primary">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{account.name || account.username}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {account.username}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* SmartAdvocate Section */}
        <div className="p-2">
          <p className="text-sm font-medium text-muted-foreground mb-2">SmartAdvocate</p>
          {isConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSmartAdvocateLogout}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <>
              {!showSaLogin ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaLogin(true)}
                  className="w-full"
                >
                  Connect to SmartAdvocate
                </Button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Username"
                    value={saCredentials.username}
                    onChange={(e) => setSaCredentials({ ...saCredentials, username: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={saCredentials.password}
                    onChange={(e) => setSaCredentials({ ...saCredentials, password: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSmartAdvocateLogin}
                      disabled={isLoading || !saCredentials.username || !saCredentials.password}
                      className="flex-1"
                    >
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSaLogin(false);
                        setSaCredentials({ username: '', password: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserProfile;
