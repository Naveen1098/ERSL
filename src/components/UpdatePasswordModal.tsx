import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UpdatePasswordModalProps {
  onClose: () => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Clear hash token from URL
        window.history.replaceState(null, '', window.location.pathname);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden text-left">
        <div className="bg-[#9E1B32] p-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer" title="Close">
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-200" /> Reset Your Password
          </h2>
          <p className="text-xs text-red-100 mt-1">Enter your new password below to update your account credentials.</p>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="font-extrabold text-base text-slate-800">Password Updated Successfully!</h3>
            <p className="text-xs text-gray-600">You are now logged in with your new credentials. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter at least 8 characters"
                required
                minLength={8}
                className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                minLength={8}
                className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]"
              />
            </div>

            {error && (
              <p className="text-red-700 bg-red-50 border border-red-100 rounded p-2 flex gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#9E1B32] hover:bg-red-800 disabled:opacity-60 text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {busy ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
