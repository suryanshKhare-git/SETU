import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onRegister }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);

      if (!success) {
        setError('Invalid investigator email or password.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-setu-bg flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-setu-text">
            Investigator Portal
          </h1>

          <p className="mt-2 text-setu-text/60">
            Secure Investigation & Intelligence System
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">

          <h2 className="text-2xl font-semibold text-setu-text mb-2">
            Investigator Login
          </h2>

          <p className="text-sm text-setu-text/60 mb-6">
            Sign in to access your investigation dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Official Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@department.gov"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login as Investigator'}
            </button>

          </form>

          <div className="text-center mt-6 text-sm">
            <span className="text-setu-text/60">
              Don't have an investigator account?
            </span>{' '}

            <button
              onClick={onRegister}
              disabled={loading}
              className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
            >
              Register
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-setu-text/40 mt-6">
          Authorized Investigator Access Only
        </p>

      </div>
    </div>
  );
};