import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { initialPeople } from '../data/initialData';
import { ADMIN_EMAILS } from '../lib/supabase';
import { 
  Waves, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Search, 
  Filter, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  ChevronDown,
  X, 
  ArrowUpRight, 
  Sparkles,
  Trophy,
  PartyPopper,
  Heart,
  Layers,
  FileSpreadsheet,
  Check,
  CheckSquare,
  Square,
  Circle,
  Database,
  ArrowRight,
  UserCheck,
  Sliders
} from 'lucide-react';

export interface MemberAllocation {
  memberId: string;
  memberName: string;
  countText: string;
  numericCount: number;
  finishedCount: number;
  completed: boolean;
  notes?: string;
}

export interface CheckItem {
  id: string;
  headerDate?: string;
  text: string;
  completed: boolean;
}

export interface RoundRow {
  id: string;
  round: number | string;
  basinTotalText: string;
  basinNumericTotal: number;
  subBasins: string[];
  finishFormula?: string;
  cumulativeFinished: number;
  allocations: MemberAllocation[];
  deliverDateText: string;
  deliverCompleted: boolean;
  collectDateText: string;
  collectCompleted: boolean;
  checkDateText?: string;
  checkCompleted: boolean;
  checkItems: CheckItem[];
  backupDateText?: string;
  backupCompleted: boolean;
  notes?: string;
}

const STORAGE_KEY = 'ersl_reservoir_project_v2';

// Real baseline data extracted directly from Reservoir_tabel_details.docx (Tables 1 & 2)
export const getInitialRoundData = (): RoundRow[] => [
  {
    id: 'round-1',
    round: 1,
    basinTotalText: 'Total: 168',
    basinNumericTotal: 168,
    subBasins: ['CRB: 168'],
    finishFormula: 'Finish: 168',
    cumulativeFinished: 168,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '40', numericCount: 40, finishedCount: 40, completed: true },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '18', numericCount: 18, finishedCount: 18, completed: true },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '9', numericCount: 9, finishedCount: 9, completed: true },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '9', numericCount: 9, finishedCount: 9, completed: true },
      { memberId: 'person-tian', memberName: 'Dan', countText: '16', numericCount: 16, finishedCount: 16, completed: true }
    ],
    deliverDateText: '✓ -',
    deliverCompleted: true,
    collectDateText: '✓ -',
    collectCompleted: true,
    checkDateText: '✓ -',
    checkCompleted: true,
    checkItems: [],
    backupDateText: '✓ -',
    backupCompleted: true,
    notes: 'Colorado River Basin (CRB) baseline run. 100% completed, QA checked and backed up.'
  },
  {
    id: 'round-2',
    round: 2,
    basinTotalText: 'Total: 210',
    basinNumericTotal: 210,
    subBasins: ['SAGB-Below1km2: 245-35=210'],
    finishFormula: 'Finish: 168+210= 378',
    cumulativeFinished: 378,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '117', numericCount: 117, finishedCount: 117, completed: true },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '47', numericCount: 47, finishedCount: 47, completed: true },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '24', numericCount: 24, finishedCount: 24, completed: true },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '23', numericCount: 23, finishedCount: 23, completed: true },
      { memberId: 'person-tian', memberName: 'Dan', countText: '35', numericCount: 35, finishedCount: 35, completed: true }
    ],
    deliverDateText: '✓ -',
    deliverCompleted: true,
    collectDateText: '✓',
    collectCompleted: true,
    checkDateText: '10/16 & 10/19',
    checkCompleted: false,
    checkItems: [
      { id: 'c2-1', headerDate: '10/16', text: 'Tantu (3094, SAR)', completed: false },
      { id: 'c2-2', headerDate: '10/16', text: 'Anin : 22/23 (find out the missing one)', completed: false },
      { id: 'c2-3', headerDate: '10/19/2026', text: 'Jihee', completed: false },
      { id: 'c2-4', headerDate: '10/19/2026', text: 'Saravanan', completed: false }
    ],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'South Atlantic Gulf Basin (SAGB) Below 1km². Polygon verification underway.'
  },
  {
    id: 'round-3',
    round: 3,
    basinTotalText: 'Total: 35+132=167',
    basinNumericTotal: 167,
    subBasins: ['SAGB-small: 35', 'SAGB-large: 94+19+19=132'],
    finishFormula: 'Finish: 378+35+132= 545',
    cumulativeFinished: 545,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '94', numericCount: 94, finishedCount: 0, completed: false },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '35 (small)', numericCount: 35, finishedCount: 0, completed: false },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '19', numericCount: 19, finishedCount: 0, completed: false },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '19', numericCount: 19, finishedCount: 0, completed: false }
    ],
    deliverDateText: '10/7 Wed',
    deliverCompleted: true,
    collectDateText: '10/19 Mon',
    collectCompleted: false,
    checkDateText: 'Ani: 1302',
    checkCompleted: false,
    checkItems: [
      { id: 'c3-1', text: 'Ani: 1302', completed: false }
    ],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'Active Sprint: SAGB small & large water bodies under optical/SAR processing.'
  },
  {
    id: 'round-4',
    round: 4,
    basinTotalText: 'Total: 65+151=216',
    basinNumericTotal: 216,
    subBasins: ['SAGB-Large: 37+28=65', 'Ohio Region: 151'],
    finishFormula: 'Target: 545+216= 761',
    cumulativeFinished: 761,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '65+31=96', numericCount: 96, finishedCount: 0, completed: false },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-tian', memberName: 'Dan', countText: '40', numericCount: 40, finishedCount: 0, completed: false }
    ],
    deliverDateText: '10/16 Fri',
    deliverCompleted: false,
    collectDateText: '10/26 Mon',
    collectCompleted: false,
    checkDateText: 'Scheduled',
    checkCompleted: false,
    checkItems: [],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'SAGB Large continuation & Ohio River Region initiation.'
  },
  {
    id: 'round-5',
    round: 5,
    basinTotalText: 'Total: 43+174=217',
    basinNumericTotal: 217,
    subBasins: ['Tennessee Region: 43', 'Pacific Northwest Region: 174'],
    finishFormula: 'Target: 761+217= 978',
    cumulativeFinished: 978,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '43+54=97', numericCount: 97, finishedCount: 0, completed: false },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-tian', memberName: 'Dan', countText: '40', numericCount: 40, finishedCount: 0, completed: false }
    ],
    deliverDateText: '10/23 Fri',
    deliverCompleted: false,
    collectDateText: '11/2 Mon',
    collectCompleted: false,
    checkDateText: 'Scheduled',
    checkCompleted: false,
    checkItems: [],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'Tennessee Valley System & Pacific Northwest Region processing.'
  },
  {
    id: 'round-6',
    round: 6,
    basinTotalText: 'Total: 206',
    basinNumericTotal: 206,
    subBasins: ['Upper Mississippi Region: 206'],
    finishFormula: 'Target: 978+206= 1,184',
    cumulativeFinished: 1184,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '100', numericCount: 100, finishedCount: 0, completed: false },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-tian', memberName: 'Dan', countText: '40', numericCount: 40, finishedCount: 0, completed: false }
    ],
    deliverDateText: '10/30 Fri',
    deliverCompleted: false,
    collectDateText: '11/9 Mon',
    collectCompleted: false,
    checkDateText: 'Scheduled',
    checkCompleted: false,
    checkItems: [],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'Upper Mississippi River basin impoundments & oxbow lakes.'
  },
  {
    id: 'round-7',
    round: 7,
    basinTotalText: 'Total: 180 (Planned)',
    basinNumericTotal: 180,
    subBasins: ['Lower Mississippi & Arkansas Basins (Upcoming)'],
    finishFormula: 'Target: 1,184+180= 1,364',
    cumulativeFinished: 1364,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '100', numericCount: 100, finishedCount: 0, completed: false },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false }
    ],
    deliverDateText: '11/6 Fri',
    deliverCompleted: false,
    collectDateText: '11/16 Mon',
    collectCompleted: false,
    checkDateText: 'Upcoming',
    checkCompleted: false,
    checkItems: [],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'Sprint 7 Planned allocation schedule.'
  },
  {
    id: 'round-8',
    round: 8,
    basinTotalText: 'Total: 180 (Planned)',
    basinNumericTotal: 180,
    subBasins: ['Missouri & Rio Grande Basins (Upcoming)'],
    finishFormula: 'Target: 1,364+180= 1,544',
    cumulativeFinished: 1544,
    allocations: [
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '100', numericCount: 100, finishedCount: 0, completed: false },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false }
    ],
    deliverDateText: '11/13 Fri',
    deliverCompleted: false,
    collectDateText: '11/24 Tue',
    collectCompleted: false,
    checkDateText: 'Upcoming',
    checkCompleted: false,
    checkItems: [],
    backupDateText: 'Pending',
    backupCompleted: false,
    notes: 'Sprint 8 Planned allocation schedule.'
  }
];

