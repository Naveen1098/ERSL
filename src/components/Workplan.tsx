import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, MessageSquare, AlertTriangle, Bell } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import type { User } from '../types';

type Status = 'not_started' | 'in_progress' | 'completed' | 'discuss_with_liu';

interface Task {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: Status;
}
interface Comment {
  id: string;
  task_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

const STATUS: Record<Status, { label: string; cls: string }> = {
  not_started: { label: 'Not yet started', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  in_progress: { label: 'In process', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  discuss_with_liu: { label: 'Need to discuss with Dr. Liu', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
};

const daysUntil = (d: string | null) => {
  if (!d) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((new Date(d + 'T00:00:00').getTime() - today.getTime()) / 86400000);
};

export const Workplan: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const isAdmin = currentUser.role === 'Admin';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [filterOwner, setFilterOwner] = useState<string>(isAdmin ? 'all' : currentUser.id);
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', due_date: '', owner_id: currentUser.id });

  const load = useCallback(async () => {
    if (!supabase) return;
    const [t, p] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('profiles').select('*').in('role', ['admin', 'member']),
    ]);
    if (t.error) setError(t.error.message);
    else setTasks((t.data || []) as Task[]);
    if (p.data) setPeople(p.data as Profile[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const nameOf = (id: string) => people.find(p => p.id === id)?.name || people.find(p => p.id === id)?.email || 'Unknown';

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error: err } = await supabase!.from('tasks').insert({
      title: form.title,
      description: form.description,
      due_date: form.due_date || null,
      owner_id: isAdmin ? form.owner_id : currentUser.id,
      created_by: currentUser.id,
    });
    if (err) setError(err.message);
    else { setForm({ ...form, title: '', description: '', due_date: '' }); load(); }
  };

  const update = async (id: string, patch: Partial<Task>) => {
    await supabase!.from('tasks').update(patch).eq('id', id);
    load();
  };
  const remove = async (t: Task) => {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    await supabase!.from('tasks').delete().eq('id', t.id);
    load();
  };

  const loadComments = async (taskId: string) => {
    const { data } = await supabase!.from('task_comments').select('*').eq('task_id', taskId).order('created_at');
    setComments(prev => ({ ...prev, [taskId]: (data || []) as Comment[] }));
  };
  const toggle = (id: string) => {
    if (open === id) setOpen(null);
    else { setOpen(id); loadComments(id); }
  };
  const addComment = async (taskId: string, body: string) => {
    if (!body.trim()) return;
    await supabase!.from('task_comments').insert({
      task_id: taskId, author_id: currentUser.id, author_name: currentUser.name, body: body.trim(),
    });
    loadComments(taskId);
  };

  const visible = useMemo(
    () => tasks.filter(t => filterOwner === 'all' || t.owner_id === filterOwner),
    [tasks, filterOwner]
  );

  const alerts = useMemo(
    () => tasks.filter(t => {
      const d = daysUntil(t.due_date);
      return t.status !== 'completed' && d !== null && d <= 3 && (isAdmin || t.owner_id === currentUser.id);
    }),
    [tasks, isAdmin, currentUser.id]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md">
        <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">PRIVATE · LAB MEMBERS</span>
        <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Work Plan</h2>
        <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
          {isAdmin ? 'Monitor every team member’s tasks, status and comments.' : 'Your tasks, deadlines and status. Dr. Liu can see your progress.'}
        </p>
      </div>

      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-1.5">
          <p className="font-extrabold text-amber-800 flex items-center gap-1.5"><Bell className="w-4 h-4" /> Deadlines needing attention ({alerts.length})</p>
          {alerts.map(t => {
            const d = daysUntil(t.due_date)!;
            return (
              <p key={t.id} className="text-amber-900">
                {isAdmin && <strong>{nameOf(t.owner_id)}: </strong>}{t.title} — {d < 0 ? `overdue by ${-d} day(s)` : d === 0 ? 'due today' : `due in ${d} day(s)`}
              </p>
            );
          })}
        </div>
      )}
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{error}</p>}

      <form onSubmit={addTask} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end">
        <div className="md:col-span-3 space-y-1">
          <label className="font-bold text-gray-700">Task</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" placeholder="e.g. Finish SAR preprocessing" />
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className="font-bold text-gray-700">Details</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="font-bold text-gray-700">Due date</label>
          <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
        </div>
        {isAdmin && (
          <div className="md:col-span-2 space-y-1">
            <label className="font-bold text-gray-700">Assign to</label>
            <select value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded">
              {people.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
            </select>
          </div>
        )}
        <button className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded flex items-center justify-center gap-1 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add task
        </button>
      </form>

      {isAdmin && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-gray-500 uppercase tracking-wider">Team member:</span>
          <select value={filterOwner} onChange={e => setFilterOwner(e.target.value)} className="p-2 border border-gray-200 rounded bg-white font-semibold">
            <option value="all">All members</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {visible.length === 0 && <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">No tasks yet.</div>}
        {visible.map(t => {
          const d = daysUntil(t.due_date);
          const overdue = d !== null && d < 0 && t.status !== 'completed';
          return (
            <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-4 ${overdue ? 'border-red-300' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 text-sm">{t.title}</p>
                  {t.description && <p className="text-xs text-gray-600 mt-0.5">{t.description}</p>}
                  <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                    {(isAdmin || t.owner_id !== currentUser.id) && <>👤 {nameOf(t.owner_id)} · </>}
                    {t.due_date ? <>Due {t.due_date}{overdue && <span className="text-red-600 inline-flex items-center gap-0.5 ml-1"><AlertTriangle className="w-3 h-3" />overdue</span>}</> : 'No due date'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={t.status} onChange={e => update(t.id, { status: e.target.value as Status })}
                    className={`text-xs font-bold px-2 py-1.5 rounded border cursor-pointer ${STATUS[t.status].cls}`}>
                    {(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
                  </select>
                  <button onClick={() => toggle(t.id)} className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer" title="Comments"><MessageSquare className="w-3.5 h-3.5 text-gray-600" /></button>
                  <button onClick={() => remove(t)} className="p-1.5 rounded text-red-500 hover:bg-red-50 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {open === t.id && (
                <CommentBox list={comments[t.id] || []} onAdd={body => addComment(t.id, body)} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CommentBox: React.FC<{ list: Comment[]; onAdd: (b: string) => void }> = ({ list, onAdd }) => {
  const [text, setText] = useState('');
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
      {list.map(c => (
        <p key={c.id} className="bg-slate-50 rounded p-2">
          <strong>{c.author_name}</strong> <span className="text-gray-400">{new Date(c.created_at).toLocaleString()}</span><br />{c.body}
        </p>
      ))}
      <form onSubmit={e => { e.preventDefault(); onAdd(text); setText(''); }} className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment..."
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
        <button className="bg-[#9E1B32] text-white font-bold px-3 rounded cursor-pointer">Post</button>
      </form>
    </div>
  );
};
