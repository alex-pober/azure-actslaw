import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

function Login() {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRedirectLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login redirect failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your Microsoft account to access the application
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleLogin}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-blue-500 group-hover:text-blue-400" viewBox="0 0 21 21" fill="currentColor">
                    <path d="M10.5 0h10.5v10.5h-10.5v-10.5zm0 10.5h10.5v10.5h-10.5v-10.5zm-10.5-10.5h10.5v10.5h-10.5v-10.5zm0 10.5h10.5v10.5h-10.5v-10.5z"/>
                  </svg>
                </span>
                Sign in with Microsoft (Popup)
              </button>

              <button
                onClick={handleRedirectLogin}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-300" viewBox="0 0 21 21" fill="currentColor">
                    <path d="M10.5 0h10.5v10.5h-10.5v-10.5zm0 10.5h10.5v10.5h-10.5v-10.5zm-10.5-10.5h10.5v10.5h-10.5v-10.5zm0 10.5h10.5v10.5h-10.5v-10.5z"/>
                  </svg>
                </span>
                Sign in with Microsoft (Redirect)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