const sanitizeRounds = (data: any[]): RoundRow[] => {
  return data.map(r => ({
    ...r,
    allocations: (r.allocations || []).map((a: any) => ({
      ...a,
      finishedCount: typeof a.finishedCount === 'number' ? a.finishedCount : (a.completed ? a.numericCount : 0)
    }))
  }));
};

const CONGRATULATION_TEMPLATES = [
  (name: string, round: string | number, count: number) => ({
    headline: "🎉 Outstanding Milestone Reached!",
    subhead: "Precision & Dedication at its Finest",
    body: `Incredible work, ${name}! You have successfully completed all ${count.toLocaleString()} assigned samples in Round ${round}. Dr. Hongxing Liu and the ERSL research team celebrate your dedication!`
  }),
  (name: string, round: string | number, count: number) => ({
    headline: "🌟 Phenomenal Achievement!",
    subhead: "Target Crushed with 100% Precision",
    body: `Bravo, ${name}! You've powered through ${count.toLocaleString()} reservoirs in Round ${round}. Your polygon delineation brings our national surface water database closer to completion!`
  }),
  (name: string, round: string | number, count: number) => ({
    headline: "🏆 Hats Off to You, Scholar!",
    subhead: "A Huge Win for the ERSL Lab",
    body: `Sensational performance, ${name}! Completing ${count.toLocaleString()} water bodies in Round ${round} reflects true scientific diligence. Thank you for your tireless contribution to our lab!`
  })
];

