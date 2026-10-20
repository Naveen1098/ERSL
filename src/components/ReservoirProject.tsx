import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../types';
import { initialPeople } from '../data/initialData';
import { ADMIN_EMAILS, supabase } from '../lib/supabase';
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
  UserPlus,
  Sliders,
  CheckCheck,
  Hourglass,
  RotateCcw,
  Cloud,
  CloudCheck,
  Radio,
  MessageSquare,
  MessageSquarePlus
} from 'lucide-react';

export type DeliveryStatus = 'not_started' | 'delivered';
export type CollectStatus = 'not_started' | 'collected';
export type CheckStatus = 'not_started' | 'in_progress' | 'qc_checked' | 'reprocessing' | 'verified';
export type BackupStatus = 'not_started' | 'backed_up';

export interface MemberAllocation {
  memberId: string;
  memberName: string;
  countText: string;
  numericCount: number;
  finishedCount: number;
  completed: boolean;
  danVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;

  // Member-wise dates and statuses for the 4 date columns:
  deliverDate?: string;
  deliverStatus?: DeliveryStatus; // 'not_started' (empty circle) | 'delivered' (green circle)

  collectDate?: string;
  collectStatus?: CollectStatus; // 'not_started' (empty circle) | 'collected' (green circle)

  checkDate?: string;
  checkStatus?: CheckStatus; // 'not_started' (empty) | 'in_progress' (orange) | 'qc_checked' (purple) | 'reprocessing' (blue) | 'verified' (solid green)
  checkNotes?: string;

  backupDate?: string;
  backupStatus?: BackupStatus; // 'not_started' (empty circle) | 'backed_up' (green circle)
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

export const CHECK_STATUS_CONFIG: {
  key: CheckStatus;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  circleClass: string;
  desc: string;
}[] = [
  {
    key: 'not_started',
    label: 'Not Yet Started',
    shortLabel: 'Not Started',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    badgeBorder: 'border-slate-300',
    circleClass: 'border-2 border-slate-400 bg-white hover:border-slate-600',
    desc: 'Empty circle: Work not yet started'
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    shortLabel: 'In Progress',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    circleClass: 'bg-amber-500 border border-amber-600 shadow-2xs',
    desc: 'Orange filled circle: Polygon delineation in progress'
  },
  {
    key: 'qc_checked',
    label: 'QC Checked by Dan',
    shortLabel: 'QC Checked',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    circleClass: 'bg-purple-700 border border-purple-800 text-white font-black text-[8px] flex items-center justify-center shadow-2xs',
    desc: 'Purple circle: Quality check reviewed by Dr. Dan Tian'
  },
  {
    key: 'reprocessing',
    label: 'Reprocessing',
    shortLabel: 'Reprocessing',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-300',
    circleClass: 'bg-sky-500 border border-sky-600 shadow-2xs',
    desc: 'Blue filled circle: Reprocessing / boundary correction requested'
  },
  {
    key: 'verified',
    label: 'Dan QC Verified',
    shortLabel: 'QC Verified',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    circleClass: 'bg-emerald-600 border border-emerald-700 text-white font-black text-[8px] flex items-center justify-center shadow-2xs',
    desc: 'Solid green circle: 100% Quality Verified by Dr. Dan Tian'
  }
];

const STORAGE_KEY = 'ersl_reservoir_project_v3';

// Baseline data extracted directly from Reservoir_tabel_details.docx
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '40', numericCount: 40, finishedCount: 40, completed: true, danVerified: true, verifiedBy: 'Dr. Dan Tian', deliverDate: '10/7', deliverStatus: 'delivered', collectDate: '10/12', collectStatus: 'collected', checkDate: '10/14', checkStatus: 'verified', backupDate: '10/15', backupStatus: 'backed_up' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '18', numericCount: 18, finishedCount: 18, completed: true, danVerified: true, verifiedBy: 'Dr. Dan Tian', deliverDate: '10/7', deliverStatus: 'delivered', collectDate: '10/12', collectStatus: 'collected', checkDate: '10/14', checkStatus: 'verified', backupDate: '10/15', backupStatus: 'backed_up' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '9', numericCount: 9, finishedCount: 9, completed: true, danVerified: true, verifiedBy: 'Dr. Dan Tian', deliverDate: '10/7', deliverStatus: 'delivered', collectDate: '10/12', collectStatus: 'collected', checkDate: '10/14', checkStatus: 'verified', backupDate: '10/15', backupStatus: 'backed_up' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '9', numericCount: 9, finishedCount: 9, completed: true, danVerified: true, verifiedBy: 'Dr. Dan Tian', deliverDate: '10/7', deliverStatus: 'delivered', collectDate: '10/12', collectStatus: 'collected', checkDate: '10/14', checkStatus: 'verified', backupDate: '10/15', backupStatus: 'backed_up' },
      { memberId: 'person-tian', memberName: 'Dan', countText: '16', numericCount: 16, finishedCount: 16, completed: true, danVerified: true, verifiedBy: 'Dr. Dan Tian', deliverDate: '10/7', deliverStatus: 'delivered', collectDate: '10/12', collectStatus: 'collected', checkDate: '10/14', checkStatus: 'verified', backupDate: '10/15', backupStatus: 'backed_up' }
    ],
    deliverDateText: '10/7',
    deliverCompleted: true,
    collectDateText: '10/12',
    collectCompleted: true,
    checkDateText: '10/14',
    checkCompleted: true,
    checkItems: [],
    backupDateText: '10/15',
    backupCompleted: true,
    notes: 'Colorado River Basin (CRB) baseline run. 100% completed, QA checked by Dr. Dan Tian and backed up.'
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '117', numericCount: 117, finishedCount: 117, completed: true, danVerified: false, deliverDate: '10/10', deliverStatus: 'delivered', collectDate: '10/15', collectStatus: 'collected', checkDate: '10/19', checkStatus: 'in_progress', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '47', numericCount: 47, finishedCount: 47, completed: true, danVerified: false, deliverDate: '10/10', deliverStatus: 'delivered', collectDate: '10/15', collectStatus: 'collected', checkDate: '10/19', checkStatus: 'in_progress', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '24', numericCount: 24, finishedCount: 24, completed: true, danVerified: false, deliverDate: '10/10', deliverStatus: 'delivered', collectDate: '10/15', collectStatus: 'collected', checkDate: '10/16', checkStatus: 'reprocessing', checkNotes: '3094, SAR', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '23', numericCount: 23, finishedCount: 23, completed: true, danVerified: false, deliverDate: '10/10', deliverStatus: 'delivered', collectDate: '10/15', collectStatus: 'collected', checkDate: '10/16', checkStatus: 'in_progress', checkNotes: '22/23 (find missing)', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-tian', memberName: 'Dan', countText: '35', numericCount: 35, finishedCount: 35, completed: true, danVerified: true, deliverDate: '10/10', deliverStatus: 'delivered', collectDate: '10/15', collectStatus: 'collected', checkDate: '10/19', checkStatus: 'qc_checked', backupDate: 'Pending', backupStatus: 'not_started' }
    ],
    deliverDateText: '10/10',
    deliverCompleted: true,
    collectDateText: '10/15',
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
    notes: 'South Atlantic Gulf Basin (SAGB) Below 1km². Quality verified by Dr. Dan Tian.'
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '94', numericCount: 94, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/7 Wed', deliverStatus: 'delivered', collectDate: '10/19 Mon', collectStatus: 'not_started', checkDate: '10/19', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '35 (small)', numericCount: 35, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/7 Wed', deliverStatus: 'delivered', collectDate: '10/19 Mon', collectStatus: 'not_started', checkDate: '10/19', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '19', numericCount: 19, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/7 Wed', deliverStatus: 'delivered', collectDate: '10/19 Mon', collectStatus: 'not_started', checkDate: '10/19', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '19', numericCount: 19, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/7 Wed', deliverStatus: 'delivered', collectDate: '10/19 Mon', collectStatus: 'not_started', checkDate: '10/19', checkStatus: 'in_progress', checkNotes: 'Ani: 1302', backupDate: 'Pending', backupStatus: 'not_started' }
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
    notes: 'Active Sprint: SAGB small & large water bodies. Members updating samples; pending Dr. Dan Tian quality check.'
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '65+31=96', numericCount: 96, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/16 Fri', deliverStatus: 'not_started', collectDate: '10/26 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/16 Fri', deliverStatus: 'not_started', collectDate: '10/26 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/16 Fri', deliverStatus: 'not_started', collectDate: '10/26 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/16 Fri', deliverStatus: 'not_started', collectDate: '10/26 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-tian', memberName: 'Dan', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/16 Fri', deliverStatus: 'not_started', collectDate: '10/26 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' }
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '43+54=97', numericCount: 97, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/23 Fri', deliverStatus: 'not_started', collectDate: '11/2 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/23 Fri', deliverStatus: 'not_started', collectDate: '11/2 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/23 Fri', deliverStatus: 'not_started', collectDate: '11/2 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/23 Fri', deliverStatus: 'not_started', collectDate: '11/2 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-tian', memberName: 'Dan', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/23 Fri', deliverStatus: 'not_started', collectDate: '11/2 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' }
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '100', numericCount: 100, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/30 Fri', deliverStatus: 'not_started', collectDate: '11/9 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/30 Fri', deliverStatus: 'not_started', collectDate: '11/9 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/30 Fri', deliverStatus: 'not_started', collectDate: '11/9 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/30 Fri', deliverStatus: 'not_started', collectDate: '11/9 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-tian', memberName: 'Dan', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '10/30 Fri', deliverStatus: 'not_started', collectDate: '11/9 Mon', collectStatus: 'not_started', checkDate: 'Scheduled', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' }
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '100', numericCount: 100, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/6 Fri', deliverStatus: 'not_started', collectDate: '11/16 Mon', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/6 Fri', deliverStatus: 'not_started', collectDate: '11/16 Mon', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/6 Fri', deliverStatus: 'not_started', collectDate: '11/16 Mon', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/6 Fri', deliverStatus: 'not_started', collectDate: '11/16 Mon', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' }
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
      { memberId: 'person-raju', memberName: 'Saravanan', countText: '100', numericCount: 100, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/13 Fri', deliverStatus: 'not_started', collectDate: '11/24 Tue', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-seo', memberName: 'Jihee', countText: '40', numericCount: 40, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/13 Fri', deliverStatus: 'not_started', collectDate: '11/24 Tue', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-mandal', memberName: 'Tantu', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/13 Fri', deliverStatus: 'not_started', collectDate: '11/24 Tue', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' },
      { memberId: 'person-palaparthi', memberName: 'Anindya', countText: '20', numericCount: 20, finishedCount: 0, completed: false, danVerified: false, deliverDate: '11/13 Fri', deliverStatus: 'not_started', collectDate: '11/24 Tue', collectStatus: 'not_started', checkDate: 'Upcoming', checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' }
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
  return data.map(r => {
    const isRoundDelivered = r.deliverCompleted ?? (Number(r.round) <= 3);
    const isRoundCollected = r.collectCompleted ?? (Number(r.round) <= 2);
    const isRoundBackup = r.backupCompleted ?? (Number(r.round) === 1);

    const allocations = (r.allocations || []).map((a: any) => {
      let deliverStatus: DeliveryStatus = a.deliverStatus;
      if (!deliverStatus) {
        deliverStatus = isRoundDelivered ? 'delivered' : 'not_started';
      }
      const deliverDate = a.deliverDate || r.deliverDateText || '';

      let collectStatus: CollectStatus = a.collectStatus;
      if (!collectStatus) {
        collectStatus = isRoundCollected ? 'collected' : 'not_started';
      }
      const collectDate = a.collectDate || r.collectDateText || '';

      let checkStatus: CheckStatus = a.checkStatus;
      if (!checkStatus) {
        if (Number(r.round) === 1 || a.danVerified) {
          checkStatus = 'verified';
        } else if (Number(r.round) === 2) {
          if (a.memberName?.toLowerCase().includes('tantu')) checkStatus = 'reprocessing';
          else if (a.memberName?.toLowerCase().includes('dan')) checkStatus = 'qc_checked';
          else checkStatus = 'in_progress';
        } else if (Number(r.round) === 3 && a.memberName?.toLowerCase().includes('anindya')) {
          checkStatus = 'in_progress';
        } else if (a.finishedCount >= a.numericCount && a.numericCount > 0) {
          checkStatus = 'qc_checked';
        } else if (a.finishedCount > 0) {
          checkStatus = 'in_progress';
        } else {
          checkStatus = 'not_started';
        }
      }
      const checkDate = a.checkDate || r.checkDateText || '';

      let backupStatus: BackupStatus = a.backupStatus;
      if (!backupStatus) {
        backupStatus = isRoundBackup ? 'backed_up' : 'not_started';
      }
      const backupDate = a.backupDate || r.backupDateText || 'Pending';

      return {
        ...a,
        finishedCount: typeof a.finishedCount === 'number' ? a.finishedCount : (a.completed ? a.numericCount : 0),
        danVerified: checkStatus === 'verified' ? true : (typeof a.danVerified === 'boolean' ? a.danVerified : (Number(r.round) <= 1)),
        deliverStatus,
        deliverDate,
        collectStatus,
        collectDate,
        checkStatus,
        checkDate,
        checkNotes: a.checkNotes || '',
        backupStatus,
        backupDate
      };
    });

    return {
      ...r,
      deliverCompleted: isRoundDelivered,
      collectCompleted: isRoundCollected,
      backupCompleted: isRoundBackup,
      allocations
    };
  });
};

