import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, supabaseConfigured, fetchProfile, ADMIN_EMAILS } from '../lib/supabase';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (err) throw err;
        await supabase.auth.signOut();

        // Send access request notification to administrator emails
        try {
          await fetch('https://formspree.io/f/xbjnqpyz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: `[ERSL Website] New Access Request: ${name || email}`,
              applicant_name: name,
              applicant_email: email,
              message: `New user requested member access to ERSL Website:\n\nName: ${name}\nEmail: ${email}\n\nPlease log into https://ersl.pages.dev/ -> Control Panel -> Members to approve this user.`,
              recipients: 'hongxing.liu@ua.edu, npurushothaman@ua.edu'
            }),
          });
        } catch {
          // Notification sent attempt completed
        }

        setInfo('Access request sent! Lab administrators have been notified. Once your request is approved, you will be able to log in.');
        setMode('signin');
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        const profile = data.user ? await fetchProfile(data.user.id) : null;
        const isAdmin = ADMIN_EMAILS.includes((email || '').toLowerCase().trim());
        if (!isAdmin && profile && profile.role === 'pending') {
          await supabase.auth.signOut();
          setError('Your account is waiting for approval by the lab administrator.');
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!supabase || !email) {
      setError('Please enter your registered email address first, then click "Forgot password".');
      return;
    }
    setBusy(true);
    setError('');
    setInfo('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    setBusy(false);
    if (err) {
      setError(`Password reset error: ${err.message}. If email delivery is restricted, please contact lab administrator Dr. Hongxing Liu (hongxing.liu@ua.edu) to reset your account.`);
    } else {
      setInfo('Password reset instructions sent! Please check your Inbox and Spam/Junk folder. If your university firewall blocks automated emails, Dr. Hongxing Liu can also grant direct access from the Admin Control Panel.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden text-left">
        <div className="bg-[#9E1B32] p-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer" title="Close">
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-extrabold">ERSL Member Portal</h2>
          <p className="text-xs text-red-100 mt-1">Private area for lab members. Works with any email address.</p>
        </div>

        {!supabaseConfigured ? (
          <div className="p-6 text-xs text-gray-600 space-y-2">
            <p className="font-bold text-red-700 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Login is not configured yet.</p>
            <p>The site administrator must add the Supabase keys (see SETUP-LOGIN.md).</p>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6 space-y-4 text-xs">
            <div className="flex rounded-lg bg-slate-100 p-1 font-bold">
              <button type="button" onClick={() => setMode('signin')}
                className={`flex-1 py-2 rounded-md cursor-pointer ${mode === 'signin' ? 'bg-white shadow text-[#9E1B32]' : 'text-gray-500'}`}>Sign in</button>
              <button type="button" onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-md cursor-pointer ${mode === 'signup' ? 'bg-white shadow text-[#9E1B32]' : 'text-gray-500'}`}>Request access</button>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="font-bold text-gray-700">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} required
                  className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
              </div>
            )}
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
            </div>

            {error && <p className="text-red-700 bg-red-50 border border-red-100 rounded p-2 flex gap-1"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
            {info && <p className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded p-2 flex gap-1"><CheckCircle2 className="w-4 h-4 shrink-0" />{info}</p>}

            <button type="submit" disabled={busy}
              className="w-full bg-[#9E1B32] hover:bg-red-800 disabled:opacity-60 text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 cursor-pointer">
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Request access'}
            </button>
            {mode === 'signin' && (
              <button type="button" onClick={reset} className="text-[#9E1B32] font-semibold hover:underline cursor-pointer">Forgot password?</button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
