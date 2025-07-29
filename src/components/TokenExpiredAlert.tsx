import { useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';

export default function TokenExpiredAlert() {
  const { isTokenExpired } = useSmartAdvocate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isTokenExpired) {
      setIsVisible(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isTokenExpired]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleReconnect = () => {
    setIsVisible(false);
    // This will trigger the user to reconnect via the UserProfile dropdown
    // The user can click on their profile and reconnect to SmartAdvocate
  };

  if (!isVisible || !isTokenExpired) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 mb-1">
              SmartAdvocate Session Expired
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              Your SmartAdvocate connection has expired. Please reconnect to continue using case search.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleReconnect}
                className="text-xs bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
              >
                Reconnect
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-amber-600 hover:text-amber-800 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}