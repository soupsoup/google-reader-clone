import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Rss, Lock, Loader2 } from 'lucide-react';

// Landing page for the link in a password reset email. Supabase signs the user in
// from the link (PASSWORD_RECOVERY), and this page lets them choose a new password.
export function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);
    if (error) setError(error.message);
    else navigate('/', { replace: true });
  };

  const inputClass =
    'appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Rss className="h-10 w-10" />
            <span className="text-3xl font-bold">Reader</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-white">Choose a new password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : !user ? (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p>This reset link has expired or was already used.</p>
              <Link to="/auth" className="text-blue-600 dark:text-blue-400 hover:underline">
                Back to sign in to request a new one
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {[
                { id: 'new-password', label: 'New password', value: password, set: setPassword },
                { id: 'confirm-password', label: 'Confirm new password', value: confirm, set: setConfirm },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {f.label}
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id={f.id}
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save new password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
