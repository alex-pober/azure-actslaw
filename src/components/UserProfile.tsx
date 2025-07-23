import { useAccount, useMsal } from '@azure/msal-react';

function UserProfile() {
  const { instance } = useMsal();
  const account = useAccount();

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
      mainWindowRedirectUri: '/'
    });
  };

  if (!account) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {account.name?.charAt(0) || 'U'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {account.name || account.username}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:text-red-800 font-medium"
      >
        Sign out
      </button>
    </div>
  );
}

export default UserProfile;