const CONGRATULATION_TEMPLATES = [
  (name: string, round: string | number, count: number) => ({
    headline: "🎉 Outstanding Milestone Reached!",
    subhead: "Precision & Dedication at its Finest",
    body: `Incredible work, ${name}! You have successfully completed your assigned ${count.toLocaleString()} samples in Round ${round}. Dr. Hongxing Liu and Dr. Dan Tian applaud your high accuracy and dedication!`
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
  const userName = (currentUser?.name || '').toLowerCase().trim();
  const isEmailAdmin = ADMIN_EMAILS.some(e => e.toLowerCase().trim() === userEmail);
  const isRoleAdmin = currentUser?.role === 'Admin' || currentUser?.role?.toLowerCase() === 'admin';
  
  // Dr. Dan Tian is the primary Quality Inspector
  const isDanTian = userEmail.includes('tian') || userName.includes('dan');

  // Toggle for Admin Edit Mode
  const [adminMode, setAdminMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ersl_reservoir_admin_mode');
    if (saved !== null) return saved === 'true';
    return false;
  });

  const isAdmin = isEmailAdmin || isRoleAdmin || adminMode;
  // Dan or Admin can manage assignments, add/remove members, and update QC/delivery statuses
  const canManageAssignments = isAdmin || isDanTian;
  const canVerifyQuality = isAdmin || isDanTian;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // View Mode: 'protocol' (Table 2 Format Table) vs 'matrix' (Member Columns Grid)
  const [viewMode, setViewMode] = useState<'protocol' | 'matrix'>('protocol');

  // Team Progress Display Tab: 'combined' (Both Round & Overall) vs 'round' vs 'overall'
  const [progressTab, setProgressTab] = useState<'combined' | 'round' | 'overall'>('combined');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMember, setFilterMember] = useState<string>('all');

  // Inline date editing state: { roundId, memberName, field: 'deliver'|'collect'|'check'|'backup', tempVal }
  const [editingDateCell, setEditingDateCell] = useState<{
    roundId: string;
    memberName: string;
    field: 'deliver' | 'collect' | 'check' | 'backup';
    tempVal: string;
  } | null>(null);

  // Popover selector for Check Date status menu
  const [checkStatusMenu, setCheckStatusMenu] = useState<{
    roundId: string;
    memberName: string;
  } | null>(null);

  // Add Member Modal state (Admin / Dan can add member to that particular week/round)
  const [addMemberModal, setAddMemberModal] = useState<{
    isOpen: boolean;
    roundId: string;
    roundNum: number | string;
    defaultDeliverDate: string;
    defaultCollectDate: string;
  } | null>(null);

  const [newMemberForm, setNewMemberForm] = useState<{
    memberName: string;
    customName: string;
    workloadCount: string;
    deliverDate: string;
    collectDate: string;
  }>({
    memberName: 'Saravanan Raju',
    customName: '',
    workloadCount: '25',
    deliverDate: '',
    collectDate: ''
  });

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

  // Cloud Sync & Realtime Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'local_only' | 'table_needed'>('local_only');
  const [realtimeActive, setRealtimeActive] = useState(false);

  // Load round data from localStorage (persisted across edits)
  const [rounds, setRounds] = useState<RoundRow[]>(() => {
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY);
      if (savedV3) {
        return sanitizeRounds(JSON.parse(savedV3));
      }
      const savedV2 = localStorage.getItem('ersl_reservoir_project_v2');
      if (savedV2) {
        return sanitizeRounds(JSON.parse(savedV2));
      }
    } catch (e) {
      console.error('Failed to parse saved reservoir round data', e);
    }
    return getInitialRoundData();
  });

  // Persistent reference to rounds state for callbacks
  const roundsRef = useRef<RoundRow[]>(rounds);
  roundsRef.current = rounds;

  // Supabase Realtime Channel Reference
  const channelRef = useRef<any>(null);

  // Explicit Active Delivery Round (synced across members & admin)
  const [explicitActiveDeliveryRound, setExplicitActiveDeliveryRound] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_active_round');
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });
  const explicitActiveRoundRef = useRef<number | null>(explicitActiveDeliveryRound);
  explicitActiveRoundRef.current = explicitActiveDeliveryRound;

  // =========================================================================
  // CLOUD PERSISTENCE & REALTIME BROADCAST SYNCHRONIZATION
  // 1. Loads from Supabase database `reservoir_matrix` if table exists.
  // 2. Broadcasts live via Supabase Realtime using channelRef so ALL open tabs across
  //    members & admin update immediately in real-time.
  // 3. Responds to state requests so newly opened admin tabs receive latest progress.
  // 4. Polls periodically and on window focus to stay completely synchronized.
  // =========================================================================
  const fetchCloudData = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('reservoir_matrix')
        .select('*')
        .eq('id', 'ersl_reservoir_matrix')
        .maybeSingle();

      if (!error && data && data.rounds && Array.isArray(data.rounds)) {
        const sanitized = sanitizeRounds(data.rounds);
        setRounds(sanitized);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {}
        if (data.active_round) {
          setExplicitActiveDeliveryRound(Number(data.active_round));
          try {
            localStorage.setItem(STORAGE_KEY + '_active_round', String(data.active_round));
          } catch {}
        }
        setCloudSyncStatus('synced');
      } else if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
        setCloudSyncStatus('table_needed');
      }
    } catch (err) {
      console.warn('Cloud fetch notice:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Initial load
    fetchCloudData();

    // Setup Supabase Realtime Channel
    if (supabase) {
      const channel = supabase.channel('ersl_reservoir_realtime', {
        config: { broadcast: { self: true, ack: true } }
      });
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'reservoir_matrix_sync' }, (payload: any) => {
          const incomingRounds = payload?.payload?.rounds;
          if (incomingRounds && Array.isArray(incomingRounds)) {
            const sanitized = sanitizeRounds(incomingRounds);
            if (isMounted) {
              setRounds(sanitized);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
              } catch {}
              if (payload?.payload?.activeRound) {
                const act = Number(payload.payload.activeRound);
                setExplicitActiveDeliveryRound(act);
                try {
                  localStorage.setItem(STORAGE_KEY + '_active_round', String(act));
                } catch {}
              }
              const sender = payload?.payload?.sender || 'team member';
              showToast(`⚡ Live update synced from ${sender}!`);
            }
          }
        })
        .on('broadcast', { event: 'request_state' }, () => {
          // If we have state, send our latest state to help incoming peer synchronize
          if (channelRef.current && roundsRef.current && roundsRef.current.length > 0) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'reservoir_matrix_sync',
              payload: {
                rounds: roundsRef.current,
                activeRound: explicitActiveRoundRef.current,
                sender: currentUser?.name || 'Lab Node',
                timestamp: Date.now()
              }
            }).catch(() => {});
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reservoir_matrix' }, (payload: any) => {
          if (payload?.new?.rounds && Array.isArray(payload.new.rounds)) {
            const incoming = sanitizeRounds(payload.new.rounds);
            if (isMounted) {
              setRounds(incoming);
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
              } catch {}
              if (payload.new.active_round) {
                setExplicitActiveDeliveryRound(Number(payload.new.active_round));
              }
              setCloudSyncStatus('synced');
              showToast('⚡ Live cloud database update synced!');
            }
          }
        })
        .subscribe((status) => {
          if (isMounted) {
            const isSub = status === 'SUBSCRIBED';
            setRealtimeActive(isSub);
            if (isSub) {
              // Ask active peers for any in-flight state
              channel.send({
                type: 'broadcast',
                event: 'request_state',
                payload: { requester: currentUser?.name || 'Lab Member' }
              }).catch(() => {});
            }
          }
        });

      // Background periodic polling & window focus synchronization
      const pollTimer = setInterval(() => {
        if (isMounted) fetchCloudData();
      }, 8000);

      const handleWindowFocus = () => {
        if (isMounted) {
          fetchCloudData();
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'request_state',
              payload: { requester: currentUser?.name || 'Lab Member' }
            }).catch(() => {});
          }
        }
      };

      window.addEventListener('focus', handleWindowFocus);

      return () => {
        isMounted = false;
        clearInterval(pollTimer);
        window.removeEventListener('focus', handleWindowFocus);
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Central synchronized update function
  const updateRoundsAndSync = (
    updater: (prev: RoundRow[]) => RoundRow[],
    newActiveRound?: number
  ) => {
    setRounds(prev => {
      const nextRounds = updater(prev);
      const targetActiveRound = newActiveRound ?? explicitActiveRoundRef.current ?? autoDetectedActiveRound;

      // 1. Local storage backup
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRounds));
        if (targetActiveRound) {
          localStorage.setItem(STORAGE_KEY + '_active_round', String(targetActiveRound));
        }
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // 2. Realtime WebSocket Broadcast (Uses active channelRef)
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'reservoir_matrix_sync',
          payload: {
            rounds: nextRounds,
            activeRound: targetActiveRound,
            sender: currentUser?.name || currentUser?.email || 'Lab Researcher',
            timestamp: Date.now()
          }
        }).catch((err: any) => {
          console.warn('Realtime broadcast notice:', err);
        });
      }

      // 3. Supabase Cloud Database Table Persistence
      if (supabase) {
        supabase
          .from('reservoir_matrix')
          .upsert({
            id: 'ersl_reservoir_matrix',
            rounds: nextRounds,
            active_round: targetActiveRound,
            updated_at: new Date().toISOString(),
            updated_by: currentUser?.name || currentUser?.email || 'Lab Researcher'
          })
          .then(
            ({ error }: any) => {
              if (!error) {
                setCloudSyncStatus('synced');
              } else if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
                setCloudSyncStatus('table_needed');
              }
            },
            (err: any) => {
              console.warn('Supabase upsert error:', err);
            }
          );
      }

      return nextRounds;
    });
  };

  // =========================================================================
  // REQUIREMENT 4: AUTOMATIC UPDATION COMPLETELY BASED ON DELIVERY DATE
  // Automatically detects the active sprint round based on Delivery Date.
  // 1. Uses explicit delivery round if Dan/Admin marked delivery green or set active.
  // 2. Uses the highest round marked delivered (green circle in Delivery Date).
  // 3. Parses delivery calendar date (M/D) to auto-detect current active delivery sprint.
  // =========================================================================
  const autoDetectedActiveRound = useMemo(() => {
    // 1. If explicit delivery round is set, use it
    if (explicitActiveDeliveryRound !== null) {
      const exists = rounds.some(r => Number(r.round) === explicitActiveDeliveryRound);
      if (exists) return explicitActiveDeliveryRound;
    }

    // 2. Find all rounds that have delivery completed or members delivered (marked green)
    const deliveredRounds = rounds.filter(r => 
      r.deliverCompleted || (r.allocations.length > 0 && r.allocations.some(a => a.deliverStatus === 'delivered'))
    );

    if (deliveredRounds.length > 0) {
      // The current active sprint is the latest round delivered
      const latestDelivered = deliveredRounds[deliveredRounds.length - 1];
      return Number(latestDelivered.round);
    }

    // 3. Fallback: Parse calendar delivery dates and find matching date on/before today
    const parseDeliveryDate = (dateStr?: string) => {
      if (!dateStr) return null;
      const match = dateStr.match(/(\d{1,2})\/(\d{1,2})/);
      if (!match) return null;
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      const year = 2026;
      return new Date(year, month - 1, day);
    };

    const now = new Date();
    const pastOrPresent = rounds.filter(r => {
      const d = parseDeliveryDate(r.deliverDateText);
      return d && d <= now;
    });

    if (pastOrPresent.length > 0) {
      return Number(pastOrPresent[pastOrPresent.length - 1].round);
    }

    return Number(rounds[0]?.round || 1);
  }, [rounds, explicitActiveDeliveryRound]);

  // Optional manual round override (null = auto-advancement is active)
  const [manualRoundOverride, setManualRoundOverride] = useState<number | null>(null);

  // Active round is either manual selection or automatically detected active sprint
  const activeSprintRound = manualRoundOverride ?? autoDetectedActiveRound;
  const isAutoTracking = manualRoundOverride === null;

  // Distinct members list
  const teamMembers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email?: string; image?: string; role?: string }>();
    
    const known = [
      { id: 'person-raju', name: 'Saravanan Raju', shortName: 'Saravanan' },
      { id: 'person-seo', name: 'Jihee Seo', shortName: 'Jihee' },
      { id: 'person-mandal', name: 'Tantu Mandal', shortName: 'Tantu' },
      { id: 'person-palaparthi', name: 'Anindya Palaparthi', shortName: 'Anindya' },
      { id: 'person-tian', name: 'Dr. Dan Tian', shortName: 'Dan' },
      { id: 'person-miliutina', name: 'Ms. Yuliia Miliutina', shortName: 'Yuliia' },
      { id: 'person-liu', name: 'Dr. Hongxing Liu', shortName: 'Hongxing' }
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

  // Compute Overall Stats & Per-Round Stats
  const { stats, currentRoundMetrics } = useMemo(() => {
    let grandAllocated = 0;
    let grandFinished = 0;
    let grandBackedUp = 0; // Overall work progress final total reservoir based on backup progress
    let qualityVerifiedCount = 0;
    let pendingDanQcCount = 0;

    const memberProgress: Record<string, {
      name: string;
      assigned: number;
      finished: number;
      backedUp: number;
      backedUpRate: number;
      qualityVerified: number;
      pendingQc: number;
      tasksCount: number;
      completedTasks: number;
      backedUpTasks: number;
    }> = {};

    rounds.forEach(r => {
      grandAllocated += r.basinNumericTotal || 0;

      // Round-level backup status check
      let roundBackedUpSum = 0;
      if (r.backupCompleted) {
        roundBackedUpSum = r.basinNumericTotal || 0;
      }
      let allocationsBackedUpSum = 0;

      // Round-level QC verified status check
      let roundVerifiedSum = 0;
      if (r.checkCompleted) {
        roundVerifiedSum = r.basinNumericTotal || 0;
      }
      let allocationsVerifiedSum = 0;

      r.allocations.forEach(a => {
        grandFinished += a.finishedCount || 0;
        const isVerified = a.checkStatus === 'verified' || a.danVerified || r.checkCompleted;
        const isBackedUp = a.backupStatus === 'backed_up' || r.backupCompleted;

        const effectiveCount = a.finishedCount > 0 ? a.finishedCount : (a.numericCount || 0);

        if (isBackedUp) {
          allocationsBackedUpSum += effectiveCount;
        }

        if (isVerified) {
          allocationsVerifiedSum += effectiveCount;
        } else if (a.checkStatus === 'qc_checked' || (a.finishedCount >= a.numericCount && a.numericCount > 0)) {
          pendingDanQcCount++;
        }

        const key = a.memberName.split(' ')[0];
        if (!memberProgress[key]) {
          memberProgress[key] = {
            name: a.memberName,
            assigned: 0,
            finished: 0,
            backedUp: 0,
            backedUpRate: 0,
            qualityVerified: 0,
            verifiedRate: 0,
            pendingQc: 0,
            tasksCount: 0,
            completedTasks: 0,
            backedUpTasks: 0
          };
        }
        memberProgress[key].assigned += a.numericCount || 0;
        memberProgress[key].finished += a.finishedCount || 0;
        memberProgress[key].tasksCount++;
        if (isBackedUp) {
          memberProgress[key].backedUp += effectiveCount;
          memberProgress[key].backedUpTasks++;
        }
        if (isVerified) {
          memberProgress[key].qualityVerified += effectiveCount;
          memberProgress[key].completedTasks++;
        } else if (a.checkStatus === 'qc_checked' || (a.finishedCount >= a.numericCount && a.numericCount > 0)) {
          memberProgress[key].pendingQc++;
        }
      });

      // Overall backed-up total for this round
      if (r.backupCompleted) {
        grandBackedUp += roundBackedUpSum;
      } else {
        grandBackedUp += allocationsBackedUpSum;
      }

      // Overall QC verified total for this round
      if (r.checkCompleted) {
        qualityVerifiedCount += roundVerifiedSum;
      } else {
        qualityVerifiedCount += allocationsVerifiedSum;
      }
    });

    // Compute rates for each member
    Object.keys(memberProgress).forEach(k => {
      const m = memberProgress[k];
      m.backedUpRate = m.assigned > 0 ? Math.round((m.backedUp / m.assigned) * 100) : 0;
      m.verifiedRate = m.assigned > 0 ? Math.round((m.qualityVerified / m.assigned) * 100) : 0;
    });

    // Metrics for the currently selected active sprint / round
    const targetRoundObj = rounds.find(r => Number(r.round) === Number(activeSprintRound)) || rounds[0];
    const roundMemberMetrics: Record<string, {
      assigned: number;
      finished: number;
      completed: boolean;
      danVerified: boolean;
      checkStatus?: CheckStatus;
      deliverStatus?: DeliveryStatus;
      backupStatus?: BackupStatus;
    }> = {};

    if (targetRoundObj) {
      targetRoundObj.allocations.forEach(a => {
        const key = a.memberName.split(' ')[0];
        roundMemberMetrics[key] = {
          assigned: a.numericCount || 0,
          finished: a.finishedCount || 0,
          completed: a.completed || (a.numericCount > 0 && a.finishedCount >= a.numericCount),
          danVerified: a.checkStatus === 'verified' || a.danVerified,
          checkStatus: a.checkStatus,
          deliverStatus: a.deliverStatus,
          backupStatus: a.backupStatus
        };
      });
    }

    const completionRate = grandAllocated > 0 ? Math.round((grandFinished / grandAllocated) * 100) : 0;
    const backupRate = grandAllocated > 0 ? Math.round((grandBackedUp / grandAllocated) * 100) : 0;
    const verifiedRate = grandAllocated > 0 ? Math.round((qualityVerifiedCount / grandAllocated) * 100) : 0;

    return {
      stats: {
        grandAllocated,
        grandFinished,
        grandBackedUp, // Reservoirs backed up in storage
        backupRate, // Backup archive rate
        qualityVerifiedCount, // Overall work progress final total reservoir based on QC Dan Verified status
        verifiedRate, // Overall work progress final completion percentage
        pendingDanQcCount,
        completionRate,
        memberProgress
      },
      currentRoundMetrics: {
        roundObj: targetRoundObj,
        roundMemberMetrics
      }
    };
  }, [rounds, activeSprintRound]);

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

  // Unique member names for Matrix View
  const matrixMemberNames = useMemo(() => {
    const list: string[] = ['Saravanan', 'Jihee', 'Tantu', 'Anindya', 'Dan'];
    rounds.forEach(r => {
      r.allocations.forEach(a => {
        const sName = a.memberName.split(' ')[0];
        if (!list.includes(sName)) {
          list.push(sName);
        }
      });
    });
    return list;
  }, [rounds]);

  // =========================================================================
  // REQUIREMENT 1: NUMBER (MEMBER WORKLOAD) & PROGRESS EDITING MODAL
  // Regular members can ONLY edit finishedCount (their work progress number).
  // Dan or Admin can edit numericCount / countText (assigned targets) as well.
  // =========================================================================
  const [sampleModal, setSampleModal] = useState<{
    roundId: string;
    roundNum: number | string;
    basinName: string;
    memberId: string;
    memberName: string;
    numericCount: number;
    countText: string;
    finishedCount: number;
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
      countText: a.countText,
      finishedCount: a.finishedCount,
      notes: a.notes || ''
    });
  };

  const handleSaveSampleModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleModal) return;

    const isNewlyCompleted = 
      sampleModal.finishedCount >= sampleModal.numericCount && sampleModal.numericCount > 0;

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== sampleModal.roundId) return r;
      return {
        ...r,
        allocations: r.allocations.map(a => {
          if (a.memberName.toLowerCase() === sampleModal.memberName.toLowerCase()) {
            const isDone = sampleModal.finishedCount >= sampleModal.numericCount && sampleModal.numericCount > 0;
            const updatedAlloc: MemberAllocation = {
              ...a,
              finishedCount: Math.max(0, sampleModal.finishedCount),
              completed: isDone,
              notes: sampleModal.notes
            };

            // If Dan or Admin, allow updating assigned workload target
            if (canManageAssignments) {
              updatedAlloc.countText = sampleModal.countText;
              updatedAlloc.numericCount = parseInt(sampleModal.countText) || sampleModal.numericCount;
            }

            return updatedAlloc;
          }
          return a;
        })
      };
    }));

    const memberName = sampleModal.memberName;
    const roundNum = sampleModal.roundNum;
    const finishedCount = sampleModal.finishedCount;

    setSampleModal(null);
    showToast(`Updated progress for ${memberName} in Round ${roundNum}!`);

    if (isNewlyCompleted) {
      setTimeout(() => {
        triggerCongrats(memberName, roundNum, finishedCount);
      }, 250);
    }
  };

  // =========================================================================
  // REQUIREMENT 1: ADD & REMOVE MEMBER PER ROUND (DAN / ADMIN ONLY)
  // =========================================================================
  const handleOpenAddMemberModal = (r: RoundRow) => {
    if (!canManageAssignments) {
      showToast('Only Dr. Dan Tian or Lab Admin can assign members.');
      return;
    }
    setNewMemberForm({
      memberName: 'Saravanan Raju',
      customName: '',
      workloadCount: '20',
      deliverDate: r.deliverDateText || '',
      collectDate: r.collectDateText || ''
    });
    setAddMemberModal({
      isOpen: true,
      roundId: r.id,
      roundNum: r.round,
      defaultDeliverDate: r.deliverDateText || '',
      defaultCollectDate: r.collectDateText || ''
    });
  };

  const handleConfirmAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMemberModal) return;

    const chosenName = (newMemberForm.memberName === 'Other' ? newMemberForm.customName : newMemberForm.memberName).trim();
    if (!chosenName) {
      showToast('Please specify a member name.');
      return;
    }

    const countNum = parseInt(newMemberForm.workloadCount) || 0;
    const countStr = newMemberForm.workloadCount.trim() || '0';

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== addMemberModal.roundId) return r;

      const exists = r.allocations.some(a => a.memberName.toLowerCase().includes(chosenName.toLowerCase().split(' ')[0]));
      if (exists) {
        showToast(`${chosenName} is already assigned to Round ${r.round}.`);
        return r;
      }

      const newAlloc: MemberAllocation = {
        memberId: `person-${chosenName.toLowerCase().replace(/\s+/g, '-')}`,
        memberName: chosenName,
        countText: countStr,
        numericCount: countNum,
        finishedCount: 0,
        completed: false,
        danVerified: false,
        deliverDate: newMemberForm.deliverDate || r.deliverDateText || '',
        deliverStatus: r.deliverCompleted ? 'delivered' : 'not_started',
        collectDate: newMemberForm.collectDate || r.collectDateText || '',
        collectStatus: r.collectCompleted ? 'collected' : 'not_started',
        checkDate: r.checkDateText || 'Scheduled',
        checkStatus: 'not_started',
        checkNotes: '',
        backupDate: r.backupDateText || 'Pending',
        backupStatus: 'not_started'
      };

      return {
        ...r,
        allocations: [...r.allocations, newAlloc]
      };
    }));

    setAddMemberModal(null);
    showToast(`Assigned ${chosenName} (${countStr} reservoirs) to Round ${addMemberModal.roundNum}!`);
  };

  const handleRemoveMemberFromRound = (roundId: string, memberName: string) => {
    if (!canManageAssignments) {
      showToast('Only Dr. Dan Tian or Lab Admin can remove assigned members.');
      return;
    }

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const remaining = r.allocations.filter(a => a.memberName.toLowerCase() !== memberName.toLowerCase());
      return {
        ...r,
        allocations: remaining
      };
    }));

    showToast(`Removed ${memberName} from this round.`);
  };

  // =========================================================================
  // REQUIREMENT 3 & 4: MEMBER-WISE DELIVERY DATE STATUS & AUTO SELECTION
  // When Dan/Admin sets delivery to green, automatically selects active sprint
  // based on the delivery date, and selects the Overall + current week progress tab!
  // =========================================================================
  const handleToggleMemberDelivery = (roundId: string, memberName: string) => {
    if (!canManageAssignments) {
      showToast('Delivery status and dates are managed by Dr. Dan Tian or Lab Admin.');
      return;
    }

    let becameDelivered = false;
    let targetRoundNum: number | string = 1;

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      targetRoundNum = r.round;

      const updatedAllocations = r.allocations.map(a => {
        if (a.memberName.toLowerCase() === memberName.toLowerCase()) {
          const nextStatus: DeliveryStatus = a.deliverStatus === 'delivered' ? 'not_started' : 'delivered';
          if (nextStatus === 'delivered') becameDelivered = true;
          return {
            ...a,
            deliverStatus: nextStatus
          };
        }
        return a;
      });

      const allDelivered = updatedAllocations.length > 0 && updatedAllocations.every(a => a.deliverStatus === 'delivered');
      const anyDelivered = updatedAllocations.some(a => a.deliverStatus === 'delivered');

      return {
        ...r,
        deliverCompleted: allDelivered || anyDelivered,
        allocations: updatedAllocations
      };
    }));

    // REQUIREMENT 4: Auto-select Overall Tab + current assigned week progress based on delivery date
    if (becameDelivered) {
      const num = Number(targetRoundNum);
      setExplicitActiveDeliveryRound(num);
      try {
        localStorage.setItem(STORAGE_KEY + '_active_round', String(num));
      } catch {}
      setManualRoundOverride(null);
      setProgressTab('combined');
      showToast(`⚡ Round ${num} delivery marked green! Auto-selected Dual View (Overall + Round ${num} Progress).`);
    }
  };

  // Quick toggle entire round delivery
  const handleToggleDeliver = (roundId: string) => {
    if (!canManageAssignments) {
      showToast('Delivery status is managed by Dr. Dan Tian or Lab Admin.');
      return;
    }

    let becameDelivered = false;
    let targetRoundNum: number | string = 1;

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      targetRoundNum = r.round;
      const nextVal = !r.deliverCompleted;
      if (nextVal) becameDelivered = true;
      const nextStatus: DeliveryStatus = nextVal ? 'delivered' : 'not_started';
      const updatedAllocations = r.allocations.map(a => ({
        ...a,
        deliverStatus: nextStatus
      }));

      return {
        ...r,
        deliverCompleted: nextVal,
        allocations: updatedAllocations
      };
    }), becameDelivered ? Number(targetRoundNum) : undefined);

    // REQUIREMENT 4: Auto-select Overall Tab + current assigned week progress based on delivery date
    if (becameDelivered) {
      const num = Number(targetRoundNum);
      setExplicitActiveDeliveryRound(num);
      try {
        localStorage.setItem(STORAGE_KEY + '_active_round', String(num));
      } catch {}
      setManualRoundOverride(null);
      setProgressTab('combined');
      showToast(`⚡ Round ${num} delivery marked green! Auto-selected Dual View (Overall + Round ${num} Progress).`);
    }
  };

  // =========================================================================
  // REQUIREMENT 3: MEMBER-WISE COLLECT DATE STATUS
  // =========================================================================
  const handleToggleMemberCollect = (roundId: string, memberName: string) => {
    if (!canManageAssignments) {
      showToast('Collection status and dates are managed by Dr. Dan Tian or Lab Admin.');
      return;
    }
    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const updatedAllocations = r.allocations.map(a => {
        if (a.memberName.toLowerCase() === memberName.toLowerCase()) {
          const nextStatus: CollectStatus = a.collectStatus === 'collected' ? 'not_started' : 'collected';
          return { ...a, collectStatus: nextStatus };
        }
        return a;
      });
      const allCollected = updatedAllocations.length > 0 && updatedAllocations.every(a => a.collectStatus === 'collected');
      return {
        ...r,
        collectCompleted: allCollected,
        allocations: updatedAllocations
      };
    }));
  };

  const handleToggleCollect = (roundId: string) => {
    if (!canManageAssignments) {
      showToast('Collection status is managed in Admin Mode.');
      return;
    }
    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const nextVal = !r.collectCompleted;
      const nextStatus: CollectStatus = nextVal ? 'collected' : 'not_started';
      return {
        ...r,
        collectCompleted: nextVal,
        allocations: r.allocations.map(a => ({ ...a, collectStatus: nextStatus }))
      };
    }));
  };

  // =========================================================================
  // REQUIREMENT 3: MEMBER-WISE CHECK DATE (QC CHECK DATA) STATUSES
  // 5 Status Options:
  // ⚪ Empty circle: not yet started
  // 🟠 Orange filled circle: in progress
  // 🟣 Purple circle: QC checked by Dan
  // 🔵 Blue filled circle: reprocessing
  // 🟢 Solid green circle: Dan QC verified
  // =========================================================================
  const handleSetMemberCheckStatus = (roundId: string, memberName: string, nextStatus: CheckStatus) => {
    if (!canManageAssignments) {
      showToast('QC checkpoints and verification are managed by Dr. Dan Tian or Lab Admin.');
      return;
    }

    const targetRound = rounds.find(r => r.id === roundId);
    const alloc = targetRound?.allocations.find(a => a.memberName.toLowerCase() === memberName.toLowerCase());

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const updatedAllocations = r.allocations.map(a => {
        if (a.memberName.toLowerCase() === memberName.toLowerCase()) {
          const isVerified = nextStatus === 'verified';
          return {
            ...a,
            checkStatus: nextStatus,
            danVerified: isVerified,
            verifiedBy: isVerified ? 'Dr. Dan Tian' : undefined,
            verifiedAt: isVerified ? new Date().toISOString() : undefined
          };
        }
        return a;
      });
      const allVerified = updatedAllocations.length > 0 && updatedAllocations.every(a => a.checkStatus === 'verified');
      return {
        ...r,
        checkCompleted: allVerified,
        allocations: updatedAllocations
      };
    }));

    const label = CHECK_STATUS_CONFIG.find(s => s.key === nextStatus)?.label || nextStatus;
    showToast(`Dr. Dan Tian set ${memberName} QC status to: ${label}`);

    // Automatically open comment editor when marked for Reprocessing so Dan can specify instructions
    if (nextStatus === 'reprocessing' && targetRound && alloc) {
      setQcCommentModal({
        roundId,
        roundNum: targetRound.round,
        memberName,
        status: 'reprocessing',
        notes: alloc.checkNotes || ''
      });
    }
  };

  const handleCycleMemberCheckStatus = (roundId: string, memberName: string) => {
    const targetRound = rounds.find(r => r.id === roundId);
    const alloc = targetRound?.allocations.find(a => a.memberName.toLowerCase() === memberName.toLowerCase());
    const currentStatus = alloc?.checkStatus || 'not_started';
    const statusOrder: CheckStatus[] = ['not_started', 'in_progress', 'qc_checked', 'reprocessing', 'verified'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    handleSetMemberCheckStatus(roundId, memberName, nextStatus);
  };

  // Modal: QC Reprocessing & QC Comments Editor (Dan / Admin)
  const [qcCommentModal, setQcCommentModal] = useState<{
    roundId: string;
    roundNum: number | string;
    memberName: string;
    status: CheckStatus;
    notes: string;
  } | null>(null);

  const handleOpenQcComment = (roundId: string, roundNum: number | string, a: MemberAllocation) => {
    if (!canManageAssignments) {
      showToast('QC comments are managed by Dr. Dan Tian or Lab Admin.');
      return;
    }
    setQcCommentModal({
      roundId,
      roundNum,
      memberName: a.memberName,
      status: a.checkStatus || 'not_started',
      notes: a.checkNotes || ''
    });
  };

  const handleSaveQcComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcCommentModal) return;
    const trimmed = (qcCommentModal.notes || '').trim();

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== qcCommentModal.roundId) return r;
      return {
        ...r,
        allocations: r.allocations.map(a => {
          if (a.memberName.toLowerCase() === qcCommentModal.memberName.toLowerCase()) {
            return {
              ...a,
              checkNotes: trimmed
            };
          }
          return a;
        })
      };
    }));

    showToast(`Saved QC comment for ${qcCommentModal.memberName}: "${trimmed || 'Cleared comment'}"`);
    setQcCommentModal(null);
  };

  // =========================================================================
  // REQUIREMENT 3: MEMBER-WISE BACKUP DATE STATUS
  // =========================================================================
  const handleToggleMemberBackup = (roundId: string, memberName: string) => {
    if (!canManageAssignments) {
      showToast('Backup archive status is managed by Dr. Dan Tian or Lab Admin.');
      return;
    }

    const targetRound = rounds.find(r => r.id === roundId);
    const alloc = targetRound?.allocations.find(a => a.memberName.toLowerCase() === memberName.toLowerCase());
    const isNowBackedUp = alloc?.backupStatus !== 'backed_up';

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const updatedAllocations = r.allocations.map(a => {
        if (a.memberName.toLowerCase() === memberName.toLowerCase()) {
          const nextStatus: BackupStatus = a.backupStatus === 'backed_up' ? 'not_started' : 'backed_up';
          return { ...a, backupStatus: nextStatus };
        }
        return a;
      });
      const allBackedUp = updatedAllocations.length > 0 && updatedAllocations.every(a => a.backupStatus === 'backed_up');
      return {
        ...r,
        backupCompleted: allBackedUp,
        allocations: updatedAllocations
      };
    }));

    showToast(isNowBackedUp 
      ? `💾 Marked ${memberName} backed up! Overall final total reservoir progress updated.` 
      : `Marked ${memberName} backup as pending.`);
  };

  const handleToggleBackup = (roundId: string) => {
    if (!canManageAssignments) {
      showToast('Backup archive status is verified in Admin Mode.');
      return;
    }

    const targetRound = rounds.find(r => r.id === roundId);
    const isNowBackedUp = !targetRound?.backupCompleted;

    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      const nextVal = !r.backupCompleted;
      const nextStatus: BackupStatus = nextVal ? 'backed_up' : 'not_started';
      return {
        ...r,
        backupCompleted: nextVal,
        allocations: r.allocations.map(a => ({ ...a, backupStatus: nextStatus }))
      };
    }));

    showToast(isNowBackedUp
      ? `💾 Round ${targetRound?.round} fully backed up! Overall final total reservoir progress updated.`
      : `Round ${targetRound?.round} backup set to pending.`);
  };

  // Inline member date update handler
  const handleUpdateMemberDate = (
    roundId: string,
    memberName: string,
    field: 'deliver' | 'collect' | 'check' | 'backup',
    newDate: string
  ) => {
    if (!canManageAssignments) {
      showToast('Dates are managed by Dr. Dan Tian or Lab Admin.');
      return;
    }
    updateRoundsAndSync(prev => prev.map(r => {
      if (r.id !== roundId) return r;
      return {
        ...r,
        allocations: r.allocations.map(a => {
          if (a.memberName.toLowerCase() === memberName.toLowerCase()) {
            if (field === 'deliver') return { ...a, deliverDate: newDate };
            if (field === 'collect') return { ...a, collectDate: newDate };
            if (field === 'check') return { ...a, checkDate: newDate };
            if (field === 'backup') return { ...a, backupDate: newDate };
          }
          return a;
        })
      };
    }));
    showToast(`Updated ${field} date for ${memberName} to: ${newDate}`);
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
    updateRoundsAndSync(prev => prev.map(r => r.id === editingRound.id ? editingRound : r));
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
    if (newRoundForm.saravananCount) allocations.push({ memberId: 'person-raju', memberName: 'Saravanan', countText: newRoundForm.saravananCount, numericCount: parseInt(newRoundForm.saravananCount) || 0, finishedCount: 0, completed: false, danVerified: false, deliverDate: newRoundForm.deliverDate, deliverStatus: 'not_started', collectDate: newRoundForm.collectDate, collectStatus: 'not_started', checkDate: newRoundForm.checkDate, checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' });
    if (newRoundForm.jiheeCount) allocations.push({ memberId: 'person-seo', memberName: 'Jihee', countText: newRoundForm.jiheeCount, numericCount: parseInt(newRoundForm.jiheeCount) || 0, finishedCount: 0, completed: false, danVerified: false, deliverDate: newRoundForm.deliverDate, deliverStatus: 'not_started', collectDate: newRoundForm.collectDate, collectStatus: 'not_started', checkDate: newRoundForm.checkDate, checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' });
    if (newRoundForm.tantuCount) allocations.push({ memberId: 'person-mandal', memberName: 'Tantu', countText: newRoundForm.tantuCount, numericCount: parseInt(newRoundForm.tantuCount) || 0, finishedCount: 0, completed: false, danVerified: false, deliverDate: newRoundForm.deliverDate, deliverStatus: 'not_started', collectDate: newRoundForm.collectDate, collectStatus: 'not_started', checkDate: newRoundForm.checkDate, checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' });
    if (newRoundForm.anindyaCount) allocations.push({ memberId: 'person-palaparthi', memberName: 'Anindya', countText: newRoundForm.anindyaCount, numericCount: parseInt(newRoundForm.anindyaCount) || 0, finishedCount: 0, completed: false, danVerified: false, deliverDate: newRoundForm.deliverDate, deliverStatus: 'not_started', collectDate: newRoundForm.collectDate, collectStatus: 'not_started', checkDate: newRoundForm.checkDate, checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' });
    if (newRoundForm.danCount) allocations.push({ memberId: 'person-tian', memberName: 'Dan', countText: newRoundForm.danCount, numericCount: parseInt(newRoundForm.danCount) || 0, finishedCount: 0, completed: false, danVerified: false, deliverDate: newRoundForm.deliverDate, deliverStatus: 'not_started', collectDate: newRoundForm.collectDate, collectStatus: 'not_started', checkDate: newRoundForm.checkDate, checkStatus: 'not_started', backupDate: 'Pending', backupStatus: 'not_started' });

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

    updateRoundsAndSync(prev => [...prev, newRow]);
    setIsAddModalOpen(false);
    showToast(`Added Round ${newRow.round} to schedule table!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Round',
      'Basin Details',
      'Cumulative Finish',
      'Member Workload & Progress',
      'Delivery Dates & Status',
      'Collect Dates & Status',
      'Check Dates & Dan QC Status',
      'Backup Dates & Status'
    ];
    
    const rows = rounds.map(r => {
      const basinStr = `"${r.basinTotalText} | ${r.subBasins.join('; ')}"`;
      const finishStr = `"${r.finishFormula || r.cumulativeFinished}"`;
      const allocStr = `"${r.allocations.map(a => `${a.memberName}: ${a.finishedCount}/${a.numericCount}`).join(', ')}"`;
      const deliverStr = `"${r.allocations.map(a => `${a.memberName}: ${a.deliverDate || '-'} [${a.deliverStatus === 'delivered' ? 'DELIVERED' : 'PENDING'}]`).join(', ')}"`;
      const collectStr = `"${r.allocations.map(a => `${a.memberName}: ${a.collectDate || '-'} [${a.collectStatus === 'collected' ? 'COLLECTED' : 'PENDING'}]`).join(', ')}"`;
      const checkStr = `"${r.allocations.map(a => `${a.memberName}: ${a.checkDate || '-'} [${a.checkStatus || 'not_started'}]`).join(', ')}"`;
      const backupStr = `"${r.allocations.map(a => `${a.memberName}: ${a.backupDate || '-'} [${a.backupStatus === 'backed_up' ? 'BACKED_UP' : 'PENDING'}]`).join(', ')}"`;

      return [r.round, basinStr, finishStr, allocStr, deliverStr, collectStr, checkStr, backupStr].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ERSL_Reservoir_Protocol_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported ERSL Reservoir Protocol Matrix CSV!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 font-sans">

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          TOP BANNER: ERSL RESERVOIR DATA ALLOCATION & DELINEATION PROTOCOL
          ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl shadow-xl border border-slate-800 p-6 sm:p-8 text-white">
        
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-[#9E1B32]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#9E1B32] text-white shadow-sm">
                <Waves className="w-3.5 h-3.5" />
                ERSL GeoAI & Hydrology Lab
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                SWOT & SAR Water Segmentation
              </span>

              {/* Cloud Sync Status Pill */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                cloudSyncStatus === 'synced'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-indigo-950 text-indigo-300 border-indigo-700'
              }`}>
                <Radio className={`w-3 h-3 ${realtimeActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{cloudSyncStatus === 'synced' ? 'Cloud Synced' : realtimeActive ? 'Live Realtime' : 'Local Storage'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              National Reservoir Delineation Protocol Table
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Official ERSL sprint allocation matrix tracking round-by-round basin delivery, team member allocation counts, collection dates, and Dr. Dan Tian's QA/QC quality verification.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Toggle Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !adminMode;
                setAdminMode(next);
                localStorage.setItem('ersl_reservoir_admin_mode', String(next));
                showToast(next ? 'Admin Mode Active — Workload, Members & Dates Fully Editable' : 'Member Mode Active — Work Progress Editing Enabled');
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
                  <span>Admin Mode: Full Edit</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-indigo-200" />
                  <span>Member Mode: Progress Only</span>
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
          
          {/* Card 1: Overall Progress based on Dan QC Verified Status */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-emerald-500/30" title="Overall work progress final total reservoir updated based on Dr. Dan Tian QC Verified status">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Overall Progress (Dan QC Verified)
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-950/90 border border-emerald-700/80 px-1.5 py-0.5 rounded">
                QC Verified Status
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {stats.qualityVerifiedCount.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {stats.grandAllocated.toLocaleString()} certified
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.verifiedRate)}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold">
                {stats.qualityVerifiedCount.toLocaleString()} verified ({stats.verifiedRate}%)
              </span>
              <span className="text-slate-400 text-[10px]">
                {stats.grandFinished.toLocaleString()} delineated
              </span>
            </div>
          </div>

          {/* Card 2: Backup Storage Progress */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60" title="Backup archive progress into Box cloud storage">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                Backup Archive Progress
              </span>
              <span className="text-[10px] font-black uppercase text-teal-400 bg-teal-950/80 border border-teal-800 px-1.5 py-0.5 rounded">
                Cloud Archive
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-300">
                {stats.grandBackedUp.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {stats.grandAllocated.toLocaleString()} stored
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.backupRate)}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-teal-400 font-bold">
                {stats.grandBackedUp.toLocaleString()} backed up ({stats.backupRate}%)
              </span>
              <span className="text-slate-400 text-[10px]">
                Box folder synced
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Active Sprint</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300">
                Round {activeSprintRound}
              </span>
              <span className="text-xs text-slate-400">
                ({currentRoundMetrics.roundObj?.basinTotalText || 'Sprint'})
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-300">
              Delivery: <strong>{currentRoundMetrics.roundObj?.deliverDateText}</strong> · Collect: <strong>{currentRoundMetrics.roundObj?.collectDateText}</strong>
            </div>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {isAutoTracking ? 'Auto-tracks by Delivery Date' : 'Manual View Selected'}
            </span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Dan's Review</span>
              <Hourglass className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-300">
                {stats.pendingDanQcCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                tasks ready for QC
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 font-medium">
              Completed by members & queued for Dan
            </p>
            <span className="text-[11px] text-purple-300 font-bold mt-1 inline-block">
              {canVerifyQuality ? 'Click check date circle to verify' : 'Pending Dan certification'}
            </span>
          </div>

        </div>
      </div>

      {/* CLOUD DATABASE SYNC HELPER BANNER (IF TABLE NOT YET CREATED IN SUPABASE) */}
      {cloudSyncStatus === 'table_needed' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200/80 rounded-lg text-amber-800 shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-amber-950">
                  Admin Setup: Enable Permanent Cross-Device Progress Sync
                </span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300">
                  1-Minute Action
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed max-w-3xl">
                When a lab member updates their finished reservoirs on their device, Supabase broadcasts it live via WebSockets. To ensure the Admin always sees the member's progress even after they close their browser, create the <code className="font-mono font-bold bg-amber-200/70 px-1 py-0.5 rounded text-amber-950">reservoir_matrix</code> table once in your Supabase project.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const sql = `CREATE TABLE IF NOT EXISTS public.reservoir_matrix (
  id text PRIMARY KEY,
  rounds jsonb NOT NULL,
  active_round int DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);
ALTER TABLE public.reservoir_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservoir_matrix_read" ON public.reservoir_matrix FOR SELECT USING (true);
CREATE POLICY "reservoir_matrix_write" ON public.reservoir_matrix FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservoir_matrix;`;
                navigator.clipboard.writeText(sql);
                showToast('📋 Copied Supabase SQL table code to clipboard!');
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              title="Copy the SQL command needed to create the table in Supabase"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Copy SQL</span>
            </button>

            <a
              href="https://supabase.com/dashboard/project/qulkwrhajibaddvgjaht/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-xs shadow-xs flex items-center gap-1.5 transition-colors"
              title="Open your Supabase project SQL Editor in a new tab"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              <span>Open Supabase SQL Editor</span>
            </a>

            <button
              type="button"
              onClick={async () => {
                showToast('Checking Supabase connection...');
                await fetchCloudData();
                if (cloudSyncStatus === 'synced') {
                  showToast('🎉 Cloud database connected! Member progress will now persist across all devices.');
                } else {
                  showToast('Table not found yet. Please paste and run the SQL in Supabase SQL Editor first.');
                }
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
              title="Verify if the table has been created in Supabase"
            >
              <Check className="w-4 h-4" />
              <span>Verify & Sync Now</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          PROGRESS DASHBOARD: BOTH OVERALL PROGRESS & CURRENT WEEK / ROUND PROGRESS
          (Auto-selected upon Delivery marked green!)
          ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#9E1B32]" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Individual Researcher Progress Matrix: Sprint vs. Overall
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track both current sprint (assigned week) processing and overall lab accomplishments for each researcher.
            </p>
          </div>

          {/* Tab Switcher & Round Selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Round / Week Selector with Auto-Advance Support */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-bold text-slate-600">Sprint Round:</span>
              <select
                value={manualRoundOverride !== null ? String(manualRoundOverride) : 'auto'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'auto') {
                    setManualRoundOverride(null);
                    showToast(`Auto-Tracking Active: Round ${autoDetectedActiveRound} is the active delivery sprint.`);
                  } else {
                    const num = parseInt(val) || 1;
                    setManualRoundOverride(num);
                  }
                }}
                className="text-xs font-extrabold text-[#9E1B32] bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="auto">
                  ⚡ Auto: Round {autoDetectedActiveRound} (Active Delivery Sprint)
                </option>
                {rounds.map(r => {
                  const isDelivered = r.deliverCompleted || (r.allocations.length > 0 && r.allocations.some(a => a.deliverStatus === 'delivered'));
                  const isVerified = r.allocations.length > 0 && r.allocations.every(a => a.checkStatus === 'verified' || a.danVerified);
                  let tag = isVerified ? '✓ Verified' : isDelivered ? '🟢 Delivered' : 'Scheduled';
                  return (
                    <option key={r.id} value={r.round}>
                      Round {r.round} ({tag})
                    </option>
                  );
                })}
              </select>

              {manualRoundOverride !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setManualRoundOverride(null);
                    showToast(`Returned to Auto-Tracking: Round ${autoDetectedActiveRound} is active based on Delivery.`);
                  }}
                  className="ml-1 text-[10px] text-cyan-800 bg-cyan-100 hover:bg-cyan-200 px-1.5 py-0.5 rounded font-extrabold cursor-pointer transition-colors"
                  title="Reset to Auto-detected active sprint"
                >
                  Reset Auto
                </button>
              )}
            </div>

            {/* View Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setProgressTab('combined')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  progressTab === 'combined'
                    ? 'bg-white text-[#9E1B32] shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View Both Current Assigned Week Progress and Overall Cumulative Progress"
              >
                Dual View (Both: Overall + Week)
              </button>
              <button
                type="button"
                onClick={() => setProgressTab('round')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  progressTab === 'round'
                    ? 'bg-white text-[#9E1B32] shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Round {activeSprintRound} Progress
              </button>
              <button
                type="button"
                onClick={() => setProgressTab('overall')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  progressTab === 'overall'
                    ? 'bg-white text-[#9E1B32] shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overall Cumulative
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Researcher Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Object.entries(stats.memberProgress).map(([shortName, p]: [string, any]) => {
            const memberInfo = teamMembers.get(shortName.toLowerCase());
            const roundMetric = currentRoundMetrics.roundMemberMetrics[shortName] || { assigned: 0, finished: 0, completed: false, danVerified: false };
            const roundPct = roundMetric.assigned > 0 ? Math.round((roundMetric.finished / roundMetric.assigned) * 100) : 0;
            const overallPct = p.assigned > 0 ? Math.round((p.finished / p.assigned) * 100) : 0;
            const isSelected = filterMember.toLowerCase() === shortName.toLowerCase();

            const isRoundVerified = roundMetric.danVerified;
            const isRoundDone = roundMetric.completed || (roundMetric.assigned > 0 && roundMetric.finished >= roundMetric.assigned);

            return (
              <div 
                key={shortName}
                onClick={() => setFilterMember(isSelected ? 'all' : shortName)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#9E1B32] ring-2 ring-[#9E1B32]/30 bg-red-50/60 shadow-md' 
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
                title={isSelected ? "Click to clear filter" : `Click to filter schedule for ${shortName}`}
              >
                <div>
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
                  </div>

                  {/* Section 1: Current Round / Week Progress */}
                  {(progressTab === 'combined' || progressTab === 'round') && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#9E1B32] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Round {activeSprintRound} Sprint:
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {roundMetric.finished} / {roundMetric.assigned}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isRoundVerified ? 'bg-emerald-500' : isRoundDone ? 'bg-purple-600' : 'bg-[#9E1B32]'
                          }`}
                          style={{ width: `${Math.min(100, roundPct)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        {isRoundVerified ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Dan QC Verified
                          </span>
                        ) : roundMetric.checkStatus === 'qc_checked' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-100/80 px-1.5 py-0.5 rounded">
                            <Hourglass className="w-3 h-3 text-purple-600" />
                            QC Checked
                          </span>
                        ) : roundMetric.checkStatus === 'reprocessing' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-sky-700 bg-sky-100/80 px-1.5 py-0.5 rounded">
                            <Sliders className="w-3 h-3 text-sky-600" />
                            Reprocessing
                          </span>
                        ) : roundMetric.finished > 0 ? (
                          <span className="text-amber-700 font-bold">
                            {roundPct}% in progress
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            0 / {roundMetric.assigned}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Overall Cumulative Progress (Final Total based on Dan QC Verified Status) */}
                  {(progressTab === 'combined' || progressTab === 'overall') && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5" title="Final overall progress confirmed by Dr. Dan Tian QC Verified status">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Overall Total (Dan Verified):
                        </span>
                        <span className="font-mono font-black text-emerald-900">
                          {p.qualityVerified} / {p.assigned}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, p.verifiedRate)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Delineated: <strong className="text-slate-700">{p.finished}</strong> ({overallPct}%)</span>
                        <span className="font-bold text-emerald-700">{p.verifiedRate}% Verified</span>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                        <span>Box Backup: <strong className="text-teal-700">{p.backedUp}</strong> ({p.backedUpRate}%)</span>
                        <span>{p.completedTasks} of {p.tasksCount} rounds certified</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                  <span>Click to view rounds</span>
                  <span>{shortName}</span>
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

        {/* Member Filter & View Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#9E1B32] cursor-pointer"
            >
              <option value="all">All Researchers (Full Table)</option>
              {matrixMemberNames.map(m => (
                <option key={m} value={m}>{m} only</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
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
              Official Protocol Table
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
              Member Matrix Grid
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: OFFICIAL ERSL RESERVOIR PROTOCOL TABLE
          Columns: Round | Basin | Number | Delivery date | Collect date | Check date | Backup date
          ========================================================================= */}
      {viewMode === 'protocol' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Table Header & Symbol Legend */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9E1B32]" />
                <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase">
                  Reservoir Allocation & Delineation Schedule
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Table format matching ERSL protocol. Numbers, assignments, dates, and quality statuses update dynamically and sync across lab members.
              </p>
            </div>

            {/* STATUS SYMBOLS LEGEND (Requirement 3) */}
            <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mr-1">
                Symbols:
              </span>
              <span className="flex items-center gap-1" title="Empty circle: Not Yet Started">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 bg-white inline-block"></span>
                <span className="text-slate-600">Not Started</span>
              </span>
              <span className="flex items-center gap-1" title="Orange circle: In Progress">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-amber-600 inline-block"></span>
                <span className="text-amber-800 font-bold">In Progress</span>
              </span>
              <span className="flex items-center gap-1" title="Purple circle: QC Checked by Dan">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-700 border border-purple-800 inline-flex items-center justify-center text-white text-[8px] font-bold">✓</span>
                <span className="text-purple-800 font-bold">Dan QC Checked</span>
              </span>
              <span className="flex items-center gap-1" title="Blue circle: Reprocessing / Needs Correction">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-sky-600 inline-block"></span>
                <span className="text-sky-800 font-bold">Reprocessing</span>
              </span>
              <span className="flex items-center gap-1" title="Solid green circle: Dan QC Verified / Done">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-emerald-700 inline-flex items-center justify-center text-white text-[8px] font-bold">✓</span>
                <span className="text-emerald-800 font-bold">Dan Verified / Delivered</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-xs font-black border-b border-slate-200">
                  <th className="py-3.5 px-3 w-16 text-center border-r border-slate-200">Round</th>
                  <th className="py-3.5 px-4 w-64 border-r border-slate-200">Basin & Cumulative Finish</th>
                  
                  {/* REQUIREMENT 1: Number (Member Workload) */}
                  <th className="py-3.5 px-4 min-w-[280px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Number (Member Workload)</span>
                      {canManageAssignments && (
                        <span className="text-[10px] text-emerald-800 font-extrabold uppercase bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                          Dan / Admin Edit
                        </span>
                      )}
                    </div>
                  </th>

                  {/* REQUIREMENT 2 & 3: Delivery Date (Spelling Corrected) */}
                  <th className="py-3.5 px-3 min-w-[170px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Delivery Date</span>
                      <span className="text-[9px] text-slate-400 font-normal">Member-wise</span>
                    </div>
                  </th>

                  {/* REQUIREMENT 3: Collect Date */}
                  <th className="py-3.5 px-3 min-w-[170px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Collect Date</span>
                      <span className="text-[9px] text-slate-400 font-normal">Member-wise</span>
                    </div>
                  </th>

                  {/* REQUIREMENT 3: Check Date (QC Check Data) */}
                  <th className="py-3.5 px-3 min-w-[230px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Check Date</span>
                      <span className="text-[9px] text-purple-700 font-bold uppercase bg-purple-50 px-1 rounded">
                        QC Check Data
                      </span>
                    </div>
                  </th>

                  {/* REQUIREMENT 3: Backup Date */}
                  <th className="py-3.5 px-3 min-w-[160px] border-r border-slate-200">
                    <div className="flex items-center justify-between">
                      <span>Backup Date</span>
                      <span className="text-[9px] text-slate-400 font-normal">Member-wise</span>
                    </div>
                  </th>

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
                    const isAllMembersVerified = r.allocations.length > 0 && r.allocations.every(a => a.checkStatus === 'verified' || a.danVerified);

                    return (
                      <tr 
                        key={r.id} 
                        className={`transition-colors hover:bg-slate-50/70 ${
                          isAllMembersVerified ? 'bg-emerald-50/20' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        {/* 1. Round */}
                        <td className="py-4 px-3 text-center font-black text-sm text-slate-900 border-r border-slate-200 align-top">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black border ${
                            Number(r.round) === activeSprintRound 
                              ? 'bg-[#9E1B32] text-white border-red-700 shadow-sm'
                              : 'bg-slate-100 border-slate-300 text-slate-800'
                          }`}>
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

                          {/* Finish Cumulative based on Dan QC Verified Progress */}
                          {r.finishFormula && (
                            <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                              {r.checkCompleted ? (
                                <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 shadow-2xs" title="Final cumulative total confirmed by Dr. Dan Tian QC Verification">
                                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                  {r.finishFormula} (✓ Dan QC Verified)
                                </span>
                              ) : r.backupCompleted ? (
                                <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 flex items-center gap-1" title="Backed up to Box, pending Dan QC certification">
                                  <Database className="w-3 h-3 text-teal-600" />
                                  {r.finishFormula} (Backed Up · Pending Dan QC)
                                </span>
                              ) : (
                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1" title="Target finish. Final overall total updates when this round is Dan QC Verified.">
                                  <span className="w-2 h-2 rounded-full border border-slate-400 bg-white" />
                                  {r.finishFormula} (QC Pending)
                                </span>
                              )}
                            </div>
                          )}

                          {r.notes && (
                            <p className="text-[10px] text-slate-400 italic line-clamp-2" title={r.notes}>
                              {r.notes}
                            </p>
                          )}
                        </td>

                        {/* =========================================================================
                            3. NUMBER (MEMBER WORKLOAD) — REQUIREMENT 1
                            - Editable by Dan or Admin (add/remove member, edit target workload)
                            - Dan QC and double tick mark REMOVED from this column
                            - Members can only edit their work progress number (finishedCount)
                            ========================================================================= */}
                        <td className="py-4 px-4 border-r border-slate-200 align-top space-y-2">
                          <div className="space-y-1.5">
                            {r.allocations.map((a, aIdx) => {
                              const isMemberHighlighted = filterMember !== 'all' && a.memberName.toLowerCase().includes(filterMember.toLowerCase());

                              return (
                                <div 
                                  key={aIdx} 
                                  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-all ${
                                    isMemberHighlighted
                                      ? 'bg-red-50 border-red-300 ring-1 ring-[#9E1B32]/30 font-bold'
                                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs'
                                  }`}
                                >
                                  {/* Member Name and Work Progress Number */}
                                  <div 
                                    onClick={() => handleOpenSampleModal(r, a)}
                                    className="flex items-center justify-between flex-1 text-xs cursor-pointer hover:text-[#9E1B32] transition-colors"
                                    title={canManageAssignments ? "Click to edit workload targets & progress (Admin/Dan)" : "Click to edit your work progress number"}
                                  >
                                    <span className="font-bold text-slate-800">
                                      {a.memberName}:
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                      <span className={`font-mono text-[11px] font-extrabold px-2 py-0.5 rounded border ${
                                        a.finishedCount >= a.numericCount && a.numericCount > 0
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

                                  {/* Remove member from this week/round (Dan / Admin only) */}
                                  {canManageAssignments && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Remove ${a.memberName} from Round ${r.round}?`)) {
                                          handleRemoveMemberFromRound(r.id, a.memberName);
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                      title={`Remove ${a.memberName} from Round ${r.round} (Admin/Dan)`}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}

                            {/* Dan / Admin: + Add Member to this particular week/round */}
                            {canManageAssignments && (
                              <button
                                type="button"
                                onClick={() => handleOpenAddMemberModal(r)}
                                className="w-full mt-1.5 py-1 px-2 border border-dashed border-slate-300 hover:border-[#9E1B32] hover:bg-red-50/50 rounded-md text-[11px] font-extrabold text-slate-600 hover:text-[#9E1B32] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                title="Assign or add a member for this particular week/round (Admin/Dan)"
                              >
                                <UserPlus className="w-3 h-3" />
                                <span>+ Add Member</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* =========================================================================
                            4. DELIVERY DATE (REQUIREMENTS 2, 3, 4)
                            - Corrected spelling: "Delivery Date"
                            - Member-wise list with Date + 2 symbols:
                              ⚪ Empty circle (not yet started)
                              🟢 Solid green circle (delivered)
                            - Dan/Admin only can toggle status or change date
                            - When marked green, triggers auto-selection of active sprint based on delivery date + Dual View!
                            ========================================================================= */}
                        <td className="py-4 px-3 border-r border-slate-200 align-top space-y-1.5">
                          {r.allocations.map((a, aIdx) => (
                            <div key={aIdx} className="flex items-center justify-between gap-1.5 p-1 rounded hover:bg-slate-100/70 transition-colors">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div 
                                  onClick={() => handleToggleMemberDelivery(r.id, a.memberName)}
                                  className={`shrink-0 ${canManageAssignments ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} transition-transform`}
                                  title={canManageAssignments ? "Click to toggle delivery status (Admin/Dan)" : a.deliverStatus === 'delivered' ? 'Delivered' : 'Not yet started'}
                                >
                                  {a.deliverStatus === 'delivered' ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-700 flex items-center justify-center text-white shadow-xs">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-white hover:border-emerald-600 transition-colors" />
                                  )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-800 truncate">
                                  {a.memberName.split(' ')[0]}:
                                </span>
                              </div>

                              {/* Editable Date for Dan / Admin */}
                              <div className="shrink-0 text-right">
                                {editingDateCell?.roundId === r.id && editingDateCell?.memberName === a.memberName && editingDateCell?.field === 'deliver' ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingDateCell.tempVal}
                                      onChange={(e) => setEditingDateCell({ ...editingDateCell, tempVal: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateMemberDate(r.id, a.memberName, 'deliver', editingDateCell.tempVal);
                                          setEditingDateCell(null);
                                        } else if (e.key === 'Escape') {
                                          setEditingDateCell(null);
                                        }
                                      }}
                                      className="w-18 px-1 py-0.5 text-[10px] font-mono font-bold bg-white border border-blue-400 rounded outline-none shadow-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateMemberDate(r.id, a.memberName, 'deliver', editingDateCell.tempVal);
                                        setEditingDateCell(null);
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    onClick={() => {
                                      if (!canManageAssignments) {
                                        showToast('Delivery dates are managed by Dr. Dan Tian or Lab Admin.');
                                        return;
                                      }
                                      setEditingDateCell({
                                        roundId: r.id,
                                        memberName: a.memberName,
                                        field: 'deliver',
                                        tempVal: a.deliverDate || r.deliverDateText || ''
                                      });
                                    }}
                                    className={`text-[11px] font-mono ${
                                      canManageAssignments ? 'cursor-pointer hover:underline' : 'cursor-default'
                                    } ${a.deliverStatus === 'delivered' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
                                    title={canManageAssignments ? "Click to edit delivery date (Admin/Dan)" : "Delivery Date"}
                                  >
                                    {a.deliverDate || r.deliverDateText || '-'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Quick round delivery button and active delivery sprint indicator for Dan / Admin */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            {canManageAssignments ? (
                              <button
                                type="button"
                                onClick={() => handleToggleDeliver(r.id)}
                                className={`font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                  r.deliverCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Mark entire round delivery done and auto-select sprint based on delivery date"
                              >
                                {r.deliverCompleted ? '✓ Round Delivered' : 'Deliver All'}
                              </button>
                            ) : <div />}

                            {Number(r.round) === activeSprintRound ? (
                              <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5" title="This round is the active sprint determined by delivery date">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Active Delivery
                              </span>
                            ) : (
                              canManageAssignments && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExplicitActiveDeliveryRound(Number(r.round));
                                    setManualRoundOverride(null);
                                    setProgressTab('combined');
                                    updateRoundsAndSync(p => [...p], Number(r.round));
                                    showToast(`⚡ Switched active delivery sprint to Round ${r.round}! Auto-selected Dual View.`);
                                  }}
                                  className="text-[9px] text-slate-400 hover:text-emerald-700 hover:underline cursor-pointer"
                                  title="Set this delivery round as the active sprint"
                                >
                                  Set Active
                                </button>
                              )
                            )}
                          </div>
                        </td>

                        {/* =========================================================================
                            5. COLLECT DATE (REQUIREMENT 3)
                            - Member-wise list with Date + 2 symbols:
                              ⚪ Empty circle (not yet started)
                              🟢 Solid green circle (collected)
                            - Dan/Admin only can toggle status or change date
                            ========================================================================= */}
                        <td className="py-4 px-3 border-r border-slate-200 align-top space-y-1.5">
                          {r.allocations.map((a, aIdx) => (
                            <div key={aIdx} className="flex items-center justify-between gap-1.5 p-1 rounded hover:bg-slate-100/70 transition-colors">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div 
                                  onClick={() => handleToggleMemberCollect(r.id, a.memberName)}
                                  className={`shrink-0 ${canManageAssignments ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} transition-transform`}
                                  title={canManageAssignments ? "Click to toggle collect status (Admin/Dan)" : a.collectStatus === 'collected' ? 'Collected' : 'Not yet started'}
                                >
                                  {a.collectStatus === 'collected' ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-700 flex items-center justify-center text-white shadow-xs">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-white hover:border-emerald-600 transition-colors" />
                                  )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-800 truncate">
                                  {a.memberName.split(' ')[0]}:
                                </span>
                              </div>

                              {/* Editable Date for Dan / Admin */}
                              <div className="shrink-0 text-right">
                                {editingDateCell?.roundId === r.id && editingDateCell?.memberName === a.memberName && editingDateCell?.field === 'collect' ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingDateCell.tempVal}
                                      onChange={(e) => setEditingDateCell({ ...editingDateCell, tempVal: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateMemberDate(r.id, a.memberName, 'collect', editingDateCell.tempVal);
                                          setEditingDateCell(null);
                                        } else if (e.key === 'Escape') {
                                          setEditingDateCell(null);
                                        }
                                      }}
                                      className="w-18 px-1 py-0.5 text-[10px] font-mono font-bold bg-white border border-blue-400 rounded outline-none shadow-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateMemberDate(r.id, a.memberName, 'collect', editingDateCell.tempVal);
                                        setEditingDateCell(null);
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    onClick={() => {
                                      if (!canManageAssignments) {
                                        showToast('Collect dates are managed by Dr. Dan Tian or Lab Admin.');
                                        return;
                                      }
                                      setEditingDateCell({
                                        roundId: r.id,
                                        memberName: a.memberName,
                                        field: 'collect',
                                        tempVal: a.collectDate || r.collectDateText || ''
                                      });
                                    }}
                                    className={`text-[11px] font-mono ${
                                      canManageAssignments ? 'cursor-pointer hover:underline' : 'cursor-default'
                                    } ${a.collectStatus === 'collected' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
                                    title={canManageAssignments ? "Click to edit collect date (Admin/Dan)" : "Collect Date"}
                                  >
                                    {a.collectDate || r.collectDateText || '-'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Quick round collect toggle */}
                          {canManageAssignments && (
                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <button
                                type="button"
                                onClick={() => handleToggleCollect(r.id)}
                                className={`font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                  r.collectCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Toggle entire round collection status"
                              >
                                {r.collectCompleted ? '✓ Round Collected' : 'Collect All'}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* =========================================================================
                            6. CHECK DATE (QC CHECK DATA) — REQUIREMENT 3
                            - Member-wise list with Date + 5 Symbols:
                              ⚪ Empty circle (not yet started)
                              🟠 Orange filled circle (in progress)
                              🟣 Purple circle (QC checked by Dan)
                              🔵 Blue filled circle (reprocessing)
                              🟢 Solid green circle (Dan QC verified)
                            - Dan/Admin only can edit status, date, or notes
                            ========================================================================= */}
                        <td className="py-4 px-3 border-r border-slate-200 align-top space-y-1.5">
                          {r.allocations.map((a, aIdx) => {
                            const statusConfig = CHECK_STATUS_CONFIG.find(s => s.key === a.checkStatus) || CHECK_STATUS_CONFIG[0];
                            const isMenuOpen = checkStatusMenu?.roundId === r.id && checkStatusMenu?.memberName === a.memberName;

                            return (
                              <div key={aIdx} className="relative group p-1 rounded hover:bg-slate-100/70 transition-colors">
                                <div className="flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {/* Status symbol — Click cycles to next status */}
                                    <div 
                                      onClick={() => {
                                        if (canManageAssignments) {
                                          handleCycleMemberCheckStatus(r.id, a.memberName);
                                        } else {
                                          showToast(`Current QC status: ${statusConfig.label}`);
                                        }
                                      }}
                                      className={`shrink-0 ${canManageAssignments ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} transition-transform`}
                                      title={canManageAssignments ? `${statusConfig.label} — Click to cycle status, or use menu` : statusConfig.label}
                                    >
                                      {a.checkStatus === 'verified' ? (
                                        <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-700 flex items-center justify-center text-white shadow-xs text-[9px] font-black">
                                          ✓
                                        </div>
                                      ) : a.checkStatus === 'qc_checked' ? (
                                        <div className="w-4 h-4 rounded-full bg-purple-700 border border-purple-800 flex items-center justify-center text-white shadow-xs text-[9px] font-black">
                                          ✓
                                        </div>
                                      ) : a.checkStatus === 'reprocessing' ? (
                                        <div className="w-4 h-4 rounded-full bg-sky-500 border border-sky-600 shadow-xs flex items-center justify-center text-white text-[8px] font-bold">
                                          ↺
                                        </div>
                                      ) : a.checkStatus === 'in_progress' ? (
                                        <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-600 shadow-xs" />
                                      ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-white hover:border-amber-500 transition-colors" />
                                      )}
                                    </div>

                                    <span className="text-[11px] font-semibold text-slate-800 truncate">
                                      {a.memberName.split(' ')[0]}:
                                    </span>

                                    {/* Status picker dropdown arrow for Dan / Admin */}
                                    {canManageAssignments && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCheckStatusMenu(isMenuOpen ? null : { roundId: r.id, memberName: a.memberName });
                                        }}
                                        className="text-slate-400 hover:text-purple-700 p-0.5 rounded cursor-pointer"
                                        title="Select Dan QC status directly"
                                      >
                                        <ChevronDown className="w-2.5 h-2.5" />
                                      </button>
                                    )}

                                    {/* Quick QC Comment button for Dan / Admin */}
                                    {canManageAssignments && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenQcComment(r.id, r.round, a);
                                        }}
                                        className={`p-0.5 rounded cursor-pointer transition-colors ${
                                          a.checkNotes 
                                            ? 'text-sky-600 hover:text-sky-800 hover:bg-sky-50' 
                                            : 'text-slate-300 hover:text-sky-600 hover:bg-slate-100'
                                        }`}
                                        title={a.checkNotes ? `QC Comment: "${a.checkNotes}" — Click to edit` : "Add QC/Reprocessing comment"}
                                      >
                                        {a.checkNotes ? (
                                          <MessageSquare className="w-3 h-3 fill-sky-100" />
                                        ) : (
                                          <MessageSquarePlus className="w-3 h-3" />
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {/* Editable Check Date */}
                                  <div className="shrink-0 text-right">
                                    {editingDateCell?.roundId === r.id && editingDateCell?.memberName === a.memberName && editingDateCell?.field === 'check' ? (
                                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="text"
                                          autoFocus
                                          value={editingDateCell.tempVal}
                                          onChange={(e) => setEditingDateCell({ ...editingDateCell, tempVal: e.target.value })}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleUpdateMemberDate(r.id, a.memberName, 'check', editingDateCell.tempVal);
                                              setEditingDateCell(null);
                                            } else if (e.key === 'Escape') {
                                              setEditingDateCell(null);
                                            }
                                          }}
                                          className="w-18 px-1 py-0.5 text-[10px] font-mono font-bold bg-white border border-blue-400 rounded outline-none shadow-xs"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            handleUpdateMemberDate(r.id, a.memberName, 'check', editingDateCell.tempVal);
                                            setEditingDateCell(null);
                                          }}
                                          className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                        >
                                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span
                                        onClick={() => {
                                          if (!canManageAssignments) {
                                            showToast('QC check dates are managed by Dr. Dan Tian or Lab Admin.');
                                            return;
                                          }
                                          setEditingDateCell({
                                            roundId: r.id,
                                            memberName: a.memberName,
                                            field: 'check',
                                            tempVal: a.checkDate || r.checkDateText || ''
                                          });
                                        }}
                                        className={`text-[11px] font-mono ${
                                          canManageAssignments ? 'cursor-pointer hover:underline' : 'cursor-default'
                                        } ${a.checkStatus === 'verified' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
                                        title={canManageAssignments ? "Click to edit check date (Admin/Dan)" : "Check Date"}
                                      >
                                        {a.checkDate || r.checkDateText || '-'}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Prominent Reprocessing Callout Banner & Instructions */}
                                {a.checkStatus === 'reprocessing' ? (
                                  <div className="mt-1 ml-5 p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-[10px] text-sky-950 shadow-2xs space-y-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-black text-sky-800 flex items-center gap-1 text-[9px] uppercase tracking-wider">
                                        <RotateCcw className="w-2.5 h-2.5 text-sky-600" />
                                        Reprocessing Required
                                      </span>
                                      {canManageAssignments && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenQcComment(r.id, r.round, a)}
                                          className="text-sky-600 hover:text-sky-800 p-0.5 rounded cursor-pointer"
                                          title="Edit Dan QC Instructions"
                                        >
                                          <Edit3 className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </div>
                                    {a.checkNotes ? (
                                      <p className="text-[10px] text-sky-950 leading-snug font-medium break-words bg-white/80 p-1 rounded border border-sky-100">
                                        "{a.checkNotes}"
                                      </p>
                                    ) : (
                                      canManageAssignments ? (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenQcComment(r.id, r.round, a)}
                                          className="text-[9px] font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
                                        >
                                          <MessageSquarePlus className="w-2.5 h-2.5" />
                                          + Add Reprocessing Instructions
                                        </button>
                                      ) : (
                                        <p className="text-[9px] text-sky-600 italic">
                                          Awaiting instructions from Dr. Dan Tian...
                                        </p>
                                      )
                                    )}
                                  </div>
                                ) : a.checkNotes ? (
                                  <div className="mt-1 ml-5 p-1 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-start justify-between gap-1">
                                    <p className="italic truncate" title={a.checkNotes}>
                                      QC Note: "{a.checkNotes}"
                                    </p>
                                    {canManageAssignments && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenQcComment(r.id, r.round, a)}
                                        className="text-slate-400 hover:text-slate-700 shrink-0 p-0.5"
                                        title="Edit QC Comment"
                                      >
                                        <Edit3 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                ) : null}

                                {/* Floating popover for Dan / Admin to select exact QC status */}
                                {isMenuOpen && (
                                  <div 
                                    className="absolute left-0 top-full z-40 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 space-y-1 min-w-[220px] animate-in fade-in zoom-in-95"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="text-[10px] font-black text-slate-400 px-2 py-0.5 uppercase tracking-wider">
                                      Select QC Status ({a.memberName}):
                                    </div>
                                    {CHECK_STATUS_CONFIG.map(s => (
                                      <button
                                        key={s.key}
                                        type="button"
                                        onClick={() => {
                                          handleSetMemberCheckStatus(r.id, a.memberName, s.key);
                                          setCheckStatusMenu(null);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-left transition-colors cursor-pointer ${
                                          a.checkStatus === s.key ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300' : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                      >
                                        <span className={`w-3.5 h-3.5 rounded-full ${s.circleClass} shrink-0`}>
                                          {s.key === 'verified' || s.key === 'qc_checked' ? '✓' : ''}
                                        </span>
                                        <span>{s.label}</span>
                                        {a.checkStatus === s.key && <Check className="w-3.5 h-3.5 ml-auto text-emerald-600" />}
                                      </button>
                                    ))}

                                    <div className="pt-1 mt-1 border-t border-slate-100">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCheckStatusMenu(null);
                                          handleOpenQcComment(r.id, r.round, a);
                                        }}
                                        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 transition-colors cursor-pointer"
                                      >
                                        <MessageSquarePlus className="w-3 h-3 text-sky-600" />
                                        <span>{a.checkNotes ? 'Edit Reprocessing Comment' : '+ Add Reprocessing Comment'}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </td>

                        {/* =========================================================================
                            7. BACKUP DATE (REQUIREMENT 3)
                            - Member-wise list with Date + 2 symbols:
                              ⚪ Empty circle (not yet started)
                              🟢 Solid green circle (backed up)
                            - Dan/Admin only can toggle status or change date
                            ========================================================================= */}
                        <td className="py-4 px-3 border-r border-slate-200 align-top space-y-1.5">
                          {r.allocations.map((a, aIdx) => (
                            <div key={aIdx} className="flex items-center justify-between gap-1.5 p-1 rounded hover:bg-slate-100/70 transition-colors">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div 
                                  onClick={() => handleToggleMemberBackup(r.id, a.memberName)}
                                  className={`shrink-0 ${canManageAssignments ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} transition-transform`}
                                  title={canManageAssignments ? "Click to toggle backup status (Admin/Dan)" : a.backupStatus === 'backed_up' ? 'Backed Up' : 'Pending'}
                                >
                                  {a.backupStatus === 'backed_up' ? (
                                    <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-700 flex items-center justify-center text-white shadow-xs">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-white hover:border-emerald-600 transition-colors" />
                                  )}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-800 truncate">
                                  {a.memberName.split(' ')[0]}:
                                </span>
                              </div>

                              {/* Editable Date for Dan / Admin */}
                              <div className="shrink-0 text-right">
                                {editingDateCell?.roundId === r.id && editingDateCell?.memberName === a.memberName && editingDateCell?.field === 'backup' ? (
                                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingDateCell.tempVal}
                                      onChange={(e) => setEditingDateCell({ ...editingDateCell, tempVal: e.target.value })}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleUpdateMemberDate(r.id, a.memberName, 'backup', editingDateCell.tempVal);
                                          setEditingDateCell(null);
                                        } else if (e.key === 'Escape') {
                                          setEditingDateCell(null);
                                        }
                                      }}
                                      className="w-18 px-1 py-0.5 text-[10px] font-mono font-bold bg-white border border-blue-400 rounded outline-none shadow-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateMemberDate(r.id, a.memberName, 'backup', editingDateCell.tempVal);
                                        setEditingDateCell(null);
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                    >
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    onClick={() => {
                                      if (!canManageAssignments) {
                                        showToast('Backup dates are managed by Dr. Dan Tian or Lab Admin.');
                                        return;
                                      }
                                      setEditingDateCell({
                                        roundId: r.id,
                                        memberName: a.memberName,
                                        field: 'backup',
                                        tempVal: a.backupDate || r.backupDateText || 'Pending'
                                      });
                                    }}
                                    className={`text-[11px] font-mono ${
                                      canManageAssignments ? 'cursor-pointer hover:underline' : 'cursor-default'
                                    } ${a.backupStatus === 'backed_up' ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}
                                    title={canManageAssignments ? "Click to edit backup date (Admin/Dan)" : "Backup Date"}
                                  >
                                    {a.backupDate || r.backupDateText || (a.backupStatus === 'backed_up' ? '✓ Done' : 'Pending')}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Quick round backup toggle */}
                          {canManageAssignments && (
                            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <button
                                type="button"
                                onClick={() => handleToggleBackup(r.id)}
                                className={`font-extrabold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                  r.backupCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                                title="Toggle entire round backup status"
                              >
                                {r.backupCompleted ? '✓ Round Backed Up' : 'Backup All'}
                              </button>
                            </div>
                          )}
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
                  <td className="py-4 px-3 text-center font-black text-cyan-400">
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
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {stats.qualityVerifiedCount.toLocaleString()} Quality Verified ({stats.verifiedRate}%)
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400" />
              <span>
                ERSL Protocol Matrix: Live-synced across lab researchers. Delivery, collection, check, and backup statuses are signed off by Dr. Dan Tian or Lab Admin.
              </span>
            </div>
            <div className="font-semibold text-slate-700">
              ERSL Hydrology & GeoAI Lab · Dr. Hongxing Liu · Dr. Dan Tian
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
              Click any cell to edit completed samples and progress numbers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-xs font-black border-b border-slate-200">
                  <th className="py-3 px-4 w-20">Round</th>
                  <th className="py-3 px-4">Basin</th>
                  {matrixMemberNames.map(m => (
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

                    {matrixMemberNames.map(name => {
                      const alloc = r.allocations.find(a => a.memberName.toLowerCase().includes(name.toLowerCase()));
                      if (!alloc) {
                        return (
                          <td key={name} className="py-3.5 px-4 border-l border-slate-200 text-slate-300 italic">
                            -
                          </td>
                        );
                      }

                      const isVerified = alloc.checkStatus === 'verified' || alloc.danVerified;
                      const isSamplesDone = alloc.completed || (alloc.numericCount > 0 && alloc.finishedCount >= alloc.numericCount);

                      return (
                        <td 
                          key={name}
                          onClick={() => handleOpenSampleModal(r, alloc)}
                          className={`py-3.5 px-4 border-l border-slate-200 cursor-pointer transition-colors ${
                            isVerified ? 'bg-emerald-50/40 hover:bg-emerald-50' : isSamplesDone ? 'bg-purple-50/40 hover:bg-purple-50' : 'hover:bg-slate-100/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isVerified ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : alloc.checkStatus === 'qc_checked' ? (
                              <div className="w-4 h-4 rounded-full bg-purple-700 flex items-center justify-center text-white text-[10px] shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : alloc.checkStatus === 'reprocessing' ? (
                              <div className="w-4 h-4 rounded-full bg-sky-500 shrink-0" />
                            ) : alloc.checkStatus === 'in_progress' ? (
                              <div className="w-4 h-4 rounded-full bg-amber-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                            )}
                            <div>
                              <div className="font-mono font-bold text-slate-900">
                                {alloc.finishedCount} / {alloc.countText}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {isVerified ? 'Verified' : isSamplesDone ? 'Ready for Dan' : 'Working'}
                              </div>
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
          MODAL: ADD MEMBER TO ROUND (REQUIREMENT 1 - DAN / ADMIN ONLY)
          ========================================================================= */}
      {addMemberModal && addMemberModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9E1B32]">
                  Workload Assignment · Round {addMemberModal.roundNum}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Assign Member to this Week
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setAddMemberModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddMember} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Lab Researcher:
                </label>
                <select
                  value={newMemberForm.memberName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, memberName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="Saravanan Raju">Saravanan Raju</option>
                  <option value="Jihee Seo">Jihee Seo</option>
                  <option value="Tantu Mandal">Tantu Mandal</option>
                  <option value="Anindya Palaparthi">Anindya Palaparthi</option>
                  <option value="Dr. Dan Tian">Dr. Dan Tian</option>
                  <option value="Ms. Yuliia Miliutina">Ms. Yuliia Miliutina</option>
                  <option value="Dr. Hongxing Liu">Dr. Hongxing Liu</option>
                  <option value="Other">Other / Custom Name...</option>
                </select>
              </div>

              {newMemberForm.memberName === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Researcher Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberForm.customName}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, customName: e.target.value })}
                    placeholder="Enter researcher name"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Reservoirs Workload Target:
                </label>
                <input
                  type="text"
                  required
                  value={newMemberForm.workloadCount}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, workloadCount: e.target.value })}
                  placeholder="e.g. 20, 35 (small), 40"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Date:
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.deliverDate}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, deliverDate: e.target.value })}
                    placeholder="e.g. 10/7 Wed"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Collect Date:
                  </label>
                  <input
                    type="text"
                    value={newMemberForm.collectDate}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, collectDate: e.target.value })}
                    placeholder="e.g. 10/19 Mon"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddMemberModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign to Round</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MEMBER WORK PROGRESS & WORKLOAD SAMPLES (REQUIREMENT 1)
          - Regular members can ONLY edit finishedCount (progress number).
          - Dan / Admin can also adjust workload target (numericCount / countText).
          ========================================================================= */}
      {sampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9E1B32]">
                  {canManageAssignments ? 'Workload & Progress Editor' : 'Member Work Progress'}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {sampleModal.memberName} — Round {sampleModal.roundNum}
                </h3>
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
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Basin Target:</span>
                  <span className="font-extrabold text-slate-900">{sampleModal.basinName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Researcher:</span>
                  <span className="font-bold text-slate-800">{sampleModal.memberName}</span>
                </div>
              </div>

              {/* Workload Target: Editable by Dan / Admin only */}
              {canManageAssignments ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Assigned Workload Target:
                    </label>
                    <span className="text-[10px] font-extrabold text-[#9E1B32] uppercase bg-red-50 px-1.5 py-0.2 rounded">
                      Admin / Dan Edit
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={sampleModal.countText}
                    onChange={(e) => setSampleModal({ ...sampleModal, countText: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dan or Admin can update assigned workload for this week.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-bold">Assigned Workload Target:</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{sampleModal.countText} reservoirs</span>
                </div>
              )}

              {/* Work Progress Number (Editable by Member) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Completed Work Progress Number (Finished Samples):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={sampleModal.finishedCount}
                  onChange={(e) => setSampleModal({ ...sampleModal, finishedCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-black text-[#9E1B32] text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Enter your current number of completed reservoirs. Progress automatically updates and syncs live with the lab admin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Polygon Comments (Optional):
                </label>
                <textarea
                  rows={2}
                  value={sampleModal.notes || ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, notes: e.target.value })}
                  placeholder="e.g. SAR delineation check, high precision polygons..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {canManageAssignments ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove ${sampleModal.memberName} from Round ${sampleModal.roundNum}?`)) {
                        handleRemoveMemberFromRound(sampleModal.roundId, sampleModal.memberName);
                        setSampleModal(null);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Member</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
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
                    Save Progress
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT ROUND DETAILS (ADMIN MODE - FULL EDIT)
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
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Date:
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
                    Delivery Date:
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

      {/* =========================================================================
          QC & REPROCESSING COMMENTS MODAL (DR. DAN TIAN & ADMIN)
          ========================================================================= */}
      {qcCommentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    QC & Reprocessing Instructions
                    <span className="text-[10px] font-black uppercase tracking-wider bg-sky-900/80 text-sky-300 border border-sky-700/60 px-2 py-0.5 rounded-full">
                      Round {qcCommentModal.roundNum}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Researcher: <strong className="text-white">{qcCommentModal.memberName}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQcCommentModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveQcComment} className="p-6 space-y-4">
              <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 text-[11px] text-sky-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sky-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                  Dr. Dan Tian QC Guidance
                </div>
                <p className="text-sky-800 leading-relaxed">
                  Provide specific feedback for <strong>{qcCommentModal.memberName}</strong> so they know exactly what needs refinement before final certification.
                </p>
              </div>

              {/* Quick Preset Chips */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  Quick ERSL Preset Feedback (Click to append):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'SAR water threshold check',
                    'Boundary polygon adjustment',
                    'Missing small waterbodies (<0.01 km²)',
                    'Remove terrain shadow false-positives',
                    'Check tributary disconnection',
                    'Verify optical vs SAR multi-sensor dates'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const current = qcCommentModal.notes || '';
                        const next = current ? `${current}; ${preset}` : preset;
                        setQcCommentModal({ ...qcCommentModal, notes: next });
                      }}
                      className="text-[10px] font-medium bg-slate-100 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 border border-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific QC Instructions / Notes:
                </label>
                <textarea
                  autoFocus
                  rows={4}
                  value={qcCommentModal.notes}
                  onChange={(e) => setQcCommentModal({ ...qcCommentModal, notes: e.target.value })}
                  placeholder="e.g., Round 8 sub-basin 3094: boundary adjustment required along northern tributary. SAR threshold seems over-extracted on steep slope..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setQcCommentModal({ ...qcCommentModal, notes: '' })}
                  className="text-xs text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                >
                  Clear Notes
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQcCommentModal(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Save Instructions
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
