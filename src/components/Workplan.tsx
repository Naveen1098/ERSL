import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Plus, Trash2, MessageSquare, AlertTriangle, Bell, Calendar as CalendarIcon, 
  List, ChevronLeft, ChevronRight, User as UserIcon, CheckCircle2, Clock, TrendingUp, Send, Check
} from 'lucide-react';
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

const STATUS: Record<Status, { label: string; cls: string; dot: string }> = {
  not_started: { label: 'Not yet started', cls: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  in_progress: { label: 'In process', cls: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  discuss_with_liu: { label: 'Need to discuss with Dr. Liu', cls: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
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
  
  // View mode switcher: List vs Calendar
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filter: Admin can filter by member ('all' or specific ID), regular members are locked to their own ID
  const [filterOwner, setFilterOwner] = useState<string>(isAdmin ? 'all' : currentUser.id);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const memberStats = useMemo(() => {
    return people.map(p => {
      const memberTasks = tasks.filter(t => t.owner_id === p.id);
      const total = memberTasks.length;
      const completed = memberTasks.filter(t => t.status === 'completed').length;
      const inProgress = memberTasks.filter(t => t.status === 'in_progress').length;
      const notStarted = memberTasks.filter(t => t.status === 'not_started').length;
      const discuss = memberTasks.filter(t => t.status === 'discuss_with_liu').length;
      const overdue = memberTasks.filter(t => {
        const d = daysUntil(t.due_date);
        return t.status !== 'completed' && d !== null && d < 0;
      }).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        profile: p,
        total,
        completed,
        inProgress,
        notStarted,
        discuss,
        overdue,
        percent,
      };
    });
  }, [people, tasks]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setNotificationStatus('');

    const targetOwner = isAdmin ? form.owner_id : currentUser.id;
    const assignedMember = people.find(p => p.id === targetOwner);

    const { error: err } = await supabase!.from('tasks').insert({
      title: form.title,
      description: form.description,
      due_date: form.due_date || null,
      owner_id: targetOwner,
      created_by: currentUser.id,
    });

    if (err) {
      setError(err.message);
      setIsSubmitting(false);
      return;
    }

    // Trigger automated email notification to assigned member
    if (isAdmin && assignedMember && assignedMember.email) {
      try {
        await fetch('https://formspree.io/f/xbjnqpyz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: `[ERSL Workplan] New Task Assigned by Dr. Hongxing Liu: ${form.title}`,
            recipient_name: assignedMember.name || assignedMember.email,
            recipient_email: assignedMember.email,
            task_title: form.title,
            due_date: form.due_date || 'No specific due date',
            task_description: form.description || 'Milestone tracking item.',
            message: `Hello ${assignedMember.name || 'Team Member'},\n\nA new task has been assigned to you by Dr. Hongxing Liu on the ERSL Lab Workplan:\n\nTask: ${form.title}\nDue Date: ${form.due_date || 'Not specified'}\nDetails: ${form.description || 'None'}\n\nPlease visit the ERSL Portal (https://naveen1098.github.io/ERSL/) to review and update your task progress.`,
            recipients: `${assignedMember.email}, naveenpurushothaman1098@gmail.com, hongxing.liu@ua.edu`
          }),
        });
        setNotificationStatus(`📧 Notification sent to ${assignedMember.name || assignedMember.email} (${assignedMember.email})! Task assigned successfully.`);
      } catch {
        // Non-blocking notification
      }
    }

    setForm({ ...form, title: '', description: '', due_date: '' });
    setIsSubmitting(false);
    load();
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

  // Role Scoping: Admin sees filtered selection (or all), members ONLY see their own tasks
  const visible = useMemo(() => {
    if (!isAdmin) {
      return tasks.filter(t => t.owner_id === currentUser.id);
    }
    return tasks.filter(t => filterOwner === 'all' || t.owner_id === filterOwner);
  }, [tasks, isAdmin, filterOwner, currentUser.id]);

  const alerts = useMemo(
    () => visible.filter(t => {
      const d = daysUntil(t.due_date);
      return t.status !== 'completed' && d !== null && d <= 3;
    }),
    [visible]
  );

  // Calendar Days calculation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null); // empty padding cell
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr });
    }
    return days;
  }, [currentMonthDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left select-none">
      {/* Top Banner */}
      <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md">
        <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">PRIVATE · LAB WORKSPACE</span>
        <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Work Plan & Progress Calendar</h2>
        <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
          {isAdmin ? 'Dr. Liu Dashboard: Oversee and monitor all lab team members’ task schedules and status.' : 'Your personal work plan and due dates. Dr. Liu can review your entries.'}
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-1.5">
          <p className="font-extrabold text-amber-800 flex items-center gap-1.5"><Bell className="w-4 h-4" /> Upcoming & Overdue Deadlines ({alerts.length})</p>
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

      {/* Notification and Error Alerts */}
      {notificationStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationStatus}</span>
        </div>
      )}
      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">{error}</p>}

      {/* Admin Executive Summary: Team Member Progress Overview */}
      {isAdmin && memberStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-red-50 text-[#9E1B32]">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-sm md:text-base text-slate-800">
                  Lab Team Members Progress & Milestone Summary
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Executive overview of task completion rates, active assignments, and pending milestones for Dr. Liu and administrators.
              </p>
            </div>
            <button
              onClick={() => setFilterOwner('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterOwner === 'all'
                  ? 'bg-[#9E1B32] text-white shadow-xs'
                  : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
              }`}
            >
              Show All Members ({tasks.length} tasks)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberStats.map(stat => {
              const isSelected = filterOwner === stat.profile.id;
              const initials = (stat.profile.name || stat.profile.email).substring(0, 2).toUpperCase();
              return (
                <div
                  key={stat.profile.id}
                  onClick={() => setFilterOwner(stat.profile.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                    isSelected
                      ? 'border-[#9E1B32] bg-red-50/20 ring-1 ring-[#9E1B32]/30 shadow-xs'
                      : 'border-gray-150 bg-white hover:border-gray-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                            {stat.profile.name || stat.profile.email}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {stat.profile.email}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {stat.profile.role}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3.5 space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className="text-gray-600">Completion</span>
                        <span className="text-[#9E1B32] font-black">{stat.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-gray-150">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stat.percent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Task Breakdown Badges */}
                    <div className="grid grid-cols-4 gap-1.5 text-center mt-3 text-[10px] font-bold">
                      <div className="p-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <span className="block text-xs font-black">{stat.completed}</span>
                        <span>Done</span>
                      </div>
                      <div className="p-1.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                        <span className="block text-xs font-black">{stat.inProgress}</span>
                        <span>Active</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        <span className="block text-xs font-black">{stat.notStarted}</span>
                        <span>Pending</span>
                      </div>
                      <div className="p-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="block text-xs font-black">{stat.discuss}</span>
                        <span>Discuss</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-semibold">
                      {stat.total} Total Assigned
                    </span>
                    {stat.overdue > 0 ? (
                      <span className="text-red-700 bg-red-50 border border-red-200 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                        ⚠️ {stat.overdue} Overdue
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[10px]">
                        ✓ On Schedule
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Task Bar */}
      <form onSubmit={addTask} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end">
        <div className="md:col-span-3 space-y-1">
          <label className="font-bold text-gray-700">Task Title</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" placeholder="e.g., Sentinel-2 Chlorophyll-a Calibration" />
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className="font-bold text-gray-700">Description / Target Output</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" placeholder="Details or milestones..." />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="font-bold text-gray-700">Due Date</label>
          <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32]" />
        </div>
        {isAdmin && (
          <div className="md:col-span-2 space-y-1">
            <label className="font-bold text-gray-700">Assign To</label>
            <select value={form.owner_id} onChange={e => setForm({ ...form, owner_id: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded font-semibold text-gray-700">
              {people.map(p => <option key={p.id} value={p.id}>{p.name || p.email}</option>)}
            </select>
          </div>
        )}
        <button className={`${isAdmin ? 'md:col-span-2' : 'md:col-span-4'} bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded flex items-center justify-center gap-1 cursor-pointer transition-colors`}>
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </form>

      {/* Control Bar: View Mode Switcher + Member Filter (Admin only) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-xs">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-[#9E1B32] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-[#9E1B32] shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendar View</span>
          </button>
        </div>

        {/* Right: Admin Filter or Member Badge */}
        {isAdmin ? (
          <div className="flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-700">Filter Team Member:</span>
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              className="p-2 border border-gray-200 rounded-lg bg-slate-50 font-bold text-gray-800 focus:outline-none focus:border-[#9E1B32]"
            >
              <option value="all">👥 All Team Members ({tasks.length} tasks)</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  👤 {p.name || p.email} ({tasks.filter(t => t.owner_id === p.id).length})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs font-bold text-gray-600 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Viewing Personal Workplan: {currentUser.name}</span>
          </div>
        )}
      </div>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
              No tasks scheduled for this selection.
            </div>
          )}
          {visible.map(t => {
            const d = daysUntil(t.due_date);
            const overdue = d !== null && d < 0 && t.status !== 'completed';
            return (
              <div key={t.id} className={`bg-white rounded-xl border shadow-xs p-4 transition-all hover:shadow-md ${overdue ? 'border-red-300 bg-red-50/10' : 'border-gray-100'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS[t.status].dot}`}></span>
                      <p className="font-extrabold text-slate-800 text-sm">{t.title}</p>
                    </div>
                    {t.description && <p className="text-xs text-gray-600 mt-1 pl-4 leading-relaxed">{t.description}</p>}
                    <p className="text-[11px] text-gray-400 mt-2 pl-4 font-semibold">
                      {isAdmin && <>👤 Assigned to: <strong className="text-gray-700">{nameOf(t.owner_id)}</strong> · </>}
                      {t.due_date ? <>📅 Due: {t.due_date}{overdue && <span className="text-red-600 font-bold inline-flex items-center gap-0.5 ml-1.5"><AlertTriangle className="w-3 h-3" /> Overdue</span>}</> : 'No due date set'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <select value={t.status} onChange={e => update(t.id, { status: e.target.value as Status })}
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${STATUS[t.status].cls}`}>
                      {(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
                    </select>
                    <button onClick={() => toggle(t.id)} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-gray-600" title="View Comments">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(t)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer" title="Delete Task">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {open === t.id && (
                  <CommentBox list={comments[t.id] || []} onAdd={body => addComment(t.id, body)} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-slate-900">
              {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-28 bg-slate-50/50 rounded-xl border border-transparent"></div>;
              }
              const dayTasks = visible.filter(t => t.due_date === item.dateStr);
              const isToday = item.dateStr === new Date().toISOString().slice(0, 10);
              return (
                <div key={item.dateStr} className={`h-28 p-1.5 rounded-xl border flex flex-col justify-start overflow-hidden text-left transition-all ${
                  isToday ? 'border-[#9E1B32] bg-red-50/20' : 'border-gray-100 bg-white'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isToday ? 'bg-[#9E1B32] text-white' : 'text-gray-700'}`}>
                      {item.day}
                    </span>
                    {dayTasks.length > 0 && <span className="text-[9px] font-mono text-gray-400">{dayTasks.length} task(s)</span>}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-20">
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => toggle(t.id)}
                        className={`text-[9px] font-bold p-1 rounded border leading-tight truncate cursor-pointer hover:scale-102 transition-all ${STATUS[t.status].cls}`}
                        title={`${t.title} (${STATUS[t.status].label})`}
                      >
                        {isAdmin && <span className="font-extrabold">{nameOf(t.owner_id).split(' ')[0]}: </span>}
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const CommentBox: React.FC<{ list: Comment[]; onAdd: (b: string) => void }> = ({ list, onAdd }) => {
  const [text, setText] = useState('');
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
      {list.map(c => (
        <p key={c.id} className="bg-slate-50 rounded p-2 text-left">
          <strong>{c.author_name}</strong> <span className="text-gray-400">{new Date(c.created_at).toLocaleString()}</span><br />{c.body}
        </p>
      ))}
      <form onSubmit={e => { e.preventDefault(); onAdd(text); setText(''); }} className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Add a comment or status update..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#9E1B32]" />
        <button className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold px-3 rounded-lg cursor-pointer transition-colors">Post</button>
      </form>
    </div>
  );
};
