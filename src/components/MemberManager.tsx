import React, { useEffect, useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';

export const MemberManager: React.FC = () => {
  const [rows, setRows] = useState<Profile[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setRows((data || []) as Profile[]);
  };
  useEffect(() => { load(); }, []);

  const setRole = async (id: string, role: Profile['role']) => {
    await supabase!.from('profiles').update({ role }).eq('id', id);
    load();
  };
  const remove = async (p: Profile) => {
    if (!confirm(`Remove ${p.email}? (Their auth account stays; delete it in the Supabase dashboard to fully remove.)`)) return;
    await supabase!.from('profiles').delete().eq('id', p.id);
    load();
  };

  const pending = rows.filter(r => r.role === 'pending');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left space-y-4">
      <h3 className="font-extrabold text-slate-800 text-sm">Members & Access Requests {pending.length > 0 && <span className="ml-2 bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full">{pending.length} pending</span>}</h3>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="divide-y divide-gray-100">
        {rows.map(r => (
          <div key={r.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <p className="font-bold text-gray-800">{r.name || '(no name)'}</p>
              <p className="text-gray-500">{r.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${r.role === 'admin' ? 'bg-red-100 text-red-700' : r.role === 'member' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.role}</span>
              {r.role === 'pending' && (
                <button onClick={() => setRole(r.id, 'member')} className="p-1.5 rounded bg-emerald-600 text-white cursor-pointer" title="Approve"><Check className="w-3.5 h-3.5" /></button>
              )}
              {r.role === 'member' && (
                <>
                  <button onClick={() => setRole(r.id, 'admin')} className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">Make admin</button>
                  <button onClick={() => setRole(r.id, 'pending')} className="p-1.5 rounded border border-gray-200 cursor-pointer" title="Revoke"><X className="w-3.5 h-3.5" /></button>
                </>
              )}
              <button onClick={() => remove(r)} className="p-1.5 rounded text-red-500 hover:bg-red-50 cursor-pointer" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-gray-400 py-3">No accounts yet.</p>}
      </div>
    </div>
  );
};