export const ReservoirProject: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const isEmailAdmin = ADMIN_EMAILS.some(e => e.toLowerCase().trim() === userEmail);
  const isRoleAdmin = currentUser?.role === 'Admin' || currentUser?.role?.toLowerCase() === 'admin';

  // Toggle for Admin Edit Mode (allows switching between Admin Mode and Member Mode)
  const [adminMode, setAdminMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ersl_reservoir_admin_mode');
    if (saved !== null) return saved === 'true';
    return false; // Default to member mode so members experience sample progress editing
  });

  const isAdmin = isEmailAdmin || isRoleAdmin || adminMode;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // View Mode: 'protocol' (Table 2 Format Table) vs 'matrix' (Member Columns Grid)
  const [viewMode, setViewMode] = useState<'protocol' | 'matrix'>('protocol');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState<string>('all');

  // Congratulations modal
  const [congratsModal, setCongratsModal] = useState<{
    isOpen: boolean;
    memberName: string;
    round: string | number;
    count: number;
    message: { headline: string; subhead: string; body: string };
  } | null>(null);

  const triggerCongrats = (memberName: string, round: string | number, count: number) => {
    const randomIndex = Math.floor(Math.random() * CONGRATULATION_TEMPLATES.length);
    const selectedTemplate = CONGRATULATION_TEMPLATES[randomIndex];
    const message = selectedTemplate(memberName, round, count);

    setCongratsModal({
      isOpen: true,
      memberName,
      round,
      count,
      message
    });
  };

  // Load round data from localStorage (persisted across edits, never reset automatically)
  const [rounds, setRounds] = useState<RoundRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeRounds(parsed);
      }
    } catch (e) {
      console.error('Failed to parse saved reservoir round data', e);
    }
    return getInitialRoundData();
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
    } catch (e) {
      console.error('Failed to persist reservoir round data', e);
    }
  }, [rounds]);

  // Distinct members list
  const teamMembers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email?: string; image?: string; role?: string }>();
    
    const known = [
      { id: 'person-raju', name: 'Saravanan Raju', shortName: 'Saravanan' },
      { id: 'person-seo', name: 'Jihee Seo', shortName: 'Jihee' },
      { id: 'person-mandal', name: 'Tantu Mandal', shortName: 'Tantu' },
      { id: 'person-palaparthi', name: 'Anindya Palaparthi', shortName: 'Anindya' },
      { id: 'person-tian', name: 'Dr. Dan Tian', shortName: 'Dan' }
    ];

    known.forEach(k => {
      const p = initialPeople.find(person => person.id === k.id || person.name.toLowerCase().includes(k.shortName.toLowerCase()));
      map.set(k.shortName.toLowerCase(), {
        id: p?.id || k.id,
        name: p?.name || k.name,
        email: p?.email,
        image: p?.image,
        role: p?.role || 'Research Scientist'
      });
    });

    return map;
  }, []);

  // Compute Overall Stats
  const stats = useMemo(() => {
    let grandAllocated = 0;
    let grandFinished = 0;
    let completedRounds = 0;
    let activeRounds = 0;

    const memberProgress: Record<string, {
      name: string;
      assigned: number;
      finished: number;
      tasksCount: number;
      completedTasks: number;
    }> = {
      'Saravanan': { name: 'Saravanan Raju', assigned: 0, finished: 0, tasksCount: 0, completedTasks: 0 },
      'Jihee': { name: 'Jihee Seo', assigned: 0, finished: 0, tasksCount: 0, completedTasks: 0 },
      'Tantu': { name: 'Tantu Mandal', assigned: 0, finished: 0, tasksCount: 0, completedTasks: 0 },
      'Anindya': { name: 'Anindya Palaparthi', assigned: 0, finished: 0, tasksCount: 0, completedTasks: 0 },
      'Dan': { name: 'Dr. Dan Tian', assigned: 0, finished: 0, tasksCount: 0, completedTasks: 0 }
    };

    rounds.forEach(r => {
      grandAllocated += r.basinNumericTotal || 0;
      
      const isRoundAllCompleted = r.allocations.length > 0 && r.allocations.every(a => a.completed);
      if (isRoundAllCompleted) {
        completedRounds++;
      } else {
        activeRounds++;
      }

      // Sum individual member completed counts
      r.allocations.forEach(a => {
        grandFinished += a.finishedCount || 0;

        const key = a.memberName.split(' ')[0];
        if (!memberProgress[key]) {
          memberProgress[key] = {
            name: a.memberName,
            assigned: 0,
            finished: 0,
            tasksCount: 0,
            completedTasks: 0
          };
        }
        memberProgress[key].assigned += a.numericCount || 0;
        memberProgress[key].finished += a.finishedCount || 0;
        memberProgress[key].tasksCount++;
        if (a.completed) {
          memberProgress[key].completedTasks++;
        }
      });
    });

    const completionRate = grandAllocated > 0 ? Math.round((grandFinished / grandAllocated) * 100) : 0;

    return {
      grandAllocated,
      grandFinished,
      completedRounds,
      activeRounds,
      completionRate,
      memberProgress
    };
  }, [rounds]);

  // Filtered rows
  const filteredRounds = useMemo(() => {
    return rounds.filter(r => {
      const matchesSearch = 
        `Round ${r.round}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.basinTotalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subBasins.some(sb => sb.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterMember !== 'all') {
        const hasMember = r.allocations.some(a => a.memberName.toLowerCase().includes(filterMember.toLowerCase()));
        if (!hasMember) return false;
      }

      return true;
    });
  }, [rounds, searchQuery, filterMember]);

  // =========================================================================
  // MEMBER SAMPLE & PROCESS COMPLETION MODAL STATE
  // Editable in BOTH Member Mode and Admin Mode
  // =========================================================================
  const [sampleModal, setSampleModal] = useState<{
    roundId: string;
    roundNum: number | string;
    basinName: string;
    memberId: string;
    memberName: string;
    numericCount: number;
    finishedCount: number;
    completed: boolean;
    notes?: string;
  } | null>(null);

  const handleOpenSampleModal = (r: RoundRow, a: MemberAllocation) => {
    setSampleModal({
      roundId: r.id,
      roundNum: r.round,
      basinName: r.basinTotalText,
      memberId: a.memberId,
      memberName: a.memberName,
      numericCount: a.numericCount,
      finishedCount: a.finishedCount,
      completed: a.completed,
      notes: a.notes || ''
    });
  };

  const handleSaveSampleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleModal) return;

    const isNewlyCompleted = 
      (sampleModal.completed || sampleModal.finishedCount >= sampleModal.numericCount) && 
      sampleModal.numericCount > 0;

    setRounds(prev => prev.map(r => {
      if (r.id !== sampleModal.roundId) return r;
      return {
        ...r,
        allocations: r.allocations.map(a => {
          if (a.memberName.toLowerCase() === sampleModal.memberName.toLowerCase()) {
            const isDone = sampleModal.completed || (sampleModal.finishedCount >= sampleModal.numericCount && sampleModal.numericCount > 0);
            return {
              ...a,
              finishedCount: Math.max(0, sampleModal.finishedCount),
              completed: isDone,
              notes: sampleModal.notes
            };
          }
          return a;
        })
      };
    }));

    const memberName = sampleModal.memberName;
    const roundNum = sampleModal.roundNum;
    const finishedCount = sampleModal.finishedCount;

    setSampleModal(null);
    showToast(`Updated sample progress for ${memberName} in Round ${roundNum}!`);

    if (isNewlyCompleted) {
      setTimeout(() => {
        triggerCongrats(memberName, roundNum, finishedCount);
      }, 250);
    }
  };

  // Toggle member allocation checkmark directly
  const handleToggleMemberCompletion = (roundId: string, memberName: string) => {
    setRounds(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      let targetFinishedCount = 0;
      let targetAllocatedName = '';
      let isNewlyDone = false;

      const updatedAllocations = r.allocations.map(a => {
        if (a.memberName.toLowerCase() === memberName.toLowerCase()) {
          const nextVal = !a.completed;
          const updatedFinished = nextVal ? a.numericCount : 0;
          if (nextVal) {
            isNewlyDone = true;
            targetFinishedCount = a.numericCount;
            targetAllocatedName = a.memberName;
          }
          return { 
            ...a, 
            completed: nextVal,
            finishedCount: updatedFinished 
          };
        }
        return a;
      });

      if (isNewlyDone) {
        setTimeout(() => {
          triggerCongrats(targetAllocatedName, r.round, targetFinishedCount);
        }, 200);
      }

      return {
        ...r,
        allocations: updatedAllocations
      };
    }));
  };

  // Admin toggles (Delivery, Collection, QA Check, Backup)
  const handleToggleDeliver = (roundId: string) => {
    if (!isAdmin) {
      showToast('Delivery status is managed in Admin Mode.');
      return;
    }
    setRounds(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      return { ...r, deliverCompleted: !r.deliverCompleted };
    }));
  };

  const handleToggleCollect = (roundId: string) => {
    if (!isAdmin) {
      showToast('Collection status is managed in Admin Mode.');
      return;
    }
    setRounds(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      return { ...r, collectCompleted: !r.collectCompleted };
    }));
  };

  const handleToggleCheckItem = (roundId: string, itemId: string) => {
    if (!isAdmin) {
      showToast('QA/QC verification checkpoints are signed off in Admin Mode.');
      return;
    }
    setRounds(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const updatedItems = r.checkItems.map(item => {
        if (item.id === itemId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      const allDone = updatedItems.length > 0 && updatedItems.every(i => i.completed);
      return {
        ...r,
        checkItems: updatedItems,
        checkCompleted: allDone
      };
    }));
  };

  const handleToggleBackup = (roundId: string) => {
    if (!isAdmin) {
      showToast('Backup archive status is verified in Admin Mode.');
      return;
    }
    setRounds(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      return { ...r, backupCompleted: !r.backupCompleted };
    }));
  };

  // Modal: Edit Round State (Admin Mode)
  const [editingRound, setEditingRound] = useState<RoundRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenEditRound = (r: RoundRow) => {
    setEditingRound(JSON.parse(JSON.stringify(r)));
    setIsEditModalOpen(true);
  };

  const handleSaveEditRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRound) return;
    setRounds(prev => prev.map(r => r.id === editingRound.id ? editingRound : r));
    setIsEditModalOpen(false);
    setEditingRound(null);
    showToast(`Round ${editingRound.round} successfully updated!`);
  };

  // Modal: Add New Round State (Admin Mode)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoundForm, setNewRoundForm] = useState<{
    round: number;
    basinTotal: string;
    numericTotal: number;
    subBasinsText: string;
    finishFormula: string;
    deliverDate: string;
    collectDate: string;
    checkDate: string;
    notes: string;
    saravananCount: string;
    jiheeCount: string;
    tantuCount: string;
    anindyaCount: string;
    danCount: string;
  }>({
    round: rounds.length + 1,
    basinTotal: 'Total: 200',
    numericTotal: 200,
    subBasinsText: 'Lower Mississippi Tributaries: 200',
    finishFormula: 'Target: +200 reservoirs',
    deliverDate: '11/20 Fri',
    collectDate: '12/1 Tue',
    checkDate: 'Scheduled',
    notes: 'Next scheduled continental watershed processing sprint.',
    saravananCount: '100',
    jiheeCount: '40',
    tantuCount: '20',
    anindyaCount: '20',
    danCount: '20'
  });

  const handleOpenAddRound = () => {
    setNewRoundForm({
      round: rounds.length + 1,
      basinTotal: 'Total: 200',
      numericTotal: 200,
      subBasinsText: 'Continental Expansion Region: 200',
      finishFormula: `Target: +200 reservoirs`,
      deliverDate: '11/20 Fri',
      collectDate: '12/1 Tue',
      checkDate: 'Scheduled',
      notes: '',
      saravananCount: '100',
      jiheeCount: '40',
      tantuCount: '20',
      anindyaCount: '20',
      danCount: '20'
    });
    setIsAddModalOpen(true);
  };

  const handleCreateRound = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `round-${Date.now()}`;
    const subBasinsList = newRoundForm.subBasinsText.split('\n').map(s => s.trim()).filter(Boolean);

    const allocations: MemberAllocation[] = [];
    if (newRoundForm.saravananCount) allocations.push({ memberId: 'person-raju', memberName: 'Saravanan', countText: newRoundForm.saravananCount, numericCount: parseInt(newRoundForm.saravananCount) || 0, finishedCount: 0, completed: false });
    if (newRoundForm.jiheeCount) allocations.push({ memberId: 'person-seo', memberName: 'Jihee', countText: newRoundForm.jiheeCount, numericCount: parseInt(newRoundForm.jiheeCount) || 0, finishedCount: 0, completed: false });
    if (newRoundForm.tantuCount) allocations.push({ memberId: 'person-mandal', memberName: 'Tantu', countText: newRoundForm.tantuCount, numericCount: parseInt(newRoundForm.tantuCount) || 0, finishedCount: 0, completed: false });
    if (newRoundForm.anindyaCount) allocations.push({ memberId: 'person-palaparthi', memberName: 'Anindya', countText: newRoundForm.anindyaCount, numericCount: parseInt(newRoundForm.anindyaCount) || 0, finishedCount: 0, completed: false });
    if (newRoundForm.danCount) allocations.push({ memberId: 'person-tian', memberName: 'Dan', countText: newRoundForm.danCount, numericCount: parseInt(newRoundForm.danCount) || 0, finishedCount: 0, completed: false });

    const newRow: RoundRow = {
      id: newId,
      round: newRoundForm.round,
      basinTotalText: newRoundForm.basinTotal,
      basinNumericTotal: newRoundForm.numericTotal,
      subBasins: subBasinsList.length > 0 ? subBasinsList : [newRoundForm.subBasinsText],
      finishFormula: newRoundForm.finishFormula,
      cumulativeFinished: (rounds[rounds.length - 1]?.cumulativeFinished || 0) + newRoundForm.numericTotal,
      allocations,
      deliverDateText: newRoundForm.deliverDate,
      deliverCompleted: false,
      collectDateText: newRoundForm.collectDate,
      collectCompleted: false,
      checkDateText: newRoundForm.checkDate,
      checkCompleted: false,
      checkItems: [],
      backupDateText: 'Pending',
      backupCompleted: false,
      notes: newRoundForm.notes
    };

    setRounds(prev => [...prev, newRow]);
    setIsAddModalOpen(false);
    showToast(`Added Round ${newRow.round} to schedule table!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Round', 'Basin Details', 'Cumulative Finish', 'Member Allocations', 'Deliver Date', 'Deliver Done', 'Collect Date', 'Collect Done', 'Check Date & QA Notes', 'Backup Date'];
    
    const rows = rounds.map(r => {
      const basinStr = `"${r.basinTotalText} | ${r.subBasins.join('; ')}"`;
      const finishStr = `"${r.finishFormula || r.cumulativeFinished}"`;
      const allocStr = `"${r.allocations.map(a => `${a.memberName}: ${a.finishedCount}/${a.numericCount} [${a.completed ? 'DONE' : 'IN_PROGRESS'}]`).join(', ')}"`;
      const deliverDone = r.deliverCompleted ? 'Yes' : 'No';
      const collectDone = r.collectCompleted ? 'Yes' : 'No';
      const checkNotes = `"${r.checkDateText || ''} ${r.checkItems.map(i => `${i.headerDate ? i.headerDate + ': ' : ''}${i.text}`).join('; ')}"`;
      const backupStr = r.backupCompleted ? 'Backed Up' : 'Pending';

      return [r.round, basinStr, finishStr, allocStr, `"${r.deliverDateText}"`, deliverDone, `"${r.collectDateText}"`, collectDone, checkNotes, backupStr].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ERSL_Reservoir_Allocation_Protocol_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[70] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOP BANNER: ERSL RESERVOIR DATA ALLOCATION & DELINEATION PROTOCOL
          ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Waves className="w-96 h-96 text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-widest uppercase bg-[#9E1B32] text-white border border-red-400/30">
                ERSL Research Operations
              </span>
              <span className="flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                PI: Dr. Hongxing Liu
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Waves className="w-8 h-8 text-cyan-400" />
              National Reservoir Delineation Protocol Table
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Official ERSL sprint allocation matrix tracking round-by-round basin delivery, team member allocation counts, collection dates, and QA/QC verification status.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Toggle Switch: Admin Mode vs Member Mode */}
            <button
              type="button"
              onClick={() => {
                const next = !adminMode;
                setAdminMode(next);
                localStorage.setItem('ersl_reservoir_admin_mode', String(next));
                showToast(next ? 'Admin Mode Active — All Sections Fully Editable' : 'Member Mode Active — Sample & Progress Editing Enabled');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                isAdmin 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30' 
                  : 'bg-indigo-700 hover:bg-indigo-600 text-white border-indigo-500 shadow-sm'
              }`}
              title="Click to toggle between Admin Full Editing Mode and Member Progress Mode"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>Admin Mode: Full Edit (All Sections)</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-indigo-200" />
                  <span>Member Mode: Edit Samples & Progress</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm cursor-pointer"
              title="Download allocation matrix as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export CSV
            </button>

            {isAdmin && (
              <button
                onClick={handleOpenAddRound}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Add Round
              </button>
            )}
          </div>
        </div>

        {/* Milestone Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reservoirs Allocated</span>
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {stats.grandAllocated.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                across {rounds.length} rounds
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.completionRate)}%` }}
              />
            </div>
            <span className="text-[11px] text-cyan-400 font-bold mt-1.5 inline-block">
              {stats.grandFinished.toLocaleString()} completed ({stats.completionRate}%)
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Baseline</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                545
              </span>
              <span className="text-xs text-slate-400 font-medium">
                in Rounds 1–3
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 font-medium">
              CRB (168) + SAGB Below 1km² (210) + SAGB Large/Small (167)
            </p>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
              Archived & Persistent in Database
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Active Sprint</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">
                Round 3 & 4
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-300">
              Delivery: <strong>10/7 & 10/16</strong> · Collect: <strong>10/19 & 10/26</strong>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">
              Verification in Progress
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QA/QC Checkpoints</span>
              <ShieldCheck className="w-4 h-4 text-[#9E1B32]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {rounds.reduce((acc, r) => acc + r.checkItems.filter(i => !i.completed).length, 0)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                QA tasks pending review
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 font-medium">
              Includes Tantu 3094, Anin 22/23 & Ani 1302
            </p>
            <span className="text-[11px] text-rose-300 font-bold mt-1 inline-block">
              Dr. Liu Verification Ready
            </span>
          </div>

        </div>
      </div>

      {/* Mode Guidance Alert Banner */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
        isAdmin 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-indigo-50 border-indigo-200 text-indigo-900'
      }`}>
        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <Sliders className="w-5 h-5 text-indigo-600 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isAdmin ? 'Admin Mode is Active:' : 'Member Mode is Active:'}
            </span>{' '}
            {isAdmin 
              ? 'You have full editing permissions across all sections: Basin definitions, dates, check items, allocations, and new rounds.'
              : 'You can update completed sample counts and toggle process completion in the "Number" column. Administrative structural settings remain protected.'
            }
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !adminMode;
            setAdminMode(next);
            localStorage.setItem('ersl_reservoir_admin_mode', String(next));
          }}
          className={`px-3 py-1 rounded-lg font-bold text-[11px] shrink-0 border cursor-pointer ${
            isAdmin
              ? 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-white text-indigo-800 border-indigo-300 hover:bg-indigo-100'
          }`}
        >
          Switch to {isAdmin ? 'Member Mode' : 'Admin Mode'}
        </button>
      </div>

      {/* =========================================================================
          TEAM MEMBER PROCESSING VELOCITY CARDS (Saravanan, Jihee, Tantu, Anindya, Dan)
          ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#9E1B32]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Research Team Member Allocation & Progress Tally
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Click on a researcher card to filter their assignments across all rounds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Object.entries(stats.memberProgress).map(([shortName, p]) => {
            const memberInfo = teamMembers.get(shortName.toLowerCase());
            const pct = p.assigned > 0 ? Math.round((p.finished / p.assigned) * 100) : 0;
            const isSelected = filterMember.toLowerCase() === shortName.toLowerCase();

            return (
              <div 
                key={shortName}
                onClick={() => setFilterMember(isSelected ? 'all' : shortName)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-[#9E1B32] ring-2 ring-[#9E1B32]/30 bg-red-50/60 shadow-md' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
                title={isSelected ? "Click to clear filter and show all" : `Click to filter table for ${shortName}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm overflow-hidden border border-red-300/40">
                    {memberInfo?.image ? (
                      <img src={memberInfo.image} alt={shortName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{shortName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {shortName}
                    </p>
                  </div>
                  <span className="text-xs font-black text-slate-800 shrink-0">
                    {pct}%
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-semibold text-slate-500">Samples Done</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {p.finished.toLocaleString()} / {p.assigned.toLocaleString()}
                  </span>
                </div>

                <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#9E1B32] h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Rounds Complete:</span>
                  <span className="font-bold text-slate-700">{p.completedTasks} / {p.tasksCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CONTROLS BAR: SEARCH, MEMBER FILTER & VIEW TOGGLE
          ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Basin, Round #, or region name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/20 focus:border-[#9E1B32]"
          />
        </div>

        {/* Member filter & View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Member:</span>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
            >
              <option value="all">All Researchers</option>
              <option value="Saravanan">Saravanan Raju</option>
              <option value="Jihee">Jihee Seo</option>
              <option value="Tantu">Tantu Mandal</option>
              <option value="Anindya">Anindya Palaparthi</option>
              <option value="Dan">Dr. Dan Tian</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('protocol')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'protocol'
                  ? 'bg-white text-[#9E1B32] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schedule Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-[#9E1B32] shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matrix Grid
            </button>
          </div>

          {(searchQuery || filterMember !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterMember('all');
              }}
              className="text-xs text-rose-600 font-bold hover:underline px-2 py-1"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* =========================================================================
          THE MAIN INTERACTIVE TABLE: PROTOCOL TABLE
          Columns: Round | Basin | Number | Diliver date | Collect date | Check date | Backup date
          ========================================================================= */}
      {viewMode === 'protocol' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Table Header Info */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center gap-2 flex-wrap">
                <span>Reservoir Allocation & Delineation Schedule</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {filteredRounds.length} Rounds
                </span>
                {filterMember !== 'all' && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#9E1B32] text-white flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Filtered: {filterMember}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin 
                  ? 'Admin Mode: All columns and dates are editable. Click any checkmark, sample count, or edit icon.' 
                  : 'Member Mode: Click any member row or sample count in the "Number" column to update completed samples and toggle completion.'
                }
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-700 flex items-center justify-center text-white text-[9px] font-bold">✓</span>
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-400 bg-white"></span>
                In Progress / Pending
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-xs font-black border-b border-slate-200">
                  <th className="py-3.5 px-4 w-16 text-center border-r border-slate-200">Round</th>
                  <th className="py-3.5 px-4 w-72 border-r border-slate-200">Basin & Cumulative Finish</th>
                  <th className="py-3.5 px-4 min-w-[270px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Number (Team Allocation & Samples)</span>
                      <span className="text-[10px] text-[#9E1B32] font-extrabold uppercase bg-red-100 px-1.5 py-0.5 rounded">
                        Editable
                      </span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 w-36 border-r border-slate-200">Diliver date</th>
                  <th className="py-3.5 px-4 w-36 border-r border-slate-200">Collect date</th>
                  <th className="py-3.5 px-4 min-w-[220px] border-r border-slate-200">Check date</th>
                  <th className="py-3.5 px-4 w-32 border-r border-slate-200">Backup date</th>
                  {isAdmin && (
                    <th className="py-3.5 px-2 w-12 text-center text-slate-400">Actions</th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRounds.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400 font-medium">
                      No rounds found matching the search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRounds.map((r, index) => {
                    const isAllMembersDone = r.allocations.length > 0 && r.allocations.every(a => a.completed);

                    return (
                      <tr 
                        key={r.id} 
                        className={`transition-colors hover:bg-slate-50/70 ${
                          isAllMembersDone ? 'bg-purple-50/20' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        {/* 1. Round */}
                        <td className="py-4 px-4 text-center font-black text-sm text-slate-900 border-r border-slate-200 align-top">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 border border-slate-300 font-black text-slate-800">
                            {r.round}
                          </span>
                        </td>

                        {/* 2. Basin */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 text-xs">
                              {r.basinTotalText}
                            </span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditRound(r)}
                                className="text-slate-400 hover:text-[#9E1B32] p-0.5 rounded cursor-pointer"
                                title="Edit basin details"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Sub-basins list */}
                          <div className="space-y-1">
                            {r.subBasins.map((sb, i) => (
                              <div key={i} className="text-slate-700 text-xs flex items-start gap-1.5">
                                <span className="text-slate-400">•</span>
                                <span className="font-medium">{sb}</span>
                              </div>
                            ))}
                          </div>

                          {/* Finish Cumulative */}
                          {r.finishFormula && (
                            <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                              <span className="text-[11px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                                {r.finishFormula}
                              </span>
                            </div>
                          )}

                          {r.notes && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-2" title={r.notes}>
                              {r.notes}
                            </p>
                          )}
                        </td>

                        {/* 3. Number (Team Allocations - Editable for process completion & sample count) */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top space-y-2">
                          <div className="space-y-2">
                            {r.allocations.map((a, aIdx) => {
                              const isMemberHighlighted = filterMember !== 'all' && a.memberName.toLowerCase().includes(filterMember.toLowerCase());
                              const is100Pct = a.completed || (a.numericCount > 0 && a.finishedCount >= a.numericCount);

                              return (
                                <div 
                                  key={aIdx} 
                                  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-all ${
                                    isMemberHighlighted
                                      ? 'bg-red-50 border-red-300 ring-1 ring-[#9E1B32]/30 font-bold'
                                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs'
                                  }`}
                                >
                                  {/* Purple circular checkbox (toggle complete) */}
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleMemberCompletion(r.id, a.memberName);
                                    }}
                                    className="shrink-0 cursor-pointer p-0.5"
                                    title={a.completed ? "Click to set in-progress" : "Click to mark complete"}
                                  >
                                    {is100Pct ? (
                                      <div className="w-5 h-5 rounded-full bg-purple-700 flex items-center justify-center text-white shadow-xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 bg-white hover:border-purple-600 transition-colors" />
                                    )}
                                  </div>

                                  {/* Member name and sample count pill */}
                                  <div 
                                    onClick={() => handleOpenSampleModal(r, a)}
                                    className="flex items-center justify-between flex-1 text-xs cursor-pointer hover:text-[#9E1B32] transition-colors"
                                    title="Click to update completed samples count or task notes"
                                  >
                                    <span className={`font-bold ${is100Pct ? 'text-slate-900' : 'text-slate-800'}`}>
                                      {a.memberName}:
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-mono text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                                        is100Pct 
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                          : a.finishedCount > 0
                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                            : 'bg-white text-slate-800 border-slate-300'
                                      }`}>
                                        {a.finishedCount} / {a.countText}
                                      </span>
                                      <Edit3 className="w-3 h-3 text-slate-400 hover:text-[#9E1B32]" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* 4. Diliver date */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top">
                          <div 
                            onClick={() => handleToggleDeliver(r.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                              isAdmin ? 'cursor-pointer hover:bg-slate-100/70' : 'cursor-default'
                            }`}
                            title={isAdmin ? "Click to toggle delivery status (Admin)" : "Delivery Date"}
                          >
                            <div className="shrink-0">
                              {r.deliverCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-purple-700 flex items-center justify-center text-white shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-400 bg-white" />
                              )}
                            </div>
                            <span className={`text-xs font-bold ${r.deliverCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {r.deliverDateText}
                            </span>
                          </div>
                        </td>

                        {/* 5. Collect date */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top">
                          <div 
                            onClick={() => handleToggleCollect(r.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                              isAdmin ? 'cursor-pointer hover:bg-slate-100/70' : 'cursor-default'
                            }`}
                            title={isAdmin ? "Click to toggle collection status (Admin)" : "Collect Date"}
                          >
                            <div className="shrink-0">
                              {r.collectCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-400 bg-white" />
                              )}
                            </div>
                            <span className={`text-xs font-bold ${r.collectCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {r.collectDateText}
                            </span>
                          </div>
                        </td>

                        {/* 6. Check date (QA/QC Checkpoints) */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top space-y-2">
                          {r.checkItems.length > 0 ? (
                            <div className="space-y-1.5">
                              {r.checkItems.map((item) => (
                                <div 
                                  key={item.id} 
                                  onClick={() => handleToggleCheckItem(r.id, item.id)}
                                  className={`flex items-start gap-2 p-1 rounded-md transition-colors ${
                                    isAdmin ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'
                                  }`}
                                  title={isAdmin ? "Click to toggle QA check item (Admin)" : "QA/QC Item"}
                                >
                                  <div className="shrink-0 mt-0.5">
                                    {item.completed ? (
                                      <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px]">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-4 h-4 rounded-full border border-slate-400 bg-white" />
                                    )}
                                  </div>
                                  <div className="text-[11px] leading-tight">
                                    {item.headerDate && (
                                      <span className="font-extrabold text-[#9E1B32] block">{item.headerDate}</span>
                                    )}
                                    <span className={`${item.completed ? 'line-through text-slate-400' : 'font-medium text-slate-800'}`}>
                                      {item.text}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {r.checkCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-400 bg-white" />
                              )}
                              <span className="text-xs font-medium text-slate-600">
                                {r.checkDateText || '-'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 7. Backup date */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top">
                          <div 
                            onClick={() => handleToggleBackup(r.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                              isAdmin ? 'cursor-pointer hover:bg-slate-100/70' : 'cursor-default'
                            }`}
                            title={isAdmin ? "Click to toggle backup status (Admin)" : "Backup Date"}
                          >
                            <div className="shrink-0">
                              {r.backupCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-400 bg-white" />
                              )}
                            </div>
                            <span className={`text-xs font-bold ${r.backupCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {r.backupDateText || (r.backupCompleted ? '✓ Done' : 'Pending')}
                            </span>
                          </div>
                        </td>

                        {/* 8. Admin Edit */}
                        {isAdmin && (
                          <td className="py-4 px-2 text-center align-top">
                            <button
                              type="button"
                              onClick={() => handleOpenEditRound(r)}
                              className="p-1.5 rounded text-slate-400 hover:text-[#9E1B32] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Edit all sections of this round"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Grand Total Footer */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-[#9E1B32] text-xs">
                  <td className="py-4 px-4 text-center font-black text-cyan-400">
                    TOTAL
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-0.5">
                      <span className="font-mono text-sm text-white font-black">
                        {stats.grandAllocated.toLocaleString()} Reservoirs
                      </span>
                      <p className="text-[10px] text-slate-400 font-normal">
                        Across {rounds.length} national delineation rounds
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">Total Samples Done:</span>
                        <span className="font-mono font-black text-emerald-400">
                          {stats.grandFinished.toLocaleString()} / {stats.grandAllocated.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full"
                          style={{ width: `${Math.min(100, stats.completionRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td colSpan={isAdmin ? 5 : 4} className="py-4 px-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {stats.completionRate}% Progress Completed
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>
                Standard ERSL Reservoir Protocol Table. Member sample completions are persistent and saved in real time.
              </span>
            </div>
            <div className="font-semibold text-slate-700">
              ERSL Hydrology & GeoAI Lab · Dr. Hongxing Liu
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
            SECONDARY VIEW: TEAM MATRIX GRID (MEMBER COLUMNS)
            ========================================================================= */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase">
              Team Member Workload Matrix Grid
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any cell to edit completed samples and progress.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-xs font-black border-b border-slate-200">
                  <th className="py-3 px-4 w-20">Round</th>
                  <th className="py-3 px-4">Basin</th>
                  {['Saravanan', 'Jihee', 'Tantu', 'Anindya', 'Dan'].map(m => (
                    <th key={m} className="py-3 px-4 border-l border-slate-200 min-w-[140px]">
                      {m}
                    </th>
                  ))}
                  <th className="py-3 px-4 border-l border-slate-200 text-right">Round Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredRounds.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      Round {r.round}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{r.basinTotalText}</div>
                      <div className="text-[11px] text-slate-500">{r.subBasins[0]}</div>
                    </td>

                    {['Saravanan', 'Jihee', 'Tantu', 'Anindya', 'Dan'].map(name => {
                      const alloc = r.allocations.find(a => a.memberName.toLowerCase().includes(name.toLowerCase()));
                      if (!alloc) {
                        return (
                          <td key={name} className="py-3.5 px-4 border-l border-slate-200 text-slate-300 italic">
                            -
                          </td>
                        );
                      }

                      const is100Pct = alloc.completed || (alloc.numericCount > 0 && alloc.finishedCount >= alloc.numericCount);

                      return (
                        <td 
                          key={name}
                          onClick={() => handleOpenSampleModal(r, alloc)}
                          className={`py-3.5 px-4 border-l border-slate-200 cursor-pointer transition-colors ${
                            is100Pct ? 'bg-purple-50/40 hover:bg-purple-50' : 'hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {is100Pct ? (
                              <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px]">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-400 bg-white" />
                            )}
                            <div className="font-mono text-xs">
                              <span className="font-bold text-slate-900">{alloc.finishedCount}</span>
                              <span className="text-slate-400">/{alloc.countText}</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 border-l border-slate-200 text-right font-mono font-black text-slate-900">
                      {r.basinNumericTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MEMBER SAMPLE & PROCESS COMPLETION (Accessible in Member & Admin Mode)
          ========================================================================= */}
      {sampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-[#9E1B32] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  Member Sample Progress
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Round {sampleModal.roundNum} — {sampleModal.memberName}
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  {sampleModal.basinName}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setSampleModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSampleModal} className="p-6 space-y-4 text-xs">
              
              {/* Quick increment buttons */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Quick Add Completed Samples:
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 20].map(inc => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setSampleModal(prev => prev ? {
                        ...prev,
                        finishedCount: Math.min(prev.numericCount, prev.finishedCount + inc)
                      } : null)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#9E1B32] hover:text-[#9E1B32] font-bold text-xs transition-all shadow-2xs cursor-pointer"
                    >
                      +{inc}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSampleModal(prev => prev ? {
                      ...prev,
                      finishedCount: prev.numericCount,
                      completed: true
                    } : null)}
                    className="ml-auto px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-bold text-xs transition-all cursor-pointer"
                  >
                    100% Done
                  </button>
                </div>
              </div>

              {/* Finished Count Input & Target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Samples Completed:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sampleModal.finishedCount}
                    onChange={(e) => setSampleModal({ ...sampleModal, finishedCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Number completed so far</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Assigned:
                  </label>
                  <input
                    type="number"
                    readOnly={!isAdmin}
                    value={sampleModal.numericCount}
                    onChange={(e) => {
                      if (isAdmin) {
                        setSampleModal({ ...sampleModal, numericCount: parseInt(e.target.value) || 0 });
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-bold border ${
                      isAdmin 
                        ? 'bg-white border-slate-300 text-slate-900' 
                        : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isAdmin ? 'Editable by Admin' : 'Allocated Target'}
                  </p>
                </div>
              </div>

              {/* Process Completion Checkbox */}
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-950 block">Mark Process Completed</span>
                  <span className="text-[10px] text-purple-700">Flag this round's samples as 100% verified & completed</span>
                </div>
                <input
                  type="checkbox"
                  checked={sampleModal.completed || sampleModal.finishedCount >= sampleModal.numericCount}
                  onChange={(e) => setSampleModal({
                    ...sampleModal,
                    completed: e.target.checked,
                    finishedCount: e.target.checked && sampleModal.finishedCount < sampleModal.numericCount ? sampleModal.numericCount : sampleModal.finishedCount
                  })}
                  className="w-5 h-5 text-purple-700 rounded border-slate-300 focus:ring-purple-600 cursor-pointer"
                />
              </div>

              {/* Progress Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Progress Notes (Optional):
                </label>
                <textarea
                  rows={2}
                  value={sampleModal.notes}
                  onChange={(e) => setSampleModal({ ...sampleModal, notes: e.target.value })}
                  placeholder="e.g. 20 SAR high-resolution tiles verified..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSampleModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Sample Progress
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT ROUND DETAILS (ADMIN MODE - FULL EDIT FOR ALL SECTIONS)
          ========================================================================= */}
      {isEditModalOpen && editingRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9E1B32]">
                  ERSL Protocol Administration (Full Edit)
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Edit Round {editingRound.round}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRound} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Basin Header / Total Text:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRound.basinTotalText}
                    onChange={(e) => setEditingRound({ ...editingRound, basinTotalText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Numeric Total Count:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingRound.basinNumericTotal}
                    onChange={(e) => setEditingRound({ ...editingRound, basinNumericTotal: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sub-Basins (one per line):
                </label>
                <textarea
                  rows={2}
                  value={editingRound.subBasins.join('\n')}
                  onChange={(e) => setEditingRound({ ...editingRound, subBasins: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Finish Formula Text (e.g. Finish: 378+35+132= 545):
                </label>
                <input
                  type="text"
                  value={editingRound.finishFormula || ''}
                  onChange={(e) => setEditingRound({ ...editingRound, finishFormula: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              {/* Member Allocations */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  Team Member Allocations & Samples:
                </label>
                <div className="space-y-2">
                  {editingRound.allocations.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-24 font-bold text-slate-700">{a.memberName}:</span>
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-[10px] text-slate-500">Target:</span>
                        <input
                          type="text"
                          value={a.countText}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseInt(val) || 0;
                            const nextAlloc = [...editingRound.allocations];
                            nextAlloc[idx] = { ...a, countText: val, numericCount: num };
                            setEditingRound({ ...editingRound, allocations: nextAlloc });
                          }}
                          className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                        <span className="text-[10px] text-slate-500 ml-2">Completed:</span>
                        <input
                          type="number"
                          min="0"
                          value={a.finishedCount}
                          onChange={(e) => {
                            const num = parseInt(e.target.value) || 0;
                            const nextAlloc = [...editingRound.allocations];
                            nextAlloc[idx] = { ...a, finishedCount: num, completed: num >= a.numericCount };
                            setEditingRound({ ...editingRound, allocations: nextAlloc });
                          }}
                          className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={a.completed}
                          onChange={(e) => {
                            const nextAlloc = [...editingRound.allocations];
                            nextAlloc[idx] = { ...a, completed: e.target.checked };
                            setEditingRound({ ...editingRound, allocations: nextAlloc });
                          }}
                          className="rounded text-purple-600"
                        />
                        <span>Done</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deliver Date:
                  </label>
                  <input
                    type="text"
                    value={editingRound.deliverDateText}
                    onChange={(e) => setEditingRound({ ...editingRound, deliverDateText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collect Date:
                  </label>
                  <input
                    type="text"
                    value={editingRound.collectDateText}
                    onChange={(e) => setEditingRound({ ...editingRound, collectDateText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes:
                </label>
                <textarea
                  rows={2}
                  value={editingRound.notes || ''}
                  onChange={(e) => setEditingRound({ ...editingRound, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW ROUND (ADMIN MODE)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9E1B32]">
                  New Sprint Schedule
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Add New Round to Protocol
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRound} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Round Number:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRoundForm.round}
                    onChange={(e) => setNewRoundForm({ ...newRoundForm, round: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Reservoirs Count:
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newRoundForm.numericTotal}
                    onChange={(e) => setNewRoundForm({ ...newRoundForm, numericTotal: parseInt(e.target.value) || 0, basinTotal: `Total: ${e.target.value}` })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Basin Name & Sub-basins:
                </label>
                <textarea
                  rows={2}
                  required
                  value={newRoundForm.subBasinsText}
                  onChange={(e) => setNewRoundForm({ ...newRoundForm, subBasinsText: e.target.value })}
                  placeholder="e.g. Rio Grande Sub-basins: 150"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              {/* Member Workload Presets */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold text-slate-800">
                  Allocations for Team Members:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Saravanan:</label>
                    <input
                      type="text"
                      value={newRoundForm.saravananCount}
                      onChange={(e) => setNewRoundForm({ ...newRoundForm, saravananCount: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Jihee:</label>
                    <input
                      type="text"
                      value={newRoundForm.jiheeCount}
                      onChange={(e) => setNewRoundForm({ ...newRoundForm, jiheeCount: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Tantu:</label>
                    <input
                      type="text"
                      value={newRoundForm.tantuCount}
                      onChange={(e) => setNewRoundForm({ ...newRoundForm, tantuCount: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Anindya:</label>
                    <input
                      type="text"
                      value={newRoundForm.anindyaCount}
                      onChange={(e) => setNewRoundForm({ ...newRoundForm, anindyaCount: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Dan:</label>
                    <input
                      type="text"
                      value={newRoundForm.danCount}
                      onChange={(e) => setNewRoundForm({ ...newRoundForm, danCount: e.target.value })}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Deliver Date:
                  </label>
                  <input
                    type="text"
                    value={newRoundForm.deliverDate}
                    onChange={(e) => setNewRoundForm({ ...newRoundForm, deliverDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collect Date:
                  </label>
                  <input
                    type="text"
                    value={newRoundForm.collectDate}
                    onChange={(e) => setNewRoundForm({ ...newRoundForm, collectDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Add Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SWEET RANDOM CONGRATULATIONS POPUP FOR COMPLETED TARGETS
          ========================================================================= */}
      {congratsModal && congratsModal.isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 max-w-md w-full overflow-hidden text-center animate-in zoom-in-90 duration-300 relative">
            <div className="bg-gradient-to-r from-[#9E1B32] via-amber-600 to-[#9E1B32] p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-around">
                <Sparkles className="w-20 h-20 text-yellow-300 animate-pulse" />
                <Trophy className="w-24 h-24 text-amber-200" />
                <PartyPopper className="w-20 h-20 text-yellow-300 animate-pulse" />
              </div>

              <div className="relative z-10 space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-400 text-slate-900 shadow-md">
                  <Award className="w-3.5 h-3.5 text-slate-900" />
                  Target Accomplished!
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm mt-2">
                  {congratsModal.message.headline}
                </h3>
                <p className="text-xs text-amber-100 font-semibold">
                  {congratsModal.message.subhead}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCongratsModal(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                title="Close celebration"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-left">
              <div className="flex items-center gap-3.5 p-3.5 bg-gradient-to-r from-amber-50 to-red-50 rounded-2xl border border-amber-200/70 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#9E1B32] to-amber-600 text-white flex items-center justify-center font-black text-base shadow-md ring-2 ring-amber-300 shrink-0">
                  {congratsModal.memberName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {congratsModal.memberName}
                  </h4>
                  <p className="text-xs text-[#9E1B32] font-semibold mt-0.5">
                    Round {congratsModal.round} Allocation Complete
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full mt-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {congratsModal.count.toLocaleString()} Samples Verified Done
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                <p>
                  {congratsModal.message.body}
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1 text-[#9E1B32]">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    From Dr. Hongxing Liu & ERSL Lab
                  </span>
                  <span>Keep Shining! ✨</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setCongratsModal(null)}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#9E1B32] to-red-800 hover:from-red-800 hover:to-red-900 text-white font-extrabold text-xs shadow-lg shadow-red-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  <PartyPopper className="w-4 h-4 text-amber-300" />
                  <span>Celebrate & Continue Research</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
