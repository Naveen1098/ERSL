import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Plus, Trash2, Lock, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface BoxFolder {
  id: string;
  name: string;
  description: string;
  share_url: string;
  visibility: 'public' | 'private';
}

// https://ua.box.com/s/abc123  ->  https://ua.app.box.com/embed/s/abc123
const toEmbedUrl = (url: string): string => {
  try {
    const u = new URL(url.trim());
    const m = u.pathname.match(/\/s\/([A-Za-z0-9]+)/);
    if (!m) return url;
    const host = u.hostname.includes('.app.box.com')
      ? u.hostname
      : u.hostname === 'app.box.com' || u.hostname === 'www.box.com' || u.hostname === 'box.com'
        ? 'app.box.com'
        : u.hostname.replace('.box.com', '.app.box.com');
    return `https://${host}/embed/s/${m[1]}`;
  } catch {
    return url;
  }
};

export const BoxFolders: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'Admin';
  const [folders, setFolders] = useState<BoxFolder[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', share_url: '', visibility: 'private' as 'public' | 'private' });

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.from('box_folders').select('*').order('created_at');
    if (err) setError(err.message);
    else setFolders((data || []) as BoxFolder[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: err } = await supabase!.from('box_folders').insert(form);
    if (err) setError(err.message);
    else { setForm({ name: '', description: '', share_url: '', visibility: 'private' }); load(); }
  };
  const remove = async (f: BoxFolder) => {
    if (!confirm(`Remove folder "${f.name}" from the site? (The Box folder itself is not touched.)`)) return;
    await supabase!.from('box_folders').delete().eq('id', f.id);
    if (active === f.id) setActive(null);
    load();
  };

  const current = folders.find(f => f.id === active);

  return (
    <div className="space-y-6 text-left">
      <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md">
        <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">BOX WORKSPACE</span>
        <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Lab Box Folders</h2>
        <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">Shared lab folders from Box, opened right inside the website.</p>
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{error}</p>}

      {isAdmin && (
        <form onSubmit={add} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end">
          <div className="md:col-span-3 space-y-1"><label className="font-bold text-gray-700">Folder name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded" /></div>
          <div className="md:col-span-4 space-y-1"><label className="font-bold text-gray-700">Box shared link</label>
            <input required type="url" value={form.share_url} onChange={e => setForm({ ...form, share_url: e.target.value })} placeholder="https://ua.box.com/s/..." className="w-full p-2 border border-gray-300 rounded" /></div>
          <div className="md:col-span-2 space-y-1"><label className="font-bold text-gray-700">Who can see</label>
            <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value as any })} className="w-full p-2 border border-gray-300 rounded">
              <option value="private">Members only</option><option value="public">Public</option></select></div>
          <div className="md:col-span-3"><button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded flex items-center justify-center gap-1 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add folder</button></div>
          <div className="md:col-span-12 space-y-1"><label className="font-bold text-gray-700">Description (optional)</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2 border border-gray-300 rounded" /></div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {folders.map(f => (
          <div key={f.id} className={`bg-white rounded-xl border p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${active === f.id ? 'border-[#9E1B32]' : 'border-gray-100'}`}
            onClick={() => setActive(f.id)}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-extrabold text-sm text-slate-800">📁 {f.name}</p>
              {f.visibility === 'private' ? <Lock className="w-3.5 h-3.5 text-[#9E1B32]" /> : <Globe className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
            {f.description && <p className="text-xs text-gray-500 mt-1">{f.description}</p>}
            <div className="mt-3 flex items-center justify-between text-xs">
              <a href={f.share_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" /> Open in Box</a>
              {isAdmin && <button onClick={e => { e.stopPropagation(); remove(f); }} className="text-red-500 p-1 hover:bg-red-50 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>}
            </div>
          </div>
        ))}
        {folders.length === 0 && <div className="md:col-span-3 bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">No folders added yet.</div>}
      </div>

      {current && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-600">{current.name}</div>
          <iframe title={current.name} src={toEmbedUrl(current.share_url)} className="w-full h-[600px]" allowFullScreen />
          <p className="text-[11px] text-gray-400 p-2">If the folder shows a sign-in prompt or is blank, the Box link requires a UA login or embedding is disabled — use “Open in Box”.</p>
        </div>
      )}
    </div>
  );
};
