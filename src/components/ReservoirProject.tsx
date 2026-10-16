import React, { useState, useEffect, useMemo } from 'react';
import { 
  User 
} from '../types';
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
  RotateCcw,
  RefreshCw,
  Sparkles,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export interface ReservoirCellAssignment {
  memberId: string;
  memberName: string;
  assignedCount: number;
  finishedCount: number;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'verified';
  notes?: string;
  lastUpdated?: string;
  verifiedByDrLiu?: boolean;
}

export interface WatershedRow {
  id: string;
  name: string;
  hucCode?: string;
  stateRegion: string;
  isBaselineCompleted: boolean; // First row / historical completed watersheds
  baselineTotalReservoirs?: number; // for baseline row
  notes?: string;
  assignments: Record<string, ReservoirCellAssignment>; // memberId -> assignment
}

export interface ReservoirProjectState {
  watersheds: WatershedRow[];
  activeMemberIds: string[]; // Column list of assigned team members
}

const STORAGE_KEY = 'ersl_reservoir_project_v1';

// Initial realistic default data for ERSL Lab
const getInitialReservoirData = (): ReservoirProjectState => {
  return {
    activeMemberIds: [
      'person-purushothaman', // Dr. Naveenkumar Purushothaman
      'person-tian',          // Dr. Dan Tian
      'person-miliutina',     // Ekaterina Miliutina
      'person-palaparthi'     // Anindya Palaparthi
    ],
    watersheds: [
      // 1. First Row(s): Previously completed watersheds
      {
        id: 'ws-baseline-1',
        name: 'Upper Mississippi & Great Lakes Sub-basins (Historical Completed)',
        hucCode: 'HUC-04 & HUC-07',
        stateRegion: 'Upper Midwest / MN, WI, IL, IA',
        isBaselineCompleted: true,
        baselineTotalReservoirs: 4850,
        notes: 'Pre-2026 baseline dataset. Fully digitized, Sentinel-2 surface water dynamics validated and archived.',
        assignments: {
          'person-purushothaman': {
            memberId: 'person-purushothaman',
            memberName: 'Dr. Naveenkumar Purushothaman',
            assignedCount: 1650,
            finishedCount: 1650,
            dueDate: '2026-08-30',
            dueTime: '17:00',
            status: 'verified',
            verifiedByDrLiu: true,
            notes: 'Completed with automated GeoAI thresholding pipeline.'
          },
          'person-tian': {
            memberId: 'person-tian',
            memberName: 'Dr. Dan Tian',
            assignedCount: 1400,
            finishedCount: 1400,
            dueDate: '2026-08-30',
            dueTime: '17:00',
            status: 'verified',
            verifiedByDrLiu: true,
            notes: 'High-res DEM region-growing validation finished.'
          },
          'person-miliutina': {
            memberId: 'person-miliutina',
            memberName: 'Ekaterina Miliutina',
            assignedCount: 1100,
            finishedCount: 1100,
            dueDate: '2026-08-30',
            dueTime: '17:00',
            status: 'verified',
            verifiedByDrLiu: true,
            notes: 'Optical lake perimeter verification completed.'
          },
          'person-palaparthi': {
            memberId: 'person-palaparthi',
            memberName: 'Anindya Palaparthi',
            assignedCount: 700,
            finishedCount: 700,
            dueDate: '2026-08-30',
            dueTime: '17:00',
            status: 'verified',
            verifiedByDrLiu: true,
            notes: 'Quality control verified.'
          }
        }
      },
      // 2. Active Watersheds
      {
        id: 'ws-mobile-bay',
        name: 'Mobile River Basin & Tombigbee',
        hucCode: 'HUC-0316',
        stateRegion: 'Alabama / Mississippi',
        isBaselineCompleted: false,
        notes: 'Focus on small agricultural impoundments and multi-temporal water extent.',
        assignments: {
          'person-purushothaman': {
            memberId: 'person-purushothaman',
            memberName: 'Dr. Naveenkumar Purushothaman',
            assignedCount: 450,
            finishedCount: 385,
            dueDate: '2026-10-23',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Black Warrior River tributaries processing at 85%.'
          },
          'person-tian': {
            memberId: 'person-tian',
            memberName: 'Dr. Dan Tian',
            assignedCount: 380,
            finishedCount: 380,
            dueDate: '2026-10-23',
            dueTime: '17:00',
            status: 'completed',
            verifiedByDrLiu: true,
            notes: 'Lower Tombigbee flood control impoundments all delineated.'
          },
          'person-miliutina': {
            memberId: 'person-miliutina',
            memberName: 'Ekaterina Miliutina',
            assignedCount: 320,
            finishedCount: 290,
            dueDate: '2026-10-23',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Mobile-Tensaw Delta reservoir boundaries under fine-tuning.'
          },
          'person-palaparthi': {
            memberId: 'person-palaparthi',
            memberName: 'Anindya Palaparthi',
            assignedCount: 250,
            finishedCount: 210,
            dueDate: '2026-10-23',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Upper Cahaba watershed review in progress.'
          }
        }
      },
      {
        id: 'ws-tennessee-valley',
        name: 'Tennessee River Basin (TVA System)',
        hucCode: 'HUC-0601 & 0602',
        stateRegion: 'Tennessee / North Alabama / Georgia',
        isBaselineCompleted: false,
        notes: 'Major hydroelectric and recreational reservoir systems along Tennessee river.',
        assignments: {
          'person-purushothaman': {
            memberId: 'person-purushothaman',
            memberName: 'Dr. Naveenkumar Purushothaman',
            assignedCount: 500,
            finishedCount: 310,
            dueDate: '2026-10-30',
            dueTime: '18:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Guntersville and Wheeler lakes segments completed.'
          },
          'person-tian': {
            memberId: 'person-tian',
            memberName: 'Dr. Dan Tian',
            assignedCount: 420,
            finishedCount: 250,
            dueDate: '2026-10-30',
            dueTime: '18:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Pickwick reservoir tributaries undergoing DEM hydrological conditioning.'
          },
          'person-miliutina': {
            memberId: 'person-miliutina',
            memberName: 'Ekaterina Miliutina',
            assignedCount: 400,
            finishedCount: 390,
            dueDate: '2026-10-30',
            dueTime: '18:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Final 10 reservoirs in Nickajack segment waiting on cloud-free image.'
          },
          'person-palaparthi': {
            memberId: 'person-palaparthi',
            memberName: 'Anindya Palaparthi',
            assignedCount: 300,
            finishedCount: 160,
            dueDate: '2026-10-30',
            dueTime: '18:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Working on small tributary retention basins.'
          }
        }
      },
      {
        id: 'ws-act-basin',
        name: 'Alabama-Coosa-Tallapoosa (ACT) Basin',
        hucCode: 'HUC-0315',
        stateRegion: 'Alabama / Georgia',
        isBaselineCompleted: false,
        notes: 'Coosa and Tallapoosa chains with deep impoundments.',
        assignments: {
          'person-purushothaman': {
            memberId: 'person-purushothaman',
            memberName: 'Dr. Naveenkumar Purushothaman',
            assignedCount: 350,
            finishedCount: 80,
            dueDate: '2026-11-06',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Lake Martin and Jordan Lake setup.'
          },
          'person-tian': {
            memberId: 'person-tian',
            memberName: 'Dr. Dan Tian',
            assignedCount: 300,
            finishedCount: 50,
            dueDate: '2026-11-06',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Initial boundary segment generation.'
          },
          'person-miliutina': {
            memberId: 'person-miliutina',
            memberName: 'Ekaterina Miliutina',
            assignedCount: 300,
            finishedCount: 95,
            dueDate: '2026-11-06',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Optical lake masking underway.'
          },
          'person-palaparthi': {
            memberId: 'person-palaparthi',
            memberName: 'Anindya Palaparthi',
            assignedCount: 200,
            finishedCount: 20,
            dueDate: '2026-11-06',
            dueTime: '17:00',
            status: 'in_progress',
            verifiedByDrLiu: false,
            notes: 'Started scanning HUC-8 boundaries.'
          }
        }
      },
      {
        id: 'ws-lower-mississippi',
        name: 'Lower Mississippi Alluvial Valley',
        hucCode: 'HUC-08',
        stateRegion: 'Arkansas / Mississippi / Louisiana',
        isBaselineCompleted: false,
        notes: 'Oxbow lakes, agricultural storage reservoirs, and dynamic bayous.',
        assignments: {
          'person-purushothaman': {
            memberId: 'person-purushothaman',
            memberName: 'Dr. Naveenkumar Purushothaman',
            assignedCount: 600,
            finishedCount: 0,
            dueDate: '2026-11-15',
            dueTime: '17:00',
            status: 'not_started',
            verifiedByDrLiu: false,
            notes: 'Scheduled for sprint starting November.'
          },
          'person-tian': {
            memberId: 'person-tian',
            memberName: 'Dr. Dan Tian',
            assignedCount: 550,
            finishedCount: 0,
            dueDate: '2026-11-15',
            dueTime: '17:00',
            status: 'not_started',
            verifiedByDrLiu: false
          },
          'person-miliutina': {
            memberId: 'person-miliutina',
            memberName: 'Ekaterina Miliutina',
            assignedCount: 500,
            finishedCount: 0,
            dueDate: '2026-11-15',
            dueTime: '17:00',
            status: 'not_started',
            verifiedByDrLiu: false
          },
          'person-palaparthi': {
            memberId: 'person-palaparthi',
            memberName: 'Anindya Palaparthi',
            assignedCount: 350,
            finishedCount: 0,
            dueDate: '2026-11-15',
            dueTime: '17:00',
            status: 'not_started',
            verifiedByDrLiu: false
          }
        }
      }
    ]
  };
};

