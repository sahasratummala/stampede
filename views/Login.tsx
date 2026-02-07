
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@utexas.edu')) {
      setError('Please use your valid @utexas.edu Outlook email.');
      return;
    }
    onLogin();
  };

  return (
    <div className="min-h-screen bg-burnt-orange flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 z-10">
        <div className="text-center mb-10">
          <div className="inline-block bg-burnt-orange text-white px-4 py-2 rounded mb-4 font-bebas text-3xl tracking-widest">
            MOODY STUDENTS
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Exclusive Student Access</h1>
          <p className="text-gray-600">Enter your UT Austin credentials to unlock concert buddies, outfit advice, and discounted student tickets.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">UT Outlook Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-envelope"></i>
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-burnt-orange focus:border-burnt-orange text-gray-900" 
                placeholder="bevo@utexas.edu"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <button 
            type="submit"
            className="w-full bg-burnt-orange hover:bg-orange-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <i className="fab fa-microsoft mr-2"></i>
            Sign in with Outlook
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our Student Community Guidelines.
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-white/80 text-sm font-medium tracking-wide">
        PART OF THE UNIVERSITY OF TEXAS AT AUSTIN NETWORK
      </p>
    </div>
  );
};

export default Login;
