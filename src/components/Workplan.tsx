import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { 
  Plus, Trash2, MessageSquare, AlertTriangle, Bell, Calendar as CalendarIcon, 
  List, ChevronLeft, ChevronRight, User as UserIcon, CheckCircle2, Clock, TrendingUp, Send, Check,
  Paperclip, FileText, File as FileIcon, Download, ExternalLink, X, FolderGit2, Image as ImageIcon,
  Maximize2, UploadCloud, Mail
} from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { initialPeople } from '../data/initialData';
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
  author_id?: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface CommentAttachment {
  name: string;
  url: string;
  type: string;
  size?: string;
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

const parseCommentContent = (body: string): { text: string; attachments: CommentAttachment[] } => {
  try {
    if (body.startsWith('{') && body.includes('"text"')) {
      const parsed = JSON.parse(body);
      const list: CommentAttachment[] = [];
      if (Array.isArray(parsed.attachments)) {
        list.push(...parsed.attachments);
      } else if (parsed.attachment) {
        list.push(parsed.attachment);
      }
      return { text: parsed.text || '', attachments: list };
    }
  } catch {
    // plain text fallback
  }
  return { text: body, attachments: [] };
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileCategory = (att: CommentAttachment): {
  isImage: boolean;
  isPdf: boolean;
  isBox: boolean;
  badge: string;
  badgeColor: string;
} => {
  const name = (att.name || '').toLowerCase();
  const type = (att.type || '').toLowerCase();
  const url = (att.url || '').toLowerCase();

  const isImage = type.startsWith('image/') || url.startsWith('data:image/');
  const isPdf = type === 'application/pdf' || name.endsWith('.pdf');
  const isBox = type === 'box' || url.includes('box.com');

  let badge = 'FILE';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';

  if (isImage) {
    badge = 'IMG';
    badgeColor = 'bg-blue-100 text-blue-700 border-blue-300';
  } else if (isPdf) {
    badge = 'PDF';
    badgeColor = 'bg-red-100 text-red-700 border-red-300';
  } else if (isBox) {
    badge = 'UA BOX';
    badgeColor = 'bg-sky-100 text-sky-700 border-sky-300';
  } else if (name.endsWith('.doc') || name.endsWith('.docx')) {
    badge = 'DOC';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
  } else if (name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv') || name.endsWith('.tsv')) {
    badge = 'SHEET';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (name.endsWith('.ppt') || name.endsWith('.pptx')) {
    badge = 'SLIDES';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (name.endsWith('.zip') || name.endsWith('.tar') || name.endsWith('.gz') || name.endsWith('.7z')) {
    badge = 'ARCHIVE';
    badgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
  } else if (name.endsWith('.py') || name.endsWith('.r') || name.endsWith('.ipynb') || name.endsWith('.json')) {
    badge = 'CODE';
    badgeColor = 'bg-teal-100 text-teal-800 border-teal-300';
  } else if (name.endsWith('.shp') || name.endsWith('.geojson') || name.endsWith('.kml') || name.endsWith('.tif') || name.endsWith('.tiff') || name.endsWith('.nc') || name.endsWith('.h5')) {
    badge = 'GIS DATA';
    badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
  }

  return { isImage, isPdf, isBox, badge, badgeColor };
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
  const [activeTaskModal, setActiveTaskModal] = useState<Task | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');
  const [assignedEmailPrompt, setAssignedEmailPrompt] = useState<{
    recipientName: string;
    recipientEmail: string;
    taskTitle: string;
    dueDate: string;
    description: string;
    mailtoUrl: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', owner_id: currentUser.id });

  // Track alias IDs (e.g. user-naveen, uuid, person-purushothaman) mapping to canonical Profile ID
  const [aliasMap, setAliasMap] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    // 1. Load local tasks backup if available
    const localTasks = localStorage.getItem('ersl_tasks');
    if (localTasks) {
      try { setTasks(JSON.parse(localTasks)); } catch {}
    }

    // Helper to normalize emails for strict deduplication
    const norm = (str?: string) => (str || '').trim().toLowerCase();

    // 2. Build verified canonical people list starting from initialPeople
    const peopleByEmail = new Map<string, Profile>();
    const aliases: Record<string, string> = {};

    initialPeople.forEach(p => {
      const email = norm(p.email || (p.id === 'person-purushothaman' ? 'npurushothaman@ua.edu' : `${p.id}@ua.edu`));
      const profile: Profile = {
        id: p.id,
        name: p.name,
        email: email,
        role: p.id === 'person-liu' ? 'admin' : 'member'
      };
      if (email) {
        peopleByEmail.set(email, profile);
      }
      aliases[p.id] = p.id;
    });

    // Merge helper that merges incoming profiles by email instead of creating duplicate cards
    const mergeProfile = (incoming: { id?: string; name?: string; email?: string; role?: string }) => {
      if (!incoming) return;
      const email = norm(incoming.email);
      const incomingId = incoming.id || '';

      if (email && peopleByEmail.has(email)) {
        // Person already exists with this email - merge into the canonical record!
        const existing = peopleByEmail.get(email)!;
        if (incomingId) {
          aliases[incomingId] = existing.id;
        }
        // Promote role to admin if incoming is admin
        if (incoming.role?.toLowerCase() === 'admin') {
          existing.role = 'admin';
        }
        // Keep the cleaner/longer name if available
        if (incoming.name && incoming.name.length > (existing.name?.length || 0) && !existing.name.startsWith('Dr.')) {
          existing.name = incoming.name;
        }
      } else if (email) {
        // New researcher with a distinct email
        const newId = incomingId || `person-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newProfile: Profile = {
          id: newId,
          name: incoming.name || email,
          email: email,
          role: incoming.role?.toLowerCase() === 'admin' ? 'admin' : 'member'
        };
        peopleByEmail.set(email, newProfile);
        if (incomingId) {
          aliases[incomingId] = newId;
        }
        aliases[newId] = newId;
      } else if (incomingId && !aliases[incomingId]) {
        // Profile without email
        const newProfile: Profile = {
          id: incomingId,
          name: incoming.name || 'Lab Member',
          email: '',
          role: incoming.role?.toLowerCase() === 'admin' ? 'admin' : 'member'
        };
        aliases[incomingId] = incomingId;
        peopleByEmail.set(incomingId, newProfile);
      }
    };

    // Also link currentUser's ID and email to alias map
    const curEmail = norm(currentUser.email);
    if (curEmail && peopleByEmail.has(curEmail)) {
      const canonical = peopleByEmail.get(curEmail)!;
      aliases[currentUser.id] = canonical.id;
    }

    // Merge savedPeople from localStorage
    const savedPeople = localStorage.getItem('ersl_people');
    if (savedPeople) {
      try {
        const pList = JSON.parse(savedPeople);
        if (Array.isArray(pList)) {
          pList.forEach(item => mergeProfile(item));
        }
      } catch {}
    }

    // Set merged state immediately
    const deduplicatedList = Array.from(peopleByEmail.values());
    setPeople(deduplicatedList);
    setAliasMap({ ...aliases });

    if (!supabase) return;
    try {
      const [t, p] = await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('profiles').select('*').in('role', ['admin', 'member']),
      ]);
      if (t.error) {
        console.warn('Supabase tasks fetch notice:', t.error.message);
      } else if (t.data) {
        // Safe merge: preserve locally created tasks and combine with remote records
        let existingLocal: Task[] = [];
        try {
          const raw = localStorage.getItem('ersl_tasks');
          if (raw) existingLocal = JSON.parse(raw);
        } catch {}

        const remoteIds = new Set(t.data.map((item: any) => item.id));
        const localPreserved = existingLocal.filter(item => !remoteIds.has(item.id));
        const combinedTasks = [...(t.data as Task[]), ...localPreserved];

        setTasks(combinedTasks);
        try {
          localStorage.setItem('ersl_tasks', JSON.stringify(combinedTasks));
        } catch {}
      }
      if (p.data && p.data.length > 0) {
        (p.data as Profile[]).forEach(profile => mergeProfile(profile));
        const finalMerged = Array.from(peopleByEmail.values());
        setPeople(finalMerged);
        setAliasMap({ ...aliases });
        try {
          localStorage.setItem('ersl_workplan_profiles', JSON.stringify(finalMerged));
        } catch {}
      }
    } catch (err) {
      console.warn('Workplan load notice:', err);
    }
  }, [currentUser]);

  useEffect(() => { load(); }, [load]);

  const nameOf = (id: string) => {
    const canonicalId = aliasMap[id] || id;
    const p = people.find(item => item.id === id || item.id === canonicalId);
    return p?.name || p?.email || 'Lab Member';
  };

  const memberStats = useMemo(() => {
    return people.map(p => {
      const pEmail = (p.email || '').trim().toLowerCase();
      const memberTasks = tasks.filter(t => {
        if (t.owner_id === p.id) return true;
        if (aliasMap[t.owner_id] === p.id) return true;
        const ownerPerson = people.find(item => item.id === t.owner_id || aliasMap[t.owner_id] === item.id);
        if (ownerPerson && ownerPerson.email && pEmail && ownerPerson.email.trim().toLowerCase() === pEmail) {
          return true;
        }
        return false;
      });
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
  }, [people, tasks, aliasMap]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setNotificationStatus('');

    const targetOwner = isAdmin ? form.owner_id : currentUser.id;
    const assignedMember = people.find(p => p.id === targetOwner);
    const recipientEmail = assignedMember?.email || 'npurushothaman@ua.edu';
    const recipientName = assignedMember?.name || 'Lab Member';

    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: form.title,
      description: form.description,
      due_date: form.due_date || null,
      owner_id: targetOwner,
      status: 'not_started'
    };

    // Optimistic local add
    setTasks(prev => {
      const updated = [newTask, ...prev];
      localStorage.setItem('ersl_tasks', JSON.stringify(updated));
      return updated;
    });

    if (supabase) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetOwner);
      const uuidToUse = isUuid 
        ? targetOwner 
        : Object.keys(aliasMap).find(k => aliasMap[k] === targetOwner && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(k));
      if (uuidToUse) {
        try {
          const { error: err } = await supabase.from('tasks').insert({
            title: form.title,
            description: form.description,
            due_date: form.due_date || null,
            owner_id: uuidToUse,
            created_by: currentUser.id,
          });
          if (err) setError(err.message);
        } catch (err: any) {
          console.warn('Task insert error:', err);
        }
      }
    }

    // Build standard, professional email content
    const mailSubject = `[ERSL Lab Workplan] New Research Milestone Assigned: ${form.title}`;
    const mailBody = `Hello ${recipientName},\n\nA new research milestone has been assigned to you by Dr. Hongxing Liu on the ERSL Lab Workplan:\n\n• Task: ${form.title}\n• Target Due Date: ${form.due_date || 'No fixed deadline'}\n• Deliverables & Scope: ${form.description || 'Milestone tracking item.'}\n\nPlease visit the ERSL Portal to review instructions and post progress updates:\nhttps://ersl.pages.dev/\n\nBest regards,\nDr. Hongxing Liu\nEnvironmental Remote Sensing Laboratory (ERSL)\nDepartment of Geography and the Environment\nThe University of Alabama`;
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;

    // Set interactive 1-click Outlook/Gmail email prompt
    if (isAdmin && assignedMember) {
      setAssignedEmailPrompt({
        recipientName,
        recipientEmail: recipientEmail,
        taskTitle: form.title,
        dueDate: form.due_date || 'No fixed deadline',
        description: form.description,
        mailtoUrl
      });
      setNotificationStatus(`Milestone assigned to ${recipientName} (${recipientEmail}). Click below to dispatch email!`);

      // Attempt automated background dispatch via webhook or Web3Forms
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: 'b289c8a1-63ee-4be7-8a62-a5f1c93a8d9a',
            subject: mailSubject,
            from_name: 'ERSL Lab Workplan (Dr. Hongxing Liu)',
            to: recipientEmail,
            message: mailBody,
            recipient: recipientEmail,
            task: form.title,
            due: form.due_date
          })
        });
      } catch {
        // Fallback provided by mailto
      }
    }

    setForm({ ...form, title: '', description: '', due_date: '' });
    setIsSubmitting(false);
    load();
  };

  const update = async (id: string, patch: Partial<Task>) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...patch } : t);
      localStorage.setItem('ersl_tasks', JSON.stringify(updated));
      return updated;
    });

    if (activeTaskModal && activeTaskModal.id === id) {
      setActiveTaskModal(prev => prev ? { ...prev, ...patch } : null);
    }

    if (supabase) {
      try {
        await supabase.from('tasks').update(patch).eq('id', id);
      } catch (err) {
        console.warn('Update task error:', err);
      }
    }
  };

  const remove = async (t: Task) => {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    setTasks(prev => {
      const updated = prev.filter(item => item.id !== t.id);
      localStorage.setItem('ersl_tasks', JSON.stringify(updated));
      return updated;
    });
    if (activeTaskModal?.id === t.id) setActiveTaskModal(null);

    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', t.id);
      } catch (err) {
        console.warn('Delete task error:', err);
      }
    }
  };

  const loadComments = useCallback(async (taskId: string) => {
    // 1. Check local storage
    const local = localStorage.getItem(`ersl_comments_${taskId}`);
    const localComments: Comment[] = local ? JSON.parse(local) : [];

    let remoteComments: Comment[] = [];
    if (supabase) {
      try {
        const { data } = await supabase.from('task_comments').select('*').eq('task_id', taskId).order('created_at');
        if (data && data.length > 0) remoteComments = data as Comment[];
      } catch (err) {
        console.warn('Remote comments fetch notice:', err);
      }
    }

    const merged = [...localComments];
    const known = new Set(localComments.map(c => c.id));
    for (const r of remoteComments) {
      if (!known.has(r.id)) merged.push(r);
    }
    merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    setComments(prev => ({ ...prev, [taskId]: merged }));
    localStorage.setItem(`ersl_comments_${taskId}`, JSON.stringify(merged));
  }, []);

  const toggle = (id: string) => {
    if (open === id) setOpen(null);
    else { setOpen(id); loadComments(id); }
  };

  const openDrawerForTask = (task: Task) => {
    setActiveTaskModal(task);
    loadComments(task.id);
  };

  const addComment = async (taskId: string, body: string) => {
    if (!body.trim()) return;

    const newComment: Comment = {
      id: 'comm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      task_id: taskId,
      author_id: currentUser.id,
      author_name: currentUser.name || currentUser.email || 'Lab Member',
      body: body.trim(),
      created_at: new Date().toISOString()
    };

    // Optimistic UI update
    setComments(prev => {
      const current = prev[taskId] || [];
      const updated = [...current, newComment];
      try {
        localStorage.setItem(`ersl_comments_${taskId}`, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage write notice for comments:', err);
      }
      return { ...prev, [taskId]: updated };
    });

    if (supabase) {
      try {
        await supabase.from('task_comments').insert({
          task_id: taskId, 
          author_id: currentUser.id, 
          author_name: currentUser.name || currentUser.email || 'Lab Member', 
          body: body.trim(),
        });
      } catch (err) {
        console.warn('Supabase comment insert notice:', err);
      }
    }
  };

  // Role Scoping: Admin sees filtered selection (or all), members ONLY see their own tasks
  const visible = useMemo(() => {
    if (!isAdmin) {
      const myEmail = (currentUser.email || '').trim().toLowerCase();
      const myCanonicalId = aliasMap[currentUser.id] || currentUser.id;
      return tasks.filter(t => {
        if (t.owner_id === currentUser.id || t.owner_id === myCanonicalId) return true;
        if (aliasMap[t.owner_id] === myCanonicalId) return true;
        const ownerPerson = people.find(p => p.id === t.owner_id || aliasMap[t.owner_id] === p.id);
        if (ownerPerson?.email && myEmail && ownerPerson.email.trim().toLowerCase() === myEmail) {
          return true;
        }
        return false;
      });
    }
    if (filterOwner === 'all') return tasks;
    const targetCanonicalId = aliasMap[filterOwner] || filterOwner;
    const targetPerson = people.find(p => p.id === filterOwner || p.id === targetCanonicalId);
    const targetEmail = targetPerson?.email?.trim().toLowerCase();

    return tasks.filter(t => {
      if (t.owner_id === filterOwner || t.owner_id === targetCanonicalId) return true;
      if (aliasMap[t.owner_id] === targetCanonicalId) return true;
      if (targetEmail) {
        const ownerPerson = people.find(p => p.id === t.owner_id || aliasMap[t.owner_id] === p.id);
        if (ownerPerson?.email && ownerPerson.email.trim().toLowerCase() === targetEmail) {
          return true;
        }
      }
      return false;
    });
  }, [tasks, isAdmin, filterOwner, currentUser.id, currentUser.email, people, aliasMap]);

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
          {isAdmin 
            ? "Dr. Liu / Admin View: Monitor lab-wide milestones, review each researcher's progress metrics, assign tasks, and share figures/documents."
            : `Personal Workspace: Track your research milestones, view feedback from Dr. Liu, and attach papers, plots, and datasets.`
          }
        </p>

        {/* View Switcher: List vs Calendar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="bg-black/20 p-1 rounded-xl inline-flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#9E1B32] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-[#9E1B32] shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          {/* Admin Owner Filter */}
          {isAdmin && (
            <div className="bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs">
              <span className="text-red-200 font-semibold">Filter Member:</span>
              <select
                value={filterOwner}
                onChange={e => setFilterOwner(e.target.value)}
                className="bg-white text-slate-800 font-bold px-2 py-1 rounded-md text-xs cursor-pointer focus:outline-none"
              >
                <option value="all">👥 All Members ({tasks.length} total tasks)</option>
                {people.map(p => (
                  <option key={p.id} value={p.id}>{p.name || p.email}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN ONLY: Clear Executive Summary of Each Team Member's Progress */}
      {isAdmin && memberStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-[#9E1B32]" />
              <h3 className="font-extrabold text-slate-900 text-base">Team Member Progress Overview</h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {memberStats.length} lab researcher{memberStats.length !== 1 ? 's' : ''} tracked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {memberStats.map(stat => (
              <div 
                key={stat.profile.id}
                onClick={() => setFilterOwner(stat.profile.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                  filterOwner === stat.profile.id 
                    ? 'border-[#9E1B32] bg-red-50/20 shadow-xs ring-1 ring-[#9E1B32]' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="truncate">
                    <p className="font-extrabold text-slate-800 text-sm truncate">{stat.profile.name || stat.profile.email}</p>
                    <p className="text-[10px] text-gray-400 truncate">{stat.profile.email}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    stat.percent >= 75 ? 'bg-emerald-100 text-emerald-800' :
                    stat.percent >= 40 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {stat.percent}% done
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-3">
                  <div 
                    className="bg-[#9E1B32] h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${stat.percent}%` }}
                  ></div>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div className="bg-slate-50 p-1 rounded border border-slate-100">
                    <span className="font-extrabold text-slate-800 block text-xs">{stat.total}</span>
                    <span className="text-gray-400">Total</span>
                  </div>
                  <div className="bg-emerald-50 p-1 rounded border border-emerald-100 text-emerald-800">
                    <span className="font-extrabold block text-xs">{stat.completed}</span>
                    <span>Done</span>
                  </div>
                  <div className="bg-blue-50 p-1 rounded border border-blue-100 text-blue-800">
                    <span className="font-extrabold block text-xs">{stat.inProgress}</span>
                    <span>Active</span>
                  </div>
                  <div className="bg-amber-50 p-1 rounded border border-amber-100 text-amber-800">
                    <span className="font-extrabold block text-xs">{stat.discuss}</span>
                    <span>Discuss</span>
                  </div>
                </div>

                {stat.overdue > 0 && (
                  <p className="text-[10px] text-red-600 font-bold mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{stat.overdue} overdue milestone{stat.overdue !== 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Soon Alerts */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Upcoming / Attention Required:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {alerts.map(t => {
                const d = daysUntil(t.due_date);
                return (
                  <li key={t.id}>
                    <span className="font-bold">{t.title}</span> {isAdmin && `(${nameOf(t.owner_id)}) `}
                    {d !== null && d < 0 ? (
                      <span className="text-red-600 font-bold">overdue by {Math.abs(d)} day{Math.abs(d) !== 1 ? 's' : ''}!</span>
                    ) : (
                      <span>due in {d} day{d !== 1 ? 's' : ''}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Notification Banner */}
      {notificationStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{notificationStatus}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotificationStatus('')}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Email Dispatch Card when Dr. Liu assigns a milestone */}
      {assignedEmailPrompt && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 rounded-2xl p-5 shadow-md space-y-3 animate-in slide-in-from-top-2 duration-200 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <Mail className="w-5 h-5 shrink-0" />
              </span>
              <div>
                <h4 className="font-black text-sm text-slate-900">
                  Milestone Assigned to {assignedEmailPrompt.recipientName}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Direct email notification prepared and ready for 1-click dispatch
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setAssignedEmailPrompt(null)} 
              className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer rounded-md hover:bg-emerald-100 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white/90 border border-emerald-200 rounded-xl p-3.5 text-xs space-y-1.5 text-slate-700">
            <p><strong>Milestone:</strong> {assignedEmailPrompt.taskTitle}</p>
            <p><strong>Due Date:</strong> {assignedEmailPrompt.dueDate}</p>
            {assignedEmailPrompt.description && <p><strong>Deliverables:</strong> {assignedEmailPrompt.description}</p>}
            <p className="flex items-center gap-2 pt-0.5">
              <strong>Assigned To:</strong> 
              <span className="font-mono bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 font-bold">
                {assignedEmailPrompt.recipientEmail}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={assignedEmailPrompt.mailtoUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#9E1B32] hover:bg-red-800 text-white font-extrabold text-xs py-2.5 px-5 rounded-lg inline-flex items-center space-x-2 shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>📧 Send Email via Outlook / UA Webmail</span>
            </a>

            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(assignedEmailPrompt.recipientEmail.split(' ')[0])}&su=${encodeURIComponent(`[ERSL Lab Workplan] New Research Milestone Assigned: ${assignedEmailPrompt.taskTitle}`)}&body=${encodeURIComponent(`Hello ${assignedEmailPrompt.recipientName},\n\nA new research milestone has been assigned to you by Dr. Hongxing Liu on the ERSL Lab Workplan:\n\n• Task: ${assignedEmailPrompt.taskTitle}\n• Target Due Date: ${assignedEmailPrompt.dueDate}\n• Scope: ${assignedEmailPrompt.description || 'Milestone tracking item.'}\n\nPlease visit the ERSL Portal:\nhttps://ersl.pages.dev/\n\nBest regards,\nDr. Hongxing Liu\nEnvironmental Remote Sensing Laboratory (ERSL)\nThe University of Alabama`)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-extrabold text-xs py-2.5 px-4 rounded-lg inline-flex items-center space-x-2 shadow-2xs transition-all"
            >
              <span>Send via Gmail Webmail ↗</span>
            </a>
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <form onSubmit={addTask} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 text-left">
        <h3 className="font-extrabold text-base text-slate-800 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-[#9E1B32]" />
          <span>{isAdmin ? 'Assign New Research Milestone' : 'Add Personal Task'}</span>
        </h3>
        {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Milestone Title</label>
            <input 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })}
              required 
              placeholder="e.g. Sentinel-1 SAR flood extent model calibration"
              className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32]" 
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target Due Date</label>
            <input 
              type="date" 
              value={form.due_date} 
              onChange={e => setForm({ ...form, due_date: e.target.value })}
              className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32]" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Task Deliverables & Scope</label>
            <input 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Objectives, validation requirements, and expected outputs..."
              className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32]" 
            />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assignee (Dispatches Email Notification)</label>
              <select 
                value={form.owner_id} 
                onChange={e => setForm({ ...form, owner_id: e.target.value })}
                className="w-full text-xs p-2.5 border rounded-lg focus:outline-none focus:border-[#9E1B32] font-bold text-slate-800 bg-white cursor-pointer"
              >
                {people.map(p => <option key={p.id} value={p.id}>{p.name || p.email} ({p.role})</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center space-x-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating Milestone...' : (isAdmin ? 'Assign Milestone & Send Notification' : 'Create Task')}</span>
          </button>
        </div>
      </form>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <CalendarIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold">No tasks currently scheduled.</p>
              <p className="text-xs text-gray-400 mt-1">Use the form above to add research goals or change filters.</p>
            </div>
          )}

          {visible.map(t => {
            const overdue = daysUntil(t.due_date) !== null && (daysUntil(t.due_date) as number) < 0 && t.status !== 'completed';
            const taskComments = comments[t.id] || [];
            return (
              <div key={t.id} className={`bg-white rounded-xl border shadow-xs p-4 transition-all hover:shadow-md ${overdue ? 'border-red-300 bg-red-50/10' : 'border-gray-200'}`}>
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

                    {/* Chat & Attachments Drawer Button */}
                    <button 
                      onClick={() => openDrawerForTask(t)} 
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center space-x-1.5 text-xs font-bold transition-colors"
                      title="Open Task Discussion, Upload Images, PDFs, or Documents"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#9E1B32]" />
                      <span>Chat & Files</span>
                      {taskComments.length > 0 && (
                        <span className="bg-red-100 text-[#9E1B32] px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                          {taskComments.length}
                        </span>
                      )}
                    </button>

                    <button onClick={() => remove(t)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer" title="Delete Task">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline comment box preview if toggled */}
                {open === t.id && (
                  <div className="mt-3">
                    <CommentBox 
                      list={comments[t.id] || []} 
                      onAdd={body => addComment(t.id, body)} 
                      onPreviewImage={url => setLightboxImageUrl(url)}
                    />
                  </div>
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
                return <div key={`empty-${idx}`} className="h-32 bg-slate-50/50 rounded-xl border border-transparent"></div>;
              }
              const dayTasks = visible.filter(t => t.due_date === item.dateStr);
              const isToday = item.dateStr === new Date().toISOString().slice(0, 10);
              return (
                <div key={item.dateStr} className={`h-32 p-1.5 rounded-xl border flex flex-col justify-start overflow-hidden text-left transition-all ${
                  isToday ? 'border-[#9E1B32] bg-red-50/20' : 'border-gray-100 bg-white'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isToday ? 'bg-[#9E1B32] text-white' : 'text-gray-700'}`}>
                      {item.day}
                    </span>
                    {dayTasks.length > 0 && <span className="text-[9px] font-mono text-gray-400">{dayTasks.length} task(s)</span>}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-24 pr-0.5">
                    {dayTasks.map(t => {
                      const cCount = (comments[t.id] || []).length;
                      return (
                        <div
                          key={t.id}
                          onClick={() => openDrawerForTask(t)}
                          className={`text-[9px] font-bold p-1 rounded border leading-tight truncate cursor-pointer hover:shadow-xs hover:scale-101 transition-all ${STATUS[t.status].cls}`}
                          title={`Click to open Task Chat & Attachments: ${t.title} (${STATUS[t.status].label})`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {isAdmin && <span className="font-extrabold">{nameOf(t.owner_id).split(' ')[0]}: </span>}
                              {t.title}
                            </span>
                            {cCount > 0 && (
                              <span className="ml-1 text-[8px] bg-black/10 px-1 rounded shrink-0">
                                💬{cCount}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DEDICATED TASK DISCUSSION & FILE ATTACHMENTS MODAL DRAWER */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col border border-gray-100 overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-slate-50/70">
              <div className="min-w-0 flex-1 pr-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS[activeTaskModal.status].dot}`}></span>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{activeTaskModal.title}</h3>
                </div>
                {activeTaskModal.description && (
                  <p className="text-xs text-gray-600 mt-1 pl-4 leading-relaxed">{activeTaskModal.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-2 pl-4">
                  <span>👤 Assigned to: <strong className="text-slate-800">{nameOf(activeTaskModal.owner_id)}</strong></span>
                  <span>📅 Due: <strong>{activeTaskModal.due_date || 'None'}</strong></span>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <select 
                  value={activeTaskModal.status} 
                  onChange={e => update(activeTaskModal.id, { status: e.target.value as Status })}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${STATUS[activeTaskModal.status].cls}`}
                >
                  {(Object.keys(STATUS) as Status[]).map(s => <option key={s} value={s}>{STATUS[s].label}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setActiveTaskModal(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Comment and File Box */}
            <div className="p-5 overflow-y-auto flex-1">
              <CommentBox 
                list={comments[activeTaskModal.id] || []} 
                onAdd={body => addComment(activeTaskModal.id, body)}
                onPreviewImage={url => setLightboxImageUrl(url)}
              />
            </div>
          </div>
        </div>
      )}

      {/* FULL-SIZE IMAGE LIGHTBOX MODAL */}
      {lightboxImageUrl && (
        <div 
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={lightboxImageUrl} 
              alt="Full size attachment" 
              className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain border border-white/20" 
            />
            <button
              onClick={() => setLightboxImageUrl(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentBox: React.FC<{ 
  list: Comment[]; 
  onAdd: (b: string) => void;
  onPreviewImage?: (url: string) => void;
}> = ({ list, onAdd, onPreviewImage }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<CommentAttachment[]>([]);
  const [showBoxInput, setShowBoxInput] = useState(false);
  const [boxLink, setBoxLink] = useState('');
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const anyFileInputRef = useRef<HTMLInputElement>(null);

  // Compress images to JPEG (max 1600px, 0.85 quality) to preserve detail while preventing localStorage overflow
  const compressImage = (file: File): Promise<CommentAttachment> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            name: file.name,
            url: reader.result as string,
            type: file.type,
            size: formatFileSize(file.size)
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxWidth = 1600;
        const maxHeight = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const head = 'data:image/jpeg;base64,';
          const sizeBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
          resolve({
            name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
            url: dataUrl,
            type: 'image/jpeg',
            size: formatFileSize(sizeBytes)
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          url: reader.result as string,
          type: file.type,
          size: formatFileSize(file.size)
        });
        reader.readAsDataURL(file);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: file.name,
          url: reader.result as string,
          type: file.type,
          size: formatFileSize(file.size)
        });
        reader.readAsDataURL(file);
      };
      img.src = objectUrl;
    });
  };

  const readFileAttachment = (file: File): Promise<CommentAttachment> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          url: reader.result as string,
          type: file.type || 'application/octet-stream',
          size: formatFileSize(file.size)
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    setFileError('');
    setIsProcessing(true);
    const newItems: CommentAttachment[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Limit file size to 10 MB per file
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds 10MB. For large datasets, please use UA Box.`);
        continue;
      }

      try {
        if (file.type.startsWith('image/')) {
          const item = await compressImage(file);
          newItems.push(item);
        } else {
          const item = await readFileAttachment(file);
          newItems.push(item);
        }
      } catch {
        errors.push(`Failed to attach "${file.name}".`);
      }
    }

    if (errors.length > 0) {
      setFileError(errors.join(' '));
    }
    if (newItems.length > 0) {
      setAttachments(prev => [...prev, ...newItems]);
    }
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (e.target) e.target.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const filesToProcess: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) filesToProcess.push(file);
      }
    }
    if (filesToProcess.length > 0) {
      e.preventDefault();
      await processFiles(filesToProcess);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAttachments = [...attachments];

    if (boxLink.trim()) {
      finalAttachments.push({
        name: 'UA Box Cloud Workspace Item',
        url: boxLink.trim(),
        type: 'box',
        size: 'UA Box Cloud Storage'
      });
    }

    if (!text.trim() && finalAttachments.length === 0) return;

    if (finalAttachments.length > 0) {
      onAdd(JSON.stringify({ 
        text: text.trim(), 
        attachments: finalAttachments 
      }));
    } else {
      onAdd(text.trim());
    }

    setText('');
    setAttachments([]);
    setBoxLink('');
    setShowBoxInput(false);
    setFileError('');
  };

  return (
    <div className="space-y-4 text-xs text-left">
      {/* Existing Comments and File Feed */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {list.length === 0 && (
          <div className="text-center py-6 text-gray-400 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
            <MessageSquare className="w-6 h-6 mx-auto text-gray-300 mb-1" />
            <p className="font-semibold text-xs text-gray-500">No discussion or files shared yet.</p>
            <p className="text-[11px] text-gray-400">Post an update, upload results, or attach PDFs, images, code, and documents below.</p>
          </div>
        )}

        {list.map(c => {
          const parsed = parseCommentContent(c.body);
          const commentAttachments = parsed.attachments;

          return (
            <div key={c.id} className="bg-slate-50 border border-gray-100 rounded-xl p-3.5 space-y-2 hover:bg-slate-50/80 transition-colors shadow-2xs">
              <div className="flex justify-between items-center text-[10px] text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-[9px]">
                    {c.author_name.charAt(0).toUpperCase()}
                  </div>
                  <strong className="text-slate-800 text-xs font-bold">{c.author_name}</strong>
                </div>
                <span>{new Date(c.created_at).toLocaleString()}</span>
              </div>

              {parsed.text && (
                <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap pl-6.5">{parsed.text}</p>
              )}

              {/* Render Attachments */}
              {commentAttachments.length > 0 && (
                <div className="pl-6.5 pt-1 space-y-2">
                  {commentAttachments.map((att, attIdx) => {
                    const { isImage, isPdf, isBox, badge, badgeColor } = getFileCategory(att);

                    if (isImage) {
                      return (
                        <div key={attIdx} className="pt-0.5">
                          <div 
                            onClick={() => onPreviewImage ? onPreviewImage(att.url) : window.open(att.url, '_blank')}
                            className="inline-block group relative cursor-pointer"
                          >
                            <img 
                              src={att.url} 
                              alt={att.name} 
                              className="max-h-56 max-w-full rounded-lg border border-gray-200 shadow-xs object-cover group-hover:opacity-95 transition-opacity" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                                <Maximize2 className="w-3 h-3 text-[#9E1B32]" /> View full image
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 block mt-1 font-semibold">
                              🖼️ {att.name} {att.size && `(${att.size})`}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    if (isPdf) {
                      return (
                        <div key={attIdx} className="inline-flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-red-50/80 hover:bg-red-50 border border-red-200 text-red-950 p-2.5 rounded-xl text-xs transition-all shadow-xs w-full max-w-md">
                          <div className="flex items-center space-x-2.5 truncate">
                            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-[#9E1B32]" />
                            </div>
                            <div className="truncate">
                              <p className="font-bold truncate text-slate-800">{att.name}</p>
                              <span className="text-[10px] text-red-700 font-semibold">PDF Document · {att.size || 'PDF'}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white hover:bg-red-50 text-[#9E1B32] border border-red-200 px-2 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View</span>
                            </a>
                            <a
                              href={att.url}
                              download={att.name}
                              className="bg-[#9E1B32] hover:bg-red-800 text-white px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      );
                    }

                    if (isBox) {
                      return (
                        <div key={attIdx}>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-2 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-blue-900 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-xs"
                          >
                            <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="truncate max-w-xs">{att.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-blue-600 ml-1" />
                          </a>
                        </div>
                      );
                    }

                    // Office, code, datasets, zip, or other documents
                    return (
                      <div key={attIdx} className="inline-flex items-center justify-between gap-3 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-xs w-full max-w-md">
                        <div className="flex items-center space-x-2.5 truncate">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badgeColor}`}>
                            {badge}
                          </span>
                          <span className="truncate text-slate-800">{att.name}</span>
                          {att.size && <span className="text-[10px] text-slate-500 font-normal shrink-0">({att.size})</span>}
                        </div>
                        <a
                          href={att.url}
                          download={att.name}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-gray-100 text-slate-700 border border-gray-300 px-2 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                        >
                          <Download className="w-3 h-3 text-slate-600" />
                          <span>Download</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Attachments Preview Chips */}
      {attachments.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1 border-b border-slate-200">
            <span>📎 Attached Files ({attachments.length}):</span>
            <button 
              type="button" 
              onClick={() => setAttachments([])}
              className="text-red-600 hover:text-red-800 text-[10px] cursor-pointer"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, idx) => {
              const { isImage, isPdf, badge, badgeColor } = getFileCategory(att);
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200 rounded-lg pl-2 pr-1.5 py-1 flex items-center space-x-1.5 text-xs shadow-2xs max-w-xs"
                >
                  {isImage ? (
                    <img src={att.url} alt="" className="w-5 h-5 rounded object-cover border border-slate-200 shrink-0" />
                  ) : isPdf ? (
                    <FileText className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <span className={`text-[8px] font-extrabold px-1 py-0.2 rounded border uppercase shrink-0 ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                  <span className="truncate max-w-[120px] font-semibold text-slate-700 text-[11px]">{att.name}</span>
                  {att.size && <span className="text-[9px] text-slate-400 font-normal shrink-0">({att.size})</span>}
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UA Box Link Input Row */}
      {showBoxInput && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center space-x-2 text-xs">
          <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
          <input
            type="url"
            value={boxLink}
            onChange={e => setBoxLink(e.target.value)}
            placeholder="Paste UA Box file or folder link (e.g. https://ua.box.com/s/...)"
            className="flex-1 p-1.5 border border-blue-200 rounded-lg bg-white text-xs focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => { setShowBoxInput(false); setBoxLink(''); }}
            className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {fileError && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5 text-[11px] font-semibold">
          ⚠️ {fileError}
        </p>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={pdfInputRef}
        onChange={handleFileChange}
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleFileChange}
        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.tsv,.md,.rtf"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={anyFileInputRef}
        onChange={handleFileChange}
        accept="*/*"
        multiple
        className="hidden"
      />

      {/* Interactive Chat Composer & Attachment Action Bar */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border rounded-2xl p-3 bg-white transition-all shadow-xs ${
          isDragging ? 'border-[#9E1B32] ring-2 ring-[#9E1B32]/20 bg-red-50/10' : 'border-gray-200 focus-within:border-[#9E1B32]'
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            onPaste={handlePaste}
            rows={2}
            placeholder="Write a message, paste a screenshot (Ctrl+V), or drag & drop files here..."
            className="w-full text-xs focus:outline-none resize-none leading-relaxed text-slate-800" 
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
            {/* Attachment Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Attach Image Button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isProcessing}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors text-[11px] font-bold flex items-center space-x-1"
                title="Attach photo, plot, or figure (PNG, JPG, WebP)"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Image</span>
              </button>

              {/* Attach PDF Button */}
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={isProcessing}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors text-[11px] font-bold flex items-center space-x-1"
                title="Attach PDF report, manuscript, or paper"
              >
                <FileText className="w-3.5 h-3.5 text-[#9E1B32]" />
                <span>PDF</span>
              </button>

              {/* Attach Document Button */}
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={isProcessing}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors text-[11px] font-bold flex items-center space-x-1"
                title="Attach Word document, Excel spreadsheet, PowerPoint, CSV, or text"
              >
                <FileIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Document</span>
              </button>

              {/* Attach Any File / Code / Data Button */}
              <button
                type="button"
                onClick={() => anyFileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer transition-colors text-[11px] font-bold flex items-center space-x-1"
                title="Attach Python script, GIS data, ZIP archive, or any file"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                <span>All Files</span>
              </button>

              {/* Attach UA Box Link Button */}
              <button
                type="button"
                onClick={() => setShowBoxInput(prev => !prev)}
                className={`px-2.5 py-1.5 border rounded-lg cursor-pointer transition-colors text-[11px] font-bold flex items-center space-x-1 ${
                  showBoxInput || boxLink ? 'bg-blue-100 text-blue-800 border-blue-300' : 'border-gray-200 hover:bg-slate-50 text-slate-700'
                }`}
                title="Attach large datasets via UA Box link"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                <span>UA Box</span>
              </button>
            </div>

            {/* Post Button */}
            <button 
              type="submit"
              disabled={(!text.trim() && attachments.length === 0 && !boxLink.trim()) || isProcessing}
              className="bg-[#9E1B32] hover:bg-red-800 disabled:opacity-40 text-white font-bold px-4 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center space-x-1.5 text-xs shadow-xs"
            >
              <span>{isProcessing ? 'Processing...' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