export const ReservoirProject: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const userEmail = (currentUser?.email || '').toLowerCase().trim();
  const isEmailAdmin = ADMIN_EMAILS.some(e => e.toLowerCase().trim() === userEmail);
  const isRoleAdmin = currentUser?.role === 'Admin' || currentUser?.role?.toLowerCase() === 'admin';

  // Toggle for Admin Edit Mode (defaults to true so editing is active right away)
  const [adminMode, setAdminMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ersl_reservoir_admin_mode');
    if (saved !== null) return saved === 'true';
    return true;
  });

  const isAdmin = isEmailAdmin || isRoleAdmin || adminMode;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [isEditWatershedModalOpen, setIsEditWatershedModalOpen] = useState(false);
  const [editingWatershed, setEditingWatershed] = useState<WatershedRow | null>(null);

  const handleOpenEditWatershed = (ws: WatershedRow) => {
    setEditingWatershed({ ...ws });
    setIsEditWatershedModalOpen(true);
  };

  const handleSaveEditWatershed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWatershed) return;

    setData(prev => ({
      ...prev,
      watersheds: prev.watersheds.map(ws => ws.id === editingWatershed.id ? editingWatershed : ws)
    }));

    setIsEditWatershedModalOpen(false);
    setEditingWatershed(null);
    showToast(`Watershed "${editingWatershed.name}" updated successfully!`);
  };

  // Load state from localStorage or use defaults
  const [data, setData] = useState<ReservoirProjectState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved reservoir project data', e);
    }
    return getInitialReservoirData();
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist reservoir project data', e);
    }
  }, [data]);

  // Combined lab people list
  const memberOptions = useMemo(() => {
    return initialPeople.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: p.role
    }));
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [filterMember, setFilterMember] = useState<string>('all');

  // Modal states
  const [isCellModalOpen, setIsCellModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    watershedId: string;
    watershedName: string;
    memberId: string;
    memberName: string;
    assignment: ReservoirCellAssignment;
  } | null>(null);

  const [isAddWatershedModalOpen, setIsAddWatershedModalOpen] = useState(false);
  const [newWatershedForm, setNewWatershedForm] = useState({
    name: '',
    hucCode: '',
    stateRegion: '',
    isBaselineCompleted: false,
    baselineTotal: 0,
    notes: '',
    defaultAssignedPerMember: 250,
    defaultDueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    defaultDueTime: '17:00'
  });

  const [isAddMemberColumnModalOpen, setIsAddMemberColumnModalOpen] = useState(false);
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');

  // Extract all unique due dates for milestone filter dropdown
  const uniqueDueDates = useMemo(() => {
    const dates = new Set<string>();
    data.watersheds.forEach(ws => {
      (Object.values(ws.assignments) as ReservoirCellAssignment[]).forEach(as => {
        if (as.dueDate) dates.add(as.dueDate);
      });
    });
    return Array.from(dates).sort();
  }, [data]);

  // Calculate Overall Statistics
  const stats = useMemo(() => {
    let grandAssigned = 0;
    let grandFinished = 0;
    let historicalFinished = 0;
    let activeAssigned = 0;
    let activeFinished = 0;
    let overdueCount = 0;
    let pendingVerification = 0;

    const memberMetrics: Record<string, {
      name: string;
      assigned: number;
      finished: number;
      overdue: number;
      completedTasks: number;
    }> = {};

    data.activeMemberIds.forEach(mId => {
      const person = memberOptions.find(p => p.id === mId);
      memberMetrics[mId] = {
        name: person?.name || mId,
        assigned: 0,
        finished: 0,
        overdue: 0,
        completedTasks: 0
      };
    });

    const todayStr = new Date().toISOString().split('T')[0];

    data.watersheds.forEach(ws => {
      if (ws.isBaselineCompleted && ws.baselineTotalReservoirs) {
        historicalFinished += ws.baselineTotalReservoirs;
      }

      (Object.entries(ws.assignments) as [string, ReservoirCellAssignment][]).forEach(([mId, as]) => {
        if (!memberMetrics[mId]) {
          memberMetrics[mId] = {
            name: as.memberName || mId,
            assigned: 0,
            finished: 0,
            overdue: 0,
            completedTasks: 0
          };
        }

        grandAssigned += as.assignedCount || 0;
        grandFinished += as.finishedCount || 0;

        if (!ws.isBaselineCompleted) {
          activeAssigned += as.assignedCount || 0;
          activeFinished += as.finishedCount || 0;
        }

        memberMetrics[mId].assigned += as.assignedCount || 0;
        memberMetrics[mId].finished += as.finishedCount || 0;

        const isPastDue = as.dueDate && as.dueDate < todayStr && as.finishedCount < as.assignedCount;
        if (isPastDue) {
          overdueCount++;
          memberMetrics[mId].overdue++;
        }

        if (as.finishedCount >= as.assignedCount && !as.verifiedByDrLiu) {
          pendingVerification++;
        }

        if (as.finishedCount >= as.assignedCount) {
          memberMetrics[mId].completedTasks++;
        }
      });
    });

    const completionRate = grandAssigned > 0 ? Math.round((grandFinished / grandAssigned) * 100) : 0;
    const activeRate = activeAssigned > 0 ? Math.round((activeFinished / activeAssigned) * 100) : 0;

    return {
      grandAssigned,
      grandFinished,
      historicalFinished,
      activeAssigned,
      activeFinished,
      completionRate,
      activeRate,
      overdueCount,
      pendingVerification,
      memberMetrics
    };
  }, [data, memberOptions]);

  // Filtered Watershed rows
  const filteredWatersheds = useMemo(() => {
    return data.watersheds.filter(ws => {
      // Search
      const matchesSearch = 
        ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ws.hucCode && ws.hucCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ws.stateRegion.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Due date milestone filter
      if (selectedMilestone !== 'all') {
        const hasDate = (Object.values(ws.assignments) as ReservoirCellAssignment[]).some(as => as.dueDate === selectedMilestone);
        if (!hasDate) return false;
      }

      // Member filter
      if (filterMember !== 'all') {
        const hasMember = ws.assignments[filterMember] !== undefined;
        if (!hasMember) return false;
      }

      return true;
    });
  }, [data.watersheds, searchQuery, selectedMilestone, filterMember]);

  // Track which rows are expanded to view details
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (wsId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [wsId]: !prev[wsId]
    }));
  };

  // Calculate Column Totals for the bottom Grand Total row (Sum of Total Assigned / Total Completed)
  const columnTotals = useMemo(() => {
    const memberTotals: Record<string, { finished: number; assigned: number }> = {};
    data.activeMemberIds.forEach(mId => {
      memberTotals[mId] = { finished: 0, assigned: 0 };
    });

    let grandFinished = 0;
    let grandAssigned = 0;

    filteredWatersheds.forEach(ws => {
      let rowFinished = 0;
      let rowAssigned = 0;

      data.activeMemberIds.forEach(mId => {
        const as = ws.assignments[mId];
        if (as) {
          memberTotals[mId].finished += as.finishedCount || 0;
          memberTotals[mId].assigned += as.assignedCount || 0;
          rowFinished += as.finishedCount || 0;
          rowAssigned += as.assignedCount || 0;
        }
      });

      if (ws.isBaselineCompleted && ws.baselineTotalReservoirs) {
        grandFinished += ws.baselineTotalReservoirs;
        grandAssigned += ws.baselineTotalReservoirs;
      } else {
        grandFinished += rowFinished;
        grandAssigned += rowAssigned;
      }
    });

    const grandPct = grandAssigned > 0 ? Math.round((grandFinished / grandAssigned) * 100) : 0;

    return {
      memberTotals,
      grandFinished,
      grandAssigned,
      grandPct
    };
  }, [filteredWatersheds, data.activeMemberIds]);

  // Open Cell Editor
  const handleOpenCell = (ws: WatershedRow, memberId: string) => {
    const member = memberOptions.find(p => p.id === memberId);
    const existing = ws.assignments[memberId] || {
      memberId,
      memberName: member?.name || memberId,
      assignedCount: 0,
      finishedCount: 0,
      dueDate: '',
      dueTime: '17:00',
      status: 'not_started' as const
    };

    setSelectedCell({
      watershedId: ws.id,
      watershedName: ws.name,
      memberId,
      memberName: member?.name || memberId,
      assignment: { ...existing }
    });
    setIsCellModalOpen(true);
  };

  // Save Cell Updates
  const handleSaveCell = (updated: ReservoirCellAssignment) => {
    if (!selectedCell) return;

    // Automatic status recalculation
    let status = updated.status;
    const todayStr = new Date().toISOString().split('T')[0];
    if (updated.finishedCount >= updated.assignedCount && updated.assignedCount > 0) {
      status = updated.verifiedByDrLiu ? 'verified' : 'completed';
    } else if (updated.dueDate && updated.dueDate < todayStr && updated.finishedCount < updated.assignedCount) {
      status = 'overdue';
    } else if (updated.finishedCount > 0) {
      status = 'in_progress';
    } else {
      status = 'not_started';
    }

    const payload: ReservoirCellAssignment = {
      ...updated,
      status,
      lastUpdated: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      watersheds: prev.watersheds.map(ws => {
        if (ws.id !== selectedCell.watershedId) return ws;
        return {
          ...ws,
          assignments: {
            ...ws.assignments,
            [selectedCell.memberId]: payload
          }
        };
      })
    }));

    setIsCellModalOpen(false);
    setSelectedCell(null);
    showToast(`Saved progress for ${selectedCell.watershedName} (${selectedCell.memberName})!`);
  };

  // Dr. Liu 1-Click Verification
  const handleDrLiuVerify = (wsId: string, memberId: string) => {
    setData(prev => ({
      ...prev,
      watersheds: prev.watersheds.map(ws => {
        if (ws.id !== wsId) return ws;
        const currentAs = ws.assignments[memberId];
        if (!currentAs) return ws;
        return {
          ...ws,
          assignments: {
            ...ws.assignments,
            [memberId]: {
              ...currentAs,
              verifiedByDrLiu: true,
              status: 'verified',
              lastUpdated: new Date().toISOString()
            }
          }
        };
      })
    }));
  };

  // Add Member Column
  const handleAddMemberColumn = () => {
    if (!selectedNewMemberId) return;
    if (data.activeMemberIds.includes(selectedNewMemberId)) {
      alert('This team member already has a column assigned.');
      return;
    }

    const member = memberOptions.find(p => p.id === selectedNewMemberId);
    const memberName = member?.name || selectedNewMemberId;

    setData(prev => {
      const updatedMembers = [...prev.activeMemberIds, selectedNewMemberId];
      const updatedWatersheds = prev.watersheds.map(ws => {
        if (ws.assignments[selectedNewMemberId]) return ws;
        return {
          ...ws,
          assignments: {
            ...ws.assignments,
            [selectedNewMemberId]: {
              memberId: selectedNewMemberId,
              memberName,
              assignedCount: 200,
              finishedCount: 0,
              dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
              dueTime: '17:00',
              status: 'not_started' as const
            }
          }
        };
      });

      return {
        activeMemberIds: updatedMembers,
        watersheds: updatedWatersheds
      };
    });

    setIsAddMemberColumnModalOpen(false);
    setSelectedNewMemberId('');
  };

  // Remove Member Column
  const handleRemoveMemberColumn = (memberId: string) => {
    const member = memberOptions.find(p => p.id === memberId);
    if (!confirm(`Are you sure you want to remove the column for ${member?.name || memberId}? Historical assignments will remain archived in data.`)) {
      return;
    }

    setData(prev => ({
      ...prev,
      activeMemberIds: prev.activeMemberIds.filter(id => id !== memberId)
    }));
  };

  // Add Watershed
  const handleAddWatershed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatershedForm.name.trim()) return;

    const newId = `ws-${Date.now()}`;
    const initialAssignments: Record<string, ReservoirCellAssignment> = {};

    data.activeMemberIds.forEach(mId => {
      const member = memberOptions.find(p => p.id === mId);
      initialAssignments[mId] = {
        memberId: mId,
        memberName: member?.name || mId,
        assignedCount: newWatershedForm.defaultAssignedPerMember,
        finishedCount: newWatershedForm.isBaselineCompleted ? newWatershedForm.defaultAssignedPerMember : 0,
        dueDate: newWatershedForm.defaultDueDate,
        dueTime: newWatershedForm.defaultDueTime,
        status: newWatershedForm.isBaselineCompleted ? 'verified' : 'not_started',
        verifiedByDrLiu: newWatershedForm.isBaselineCompleted
      };
    });

    const newWs: WatershedRow = {
      id: newId,
      name: newWatershedForm.name.trim(),
      hucCode: newWatershedForm.hucCode.trim() || undefined,
      stateRegion: newWatershedForm.stateRegion.trim() || 'Southeast US',
      isBaselineCompleted: newWatershedForm.isBaselineCompleted,
      baselineTotalReservoirs: newWatershedForm.isBaselineCompleted ? Number(newWatershedForm.baselineTotal) : undefined,
      notes: newWatershedForm.notes.trim() || undefined,
      assignments: initialAssignments
    };

    setData(prev => ({
      ...prev,
      watersheds: newWatershedForm.isBaselineCompleted 
        ? [newWs, ...prev.watersheds] 
        : [...prev.watersheds, newWs]
    }));

    setIsAddWatershedModalOpen(false);
    setNewWatershedForm({
      name: '',
      hucCode: '',
      stateRegion: '',
      isBaselineCompleted: false,
      baselineTotal: 0,
      notes: '',
      defaultAssignedPerMember: 250,
      defaultDueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      defaultDueTime: '17:00'
    });
  };

  // Delete Watershed
  const handleDeleteWatershed = (wsId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove watershed "${name}"?`)) return;
    setData(prev => ({
      ...prev,
      watersheds: prev.watersheds.filter(ws => ws.id !== wsId)
    }));
  };

  // Refresh & Show all latest admin-edited changes from storage (never resets to synthetic data)
  const handleRefreshEditedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(parsed);
      }
      setSearchQuery('');
      setSelectedMilestone('all');
      setFilterMember('all');
      showToast('Refreshed: Displaying all latest admin-edited changes');
    } catch (e) {
      console.error('Failed to reload data', e);
      showToast('Error refreshing data');
    }
  };

  // CSV Export for Dr. Liu and Grant Reporting
  const handleExportCSV = () => {
    const headers = [
      'Watershed Name',
      'HUC Code',
      'Region',
      'Type',
      ...data.activeMemberIds.map(mId => {
        const mem = memberOptions.find(p => p.id === mId);
        return `"${mem?.name || mId} (Finished/Assigned)"`;
      }),
      'Total Finished',
      'Total Assigned',
      'Completion %'
    ];

    const rows = data.watersheds.map(ws => {
      let rowFinished = 0;
      let rowAssigned = 0;

      const memberCells = data.activeMemberIds.map(mId => {
        const as = ws.assignments[mId];
        if (!as) return '"-"';
        rowFinished += as.finishedCount || 0;
        rowAssigned += as.assignedCount || 0;
        return `"${as.finishedCount} / ${as.assignedCount} (Due: ${as.dueDate || 'N/A'})"`;
      });

      const totalF = ws.isBaselineCompleted && ws.baselineTotalReservoirs ? ws.baselineTotalReservoirs : rowFinished;
      const totalA = ws.isBaselineCompleted && ws.baselineTotalReservoirs ? ws.baselineTotalReservoirs : rowAssigned;
      const pct = totalA > 0 ? Math.round((totalF / totalA) * 100) : 0;

      return [
        `"${ws.name}"`,
        `"${ws.hucCode || 'N/A'}"`,
        `"${ws.stateRegion}"`,
        `"${ws.isBaselineCompleted ? 'Historical Completed Baseline' : 'Active Sprint'}"`,
        ...memberCells,
        totalF,
        totalA,
        `"${pct}%"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ERSL_Reservoir_Project_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper badge color
  const getStatusBadge = (as: ReservoirCellAssignment) => {
    if (as.status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Verified
        </span>
      );
    }
    if (as.status === 'completed' || as.finishedCount >= as.assignedCount && as.assignedCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
          <CheckCircle2 className="w-3 h-3 text-teal-600" />
          Finished
        </span>
      );
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (as.dueDate && as.dueDate < todayStr && as.finishedCount < as.assignedCount) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Past Due
        </span>
      );
    }
    if (as.finishedCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
        Queued
      </span>
    );
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
          TOP BANNER: ERSL RESERVOIR DATA PROCESSING DASHBOARD
          ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative water wave background element */}
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
              National Reservoir & Water Body Delineation Project
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time progress matrix tracking watershed-by-watershed satellite image processing, reservoir boundary delineation, and QA/QC verification across the ERSL research team.
            </p>
          </div>

          {/* Quick Action Buttons for Admin and Team */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Admin Controls Mode Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !adminMode;
                setAdminMode(next);
                localStorage.setItem('ersl_reservoir_admin_mode', String(next));
                showToast(next ? 'Admin Mode Activated — Full Editing Enabled' : 'Admin Mode Deactivated');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer border ${
                isAdmin 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-md ring-2 ring-emerald-400/30' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Click to toggle administrative editing permissions"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Admin Mode: {isAdmin ? 'Active (Editing)' : 'Viewer'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 shadow-sm cursor-pointer"
              title="Download full matrix report as CSV for lab meetings and sponsor reports"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export CSV
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setIsAddWatershedModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Watershed
                </button>

                <button
                  onClick={() => setIsAddMemberColumnModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  + Member Column
                </button>

                <button
                  type="button"
                  onClick={handleRefreshEditedData}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 shadow-sm cursor-pointer"
                  title="Refresh view to display all latest edited changes"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Refresh Changes</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* =========================================================================
            WEEKLY & DUE DATE MILESTONE SUMMARY METRICS (Requested by user)
            ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          
          {/* Metric 1: Total Reservoirs Processed */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reservoirs</span>
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {stats.grandFinished.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {stats.grandAssigned.toLocaleString()} target
              </span>
            </div>
            <div className="mt-2.5 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, stats.completionRate)}%` }}
              />
            </div>
            <span className="text-[11px] text-cyan-400 font-bold mt-1.5 inline-block">
              {stats.completionRate}% Overall Completed
            </span>
          </div>

          {/* Metric 2: Active Sprints vs Baseline */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Watersheds</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {data.watersheds.filter(w => !w.isBaselineCompleted).length}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                in progress
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 font-medium">
              + {data.watersheds.filter(w => w.isBaselineCompleted).length} Baseline Completed Basin(s)
            </p>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 inline-block">
              {stats.activeFinished.toLocaleString()} active reservoirs done
            </span>
          </div>

          {/* Metric 3: Due Dates & Overdue Alerts */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Status</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-2xl font-black ${stats.overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {stats.overdueCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                overdue tasks
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Next Due: <strong>{uniqueDueDates[0] || 'Upcoming'}</strong></span>
            </div>
            <span className="text-[11px] text-amber-300 font-semibold mt-1 inline-block">
              Set with weekly strict deadlines
            </span>
          </div>

          {/* Metric 4: Dr. Liu QA/QC Sign-off */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dr. Liu QA/QC</span>
              <ShieldCheck className="w-4 h-4 text-[#9E1B32]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                {stats.pendingVerification}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ready for Dr. Liu review
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 font-medium">
              {stats.grandFinished - stats.pendingVerification} verified in data catalog
            </p>
            <span className="text-[11px] text-rose-300 font-bold mt-1 inline-block">
              {isAdmin ? 'Click cell to verify' : 'Awaiting PI approval'}
            </span>
          </div>

        </div>
      </div>

      {/* =========================================================================
          DR. LIU'S EFFICIENCY SUGGESTIONS & LAB LEADERBOARD
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Member Processing Velocity Cards */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#9E1B32]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Team Member Processing Velocity & Contribution
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Real-time submission tally
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {data.activeMemberIds.map(mId => {
              const metric = stats.memberMetrics[mId];
              const person = memberOptions.find(p => p.id === mId);
              const pct = metric && metric.assigned > 0 ? Math.round((metric.finished / metric.assigned) * 100) : 0;
              const isCurrentUser = currentUser?.email === person?.email || currentUser?.id === mId;

              return (
                <div 
                  key={mId} 
                  className={`p-3.5 rounded-lg border transition-all ${
                    isCurrentUser 
                      ? 'border-[#9E1B32]/40 bg-red-50/20 shadow-sm' 
                      : 'border-slate-100 bg-slate-50/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        {person?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'MB'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {person?.name || mId}
                          </p>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#9E1B32] text-white">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                          {person?.role || 'Lab Researcher'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800">
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[11px] font-medium text-slate-500">Processed</span>
                    <span className="text-xs font-bold text-slate-800">
                      {metric ? metric.finished.toLocaleString() : 0} / {metric ? metric.assigned.toLocaleString() : 0}
                    </span>
                  </div>

                  <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-[#9E1B32] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {metric && metric.overdue > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-rose-600">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{metric.overdue} watershed assignment overdue</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggestion & Guidance Box for Dr. Liu & Team */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl shadow-sm border border-blue-100 p-5 space-y-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#9E1B32]" />
            <h3>Dr. Liu Oversight & Efficiency Recommendations</h3>
          </div>
          
          <ul className="text-xs text-slate-600 space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E1B32] mt-1.5 shrink-0" />
              <span><strong>Interactive Cell Clicking:</strong> Click any number cell to view notes, update progress count, or set a due date and time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E1B32] mt-1.5 shrink-0" />
              <span><strong>First Row Baseline:</strong> The top row records historical, pre-2026 completed watersheds so total lab accomplishments remain visible.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E1B32] mt-1.5 shrink-0" />
              <span><strong>Dynamic Team Columns:</strong> Admin can add new members or remove completed columns anytime via the "+ Member Column" button.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E1B32] mt-1.5 shrink-0" />
              <span><strong>QA/QC Sign-Off:</strong> Dr. Liu can review completed segments and apply a certified "Verified" badge for publication-grade data.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-blue-100/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Status: <strong className="text-emerald-600">Online & Synchronized</strong></span>
            <span>ERSL V2 Portal</span>
          </div>
        </div>

      </div>

      {/* =========================================================================
          CONTROLS BAR: SEARCH, MILESTONE FILTER, AND MEMBER FILTER
          ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search watershed by name, HUC code, region..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/20 focus:border-[#9E1B32]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Milestone Due Date filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Milestone Due:</span>
            <select
              value={selectedMilestone}
              onChange={(e) => setSelectedMilestone(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
            >
              <option value="all">All Due Dates & Milestones</option>
              {uniqueDueDates.map(d => (
                <option key={d} value={d}>Due: {d}</option>
              ))}
            </select>
          </div>

          {/* Member column focus filter */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Member:</span>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
            >
              <option value="all">All Team Members</option>
              {data.activeMemberIds.map(mId => {
                const mem = memberOptions.find(p => p.id === mId);
                return (
                  <option key={mId} value={mId}>{mem?.name || mId}</option>
                );
              })}
            </select>
          </div>

          {(searchQuery || selectedMilestone !== 'all' || filterMember !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMilestone('all');
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
          THE MAIN INTERACTIVE TABLE: WATERSHED × TEAM MEMBERS × TOTAL
          ========================================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Table Header Info */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide uppercase flex items-center gap-2">
              <span>Watershed Processing Progress Matrix</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {filteredWatersheds.length} Watersheds
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any member cell to view details, update finished counts, or adjust assigned deadlines.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verified / 100%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overdue
            </span>
          </div>
        </div>

        {/* The Scrollable Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 text-xs font-bold border-b border-slate-200">
                
                {/* Column 1: Watershed */}
                <th className="py-3.5 px-4 min-w-[280px] max-w-[320px] w-[300px] sticky left-0 z-30 bg-slate-100 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-1.5">
                    <Waves className="w-4 h-4 text-[#9E1B32]" />
                    <span>Watershed / Basin (Row)</span>
                  </div>
                </th>

                {/* Columns 2 to N: Team Members (Dynamic & Expandable) */}
                {data.activeMemberIds.map((mId) => {
                  const person = memberOptions.find(p => p.id === mId);
                  const isCurrent = currentUser?.email === person?.email || currentUser?.id === mId;

                  return (
                    <th key={mId} className="py-3 px-4 min-w-[200px] border-r border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                            {person?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'M'}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 leading-tight">
                              {person?.name || mId}
                            </p>
                            <p className="text-[10px] text-slate-500 font-normal">
                              {isCurrent ? '(You)' : person?.role?.split(',')[0] || 'Researcher'}
                            </p>
                          </div>
                        </div>

                        {/* Admin can remove column if needed */}
                        {isAdmin && data.activeMemberIds.length > 1 && (
                          <button
                            onClick={() => handleRemoveMemberColumn(mId)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                            title="Remove this member column"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}

                {/* Last Column: Total (Aggregate for the watershed) */}
                <th className="py-3 px-4 min-w-[180px] bg-slate-100 text-slate-900 font-black text-xs text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span>Total Reservoirs</span>
                  </div>
                </th>

                {/* Actions column for admin */}
                {isAdmin && (
                  <th className="py-3 px-3 w-12 text-center text-slate-400">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredWatersheds.length === 0 ? (
                <tr>
                  <td colSpan={data.activeMemberIds.length + (isAdmin ? 3 : 2)} className="py-12 text-center text-slate-400 font-medium">
                    No watersheds found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredWatersheds.map((ws, index) => {
                  // Calculate row total
                  let rowFinished = 0;
                  let rowAssigned = 0;

                  (Object.values(ws.assignments) as ReservoirCellAssignment[]).forEach(as => {
                    rowFinished += as.finishedCount || 0;
                    rowAssigned += as.assignedCount || 0;
                  });

                  if (ws.isBaselineCompleted && ws.baselineTotalReservoirs) {
                    rowFinished = ws.baselineTotalReservoirs;
                    rowAssigned = ws.baselineTotalReservoirs;
                  }

                  const rowPct = rowAssigned > 0 ? Math.round((rowFinished / rowAssigned) * 100) : 0;
                  const isHistorical = ws.isBaselineCompleted;

                  return (
                    <React.Fragment key={ws.id}>
                      <tr 
                        className={`transition-colors hover:bg-slate-50/80 ${
                          isHistorical ? 'bg-amber-50/30' : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                        }`}
                      >
                        {/* Column 1: Watershed Info (Sticky with Expand/Collapse toggle) */}
                        <td 
                          className={`py-3.5 px-4 min-w-[280px] max-w-[320px] w-[300px] sticky left-0 z-20 border-r-2 border-slate-300 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)] transition-colors ${
                            isHistorical 
                              ? 'bg-[#fffbeb] hover:bg-[#fef3c7]' 
                              : index % 2 === 0 
                                ? 'bg-white hover:bg-slate-50' 
                                : 'bg-[#f8fafc] hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => toggleRowExpansion(ws.id)}
                              className="mt-0.5 text-slate-400 hover:text-slate-800 p-0.5 rounded hover:bg-slate-200/60 transition-colors cursor-pointer"
                              title={expandedRows[ws.id] ? "Collapse row details" : "Expand row details"}
                            >
                              {expandedRows[ws.id] ? (
                                <ChevronDown className="w-3.5 h-3.5 text-[#9E1B32]" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                            
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-900 text-xs">
                                  {ws.name}
                                </span>
                                {isHistorical && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                    ⭐ Baseline Completed
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                {ws.hucCode && (
                                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-semibold text-slate-700">
                                    {ws.hucCode}
                                  </span>
                                )}
                                <span>{ws.stateRegion}</span>
                              </div>

                              {ws.notes && (
                                <p className="text-[10px] text-slate-400 italic line-clamp-1" title={ws.notes}>
                                  {ws.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                      {/* Middle Columns: Assigned Members */}
                      {data.activeMemberIds.map((mId) => {
                        const as = ws.assignments[mId];
                        const person = memberOptions.find(p => p.id === mId);
                        const isCurrent = currentUser?.email === person?.email || currentUser?.id === mId;

                        if (!as) {
                          return (
                            <td 
                              key={mId} 
                              onClick={() => handleOpenCell(ws, mId)}
                              className="py-3 px-4 border-r border-slate-200 text-slate-300 italic text-center cursor-pointer hover:bg-red-50/30 transition-colors"
                            >
                              + Assign
                            </td>
                          );
                        }

                        const cellPct = as.assignedCount > 0 ? Math.round((as.finishedCount / as.assignedCount) * 100) : 0;
                        const isPastDue = as.dueDate && as.dueDate < new Date().toISOString().split('T')[0] && as.finishedCount < as.assignedCount;

                        return (
                          <td 
                            key={mId} 
                            onClick={() => handleOpenCell(ws, mId)}
                            className={`py-3 px-4 border-r border-slate-200 cursor-pointer transition-all ${
                              isPastDue 
                                ? 'bg-red-50/50 hover:bg-red-50' 
                                : isCurrent 
                                  ? 'hover:bg-red-50/20' 
                                  : 'hover:bg-slate-100/60'
                            }`}
                          >
                            <div className="space-y-1.5">
                              {/* Numbers & Percentage */}
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-extrabold text-slate-900">
                                  {as.finishedCount.toLocaleString()} <span className="text-slate-400 font-normal">/ {as.assignedCount.toLocaleString()}</span>
                                </span>
                                <span className={`text-[11px] font-black ${cellPct >= 100 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                  {cellPct}%
                                </span>
                              </div>

                              {/* Mini Progress Bar */}
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    as.status === 'verified' 
                                      ? 'bg-emerald-500' 
                                      : isPastDue 
                                        ? 'bg-rose-500' 
                                        : cellPct >= 100 
                                          ? 'bg-teal-500' 
                                          : 'bg-[#9E1B32]'
                                  }`}
                                  style={{ width: `${Math.min(100, cellPct)}%` }}
                                />
                              </div>

                              {/* Due Date & Status Badge */}
                              <div className="flex items-center justify-between pt-0.5">
                                {getStatusBadge(as)}
                                
                                {as.dueDate && (
                                  <span className={`text-[10px] font-medium flex items-center gap-1 ${isPastDue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {as.dueDate.slice(5)} {as.dueTime || ''}
                                  </span>
                                )}
                              </div>

                              {/* Notes preview if any */}
                              {as.notes && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[170px]" title={as.notes}>
                                  💬 {as.notes}
                                </p>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Last Column: Total for Watershed */}
                      <td className="py-3 px-4 bg-slate-50/80 border-l border-slate-200 text-right">
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="font-mono text-xs font-black text-slate-900">
                              {rowFinished.toLocaleString()}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              / {rowAssigned.toLocaleString()}
                            </span>
                          </div>

                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${rowPct >= 100 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                              style={{ width: `${Math.min(100, rowPct)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
                            <span className={rowPct >= 100 ? 'text-emerald-600' : 'text-slate-600'}>
                              {rowPct}% Complete
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Admin edit & delete watershed */}
                      {isAdmin && (
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditWatershed(ws)}
                              className="p-1 rounded text-slate-500 hover:text-[#9E1B32] hover:bg-red-50 transition-colors cursor-pointer"
                              title="Edit watershed details, baseline targets, & notes"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWatershed(ws.id, ws.name)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete watershed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Expandable Accordion Sub-row with Details */}
                    {expandedRows[ws.id] && (
                      <tr className="bg-slate-50/90 border-b border-slate-200 text-xs">
                        <td colSpan={data.activeMemberIds.length + (isAdmin ? 3 : 2)} className="p-4 pl-10">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-800 text-xs">
                                  {ws.name} — Detailed Task Log & Notes
                                </span>
                                {ws.hucCode && (
                                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                                    {ws.hucCode}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Target Region: <strong className="text-slate-800">{ws.stateRegion}</strong>
                              </span>
                            </div>

                            {ws.notes && (
                              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <strong className="text-slate-800">Delineation Scope & Methodology:</strong> {ws.notes}
                              </div>
                            )}

                            {/* Member assignment sub-cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                              {data.activeMemberIds.map(mId => {
                                const as = ws.assignments[mId];
                                const person = memberOptions.find(p => p.id === mId);
                                if (!as) return null;
                                return (
                                  <div key={mId} className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                                    <div className="flex items-center justify-between font-bold text-slate-800">
                                      <span className="truncate max-w-[120px]">{person?.name || mId}</span>
                                      {getStatusBadge(as)}
                                    </div>
                                    <div className="text-slate-600 font-medium">
                                      Completed: <strong className="text-slate-900 font-mono">{as.finishedCount}</strong> / {as.assignedCount} reservoirs
                                    </div>
                                    {as.dueDate && (
                                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-[#9E1B32]" />
                                        <span>Deadline: {as.dueDate} {as.dueTime || ''}</span>
                                      </div>
                                    )}
                                    {as.notes && (
                                      <div className="text-[10px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-100 mt-1">
                                        "{as.notes}"
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  );
                })
              )}

              {/* Inline row: Expand Table with more watersheds over time */}
              {isAdmin && (
                <tr className="bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                  <td 
                    colSpan={data.activeMemberIds.length + (isAdmin ? 3 : 2)} 
                    className="py-3 px-4 text-center border-t border-dashed border-slate-300"
                  >
                    <button
                      type="button"
                      onClick={() => setIsAddWatershedModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9E1B32] hover:text-red-800 hover:underline cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Expand Table: + Add New Watershed Row Over Time</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>

            {/* =========================================================================
                THE BOTTOM GRAND TOTAL ROW: SUM OF TOTAL ASSIGNED / TOTAL COMPLETED
                ========================================================================= */}
            <tfoot>
              <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-[#9E1B32] shadow-inner text-xs">
                
                {/* Column 1: Grand Total Label (Sticky) */}
                <td className="py-4 px-4 min-w-[280px] max-w-[320px] w-[300px] sticky left-0 z-30 bg-[#0f172a] border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.25)]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-white">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <span className="font-black tracking-wide uppercase text-xs">
                        Grand Total (All Watersheds)
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">
                      Sum across {filteredWatersheds.length} watershed rows
                    </p>
                  </div>
                </td>

                {/* Member Columns: Sum of Total Completed / Assigned for each member */}
                {data.activeMemberIds.map(mId => {
                  const mTot = columnTotals.memberTotals[mId] || { finished: 0, assigned: 0 };
                  const mPct = mTot.assigned > 0 ? Math.round((mTot.finished / mTot.assigned) * 100) : 0;

                  return (
                    <td key={mId} className="py-4 px-4 border-r border-slate-700 bg-slate-900/95">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-black text-white">
                            {mTot.finished.toLocaleString()}{' '}
                            <span className="text-slate-400 font-normal">/ {mTot.assigned.toLocaleString()}</span>
                          </span>
                          <span className={`text-[11px] font-black ${mPct >= 100 ? 'text-emerald-400' : 'text-cyan-300'}`}>
                            {mPct}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, mPct)}%` }}
                          />
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium">
                          Member Overall Progress
                        </div>
                      </div>
                    </td>
                  );
                })}

                {/* End of Last Row: Grand Total Assigned vs Grand Total Completed */}
                <td className="py-4 px-4 bg-slate-950 border-l border-slate-700 text-right">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono text-sm font-black text-emerald-400">
                        {columnTotals.grandFinished.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold">
                        / {columnTotals.grandAssigned.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, columnTotals.grandPct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {columnTotals.grandPct}% Total Complete
                      </span>
                    </div>
                  </div>
                </td>

                {isAdmin && (
                  <td className="py-4 px-2 bg-slate-900"></td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>
              Watersheds with target reservoirs assigned by ERSL Administrator. All progress counts reflect validated GIS polygons.
            </span>
          </div>
          <div className="font-semibold text-slate-700">
            ERSL Hydrology & GeoAI Lab · Dr. Hongxing Liu
          </div>
        </div>

      </div>

      {/* =========================================================================
          MODAL: EDIT RESERVOIR CELL / ASSIGNMENT / FINISHED COUNT
          ========================================================================= */}
      {isCellModalOpen && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-[#9E1B32] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  Watershed Progress Update
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {selectedCell.watershedName}
                </h3>
                <p className="text-xs text-slate-200 mt-0.5">
                  Assigned Member: <strong>{selectedCell.memberName}</strong>
                </p>
              </div>

              <button 
                onClick={() => setIsCellModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCell(selectedCell.assignment);
              }}
              className="p-6 space-y-4 text-xs"
            >
              
              {/* Quick Increment Buttons (Feature requested for efficiency) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Quick Add Processed Reservoirs (Finished Count):
                </label>
                <div className="flex items-center gap-2">
                  {[10, 25, 50, 100].map(inc => (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => {
                        setSelectedCell(prev => {
                          if (!prev) return null;
                          const cur = prev.assignment.finishedCount || 0;
                          return {
                            ...prev,
                            assignment: {
                              ...prev.assignment,
                              finishedCount: cur + inc
                            }
                          };
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#9E1B32] hover:text-[#9E1B32] font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      +{inc}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCell(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          assignment: {
                            ...prev.assignment,
                            finishedCount: prev.assignment.assignedCount
                          }
                        };
                      });
                    }}
                    className="ml-auto px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs transition-all cursor-pointer"
                  >
                    Mark All Done
                  </button>
                </div>
              </div>

              {/* Finished Count & Target Assigned */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Finished Reservoirs:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedCell.assignment.finishedCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSelectedCell(prev => prev ? {
                        ...prev,
                        assignment: { ...prev.assignment, finishedCount: val }
                      } : null);
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Number completed so far</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Target:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedCell.assignment.assignedCount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSelectedCell(prev => prev ? {
                        ...prev,
                        assignment: { ...prev.assignment, assignedCount: val }
                      } : null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-bold bg-white border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Target reservoirs assigned for this member
                  </p>
                </div>
              </div>

              {/* Due Date & Due Time (Set by Admin) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#9E1B32]" />
                    <span>Target Due Date:</span>
                  </label>
                  <input
                    type="date"
                    value={selectedCell.assignment.dueDate || ''}
                    onChange={(e) => {
                      setSelectedCell(prev => prev ? {
                        ...prev,
                        assignment: { ...prev.assignment, dueDate: e.target.value }
                      } : null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-medium bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#9E1B32]" />
                    <span>Due Time:</span>
                  </label>
                  <input
                    type="time"
                    value={selectedCell.assignment.dueTime || '17:00'}
                    onChange={(e) => {
                      setSelectedCell(prev => prev ? {
                        ...prev,
                        assignment: { ...prev.assignment, dueTime: e.target.value }
                      } : null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-medium bg-white border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                  />
                </div>
              </div>

              {/* Notes / Method / Issues encountered */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Progress Notes / Methodology / Issues (Optional):
                </label>
                <textarea
                  rows={3}
                  value={selectedCell.assignment.notes || ''}
                  onChange={(e) => {
                    setSelectedCell(prev => prev ? {
                      ...prev,
                      assignment: { ...prev.assignment, notes: e.target.value }
                    } : null);
                  }}
                  placeholder="e.g., Completed Landsat-8 cloud masking, 14 farm ponds marked for manual inspection..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
                />
              </div>

              {/* Dr. Liu QA/QC Verification Toggle (Admin / Dr. Liu only) */}
              {isAdmin && (
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Dr. Hongxing Liu QA/QC Sign-off
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        Certify that delineated reservoirs meet lab accuracy standards.
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(selectedCell.assignment.verifiedByDrLiu)}
                    onChange={(e) => {
                      setSelectedCell(prev => prev ? {
                        ...prev,
                        assignment: { ...prev.assignment, verifiedByDrLiu: e.target.checked }
                      } : null);
                    }}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCellModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Progress
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW WATERSHED ROW (ADMIN)
          ========================================================================= */}
      {isAddWatershedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9E1B32]">
                  Watershed Project Configuration
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Add New Watershed / Basin
                </h3>
              </div>
              <button 
                onClick={() => setIsAddWatershedModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWatershed} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Watershed / River Basin Name: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apalachicola-Chattahoochee-Flint (ACF) Basin"
                  value={newWatershedForm.name}
                  onChange={(e) => setNewWatershedForm({ ...newWatershedForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#9E1B32]/30 focus:border-[#9E1B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    USGS HUC Code (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HUC-0313"
                    value={newWatershedForm.hucCode}
                    onChange={(e) => setNewWatershedForm({ ...newWatershedForm, hucCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Region:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AL / GA / FL"
                    value={newWatershedForm.stateRegion}
                    onChange={(e) => setNewWatershedForm({ ...newWatershedForm, stateRegion: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                  />
                </div>
              </div>

              {/* Baseline checkbox (Requested by user: "in the first row we have already completed some previous water sheds") */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBaselineCompleted"
                    checked={newWatershedForm.isBaselineCompleted}
                    onChange={(e) => setNewWatershedForm({ ...newWatershedForm, isBaselineCompleted: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="isBaselineCompleted" className="text-xs font-bold text-amber-900 cursor-pointer">
                    This is a previously completed historical watershed
                  </label>
                </div>
                <p className="text-[10px] text-amber-700">
                  Will appear at the top as an archived milestone with 100% completion already accomplished.
                </p>

                {newWatershedForm.isBaselineCompleted && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Total Completed Reservoirs in this baseline:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newWatershedForm.baselineTotal}
                      onChange={(e) => setNewWatershedForm({ ...newWatershedForm, baselineTotal: parseInt(e.target.value) || 0 })}
                      placeholder="e.g. 4850"
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {!newWatershedForm.isBaselineCompleted && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Default Reservoirs Per Member:
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={newWatershedForm.defaultAssignedPerMember}
                        onChange={(e) => setNewWatershedForm({ ...newWatershedForm, defaultAssignedPerMember: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Default Target Due Date:
                      </label>
                      <input
                        type="date"
                        value={newWatershedForm.defaultDueDate}
                        onChange={(e) => setNewWatershedForm({ ...newWatershedForm, defaultDueDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope & Delineation Instructions (Optional):
                </label>
                <textarea
                  rows={2}
                  value={newWatershedForm.notes}
                  onChange={(e) => setNewWatershedForm({ ...newWatershedForm, notes: e.target.value })}
                  placeholder="e.g. Use Landsat-9 surface water reflectance with 30m resolution..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWatershedModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Create Watershed
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD TEAM MEMBER COLUMN (ADMIN)
          ========================================================================= */}
      {isAddMemberColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  Expand Table Matrix
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Add Team Member Column
                </h3>
              </div>
              <button 
                onClick={() => setIsAddMemberColumnModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Select a researcher from the ERSL lab roster to add as a new column in the matrix table.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Team Member:
                </label>
                <select
                  value={selectedNewMemberId}
                  onChange={(e) => setSelectedNewMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                >
                  <option value="">-- Choose Member --</option>
                  {memberOptions
                    .filter(p => !data.activeMemberIds.includes(p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.role || p.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMemberColumnModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedNewMemberId}
                  onClick={handleAddMemberColumn}
                  className="px-5 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Add Column
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT WATERSHED ROW (ADMIN)
          ========================================================================= */}
      {isEditWatershedModalOpen && editingWatershed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#9E1B32]">
                  Watershed Configuration
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Edit Watershed / River Basin
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsEditWatershedModalOpen(false);
                  setEditingWatershed(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditWatershed} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Watershed / Basin Name: *
                </label>
                <input
                  type="text"
                  required
                  value={editingWatershed.name}
                  onChange={(e) => setEditingWatershed({ ...editingWatershed, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    USGS HUC Code:
                  </label>
                  <input
                    type="text"
                    value={editingWatershed.hucCode || ''}
                    onChange={(e) => setEditingWatershed({ ...editingWatershed, hucCode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / Region:
                  </label>
                  <input
                    type="text"
                    value={editingWatershed.stateRegion}
                    onChange={(e) => setEditingWatershed({ ...editingWatershed, stateRegion: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                  />
                </div>
              </div>

              {/* Baseline historical completed toggle */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_isBaseline"
                    checked={editingWatershed.isBaselineCompleted}
                    onChange={(e) => setEditingWatershed({ ...editingWatershed, isBaselineCompleted: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="edit_isBaseline" className="text-xs font-bold text-amber-900 cursor-pointer">
                    Previously Completed Historical Watershed
                  </label>
                </div>

                {editingWatershed.isBaselineCompleted && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">
                      Total Baseline Completed Reservoirs:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingWatershed.baselineTotalReservoirs || 0}
                      onChange={(e) => setEditingWatershed({ ...editingWatershed, baselineTotalReservoirs: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Scope & Methodology Notes:
                </label>
                <textarea
                  rows={3}
                  value={editingWatershed.notes || ''}
                  onChange={(e) => setEditingWatershed({ ...editingWatershed, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#9E1B32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditWatershedModalOpen(false);
                    setEditingWatershed(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Save Watershed Updates
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
