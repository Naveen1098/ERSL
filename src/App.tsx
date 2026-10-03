import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Calendar, FileText, Search, Download, ExternalLink, 
  Mail, Users, Award, ShieldAlert, GraduationCap, Check, HelpCircle, 
  FolderGit2, Lock, Eye, AlertCircle, FileCode, CheckCircle2, ChevronRight, Sliders, Play, Info,
  RefreshCw, X
} from 'lucide-react';

import { UAHeader } from './components/UAHeader';
import { UASSO } from './components/UASSO';
import { BoxExplorer } from './components/BoxExplorer';
import { AdminDashboard } from './components/AdminDashboard';
import { EditModal } from './components/EditModal';

import { 
  initialThemes, initialProjects, initialPublications, initialSoftware, 
  initialDataLayers, initialInstruments, initialPeople, initialBoxFiles, initialAuditLogs 
} from './data/initialData';

import { 
  User, Role, ResearchTheme, Project, Publication, Software, 
  DataLayer, Instrument, Person, BoxFile, AuditLog 
} from './types';
import { newsItems, NewsItem } from './data/news';
import { NewsModal } from './components/NewsModal';
import { LoginModal } from './components/LoginModal';
import { UpdatePasswordModal } from './components/UpdatePasswordModal';
import { Workplan } from './components/Workplan';
import { BoxFolders } from './components/BoxFolders';
import { MemberManager } from './components/MemberManager';
import { ProfessionalDevelopment } from './components/ProfessionalDevelopment';
import { supabase, fetchProfile, profileToUser } from './lib/supabase';

// Field photos: any image dropped into src/assets/field/ is picked up automatically
const fieldPhotoModules = import.meta.glob('./assets/field/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const fieldPhotos = Object.entries(fieldPhotoModules).map(([path, url]) => ({
  url,
  caption: decodeURIComponent(path.split('/').pop() || '').replace(/\.[^.]+$/, ''),
}));

// Helper to resolve image paths (local folder under public/images/{category} vs base64/URL assets)
const resolveImagePath = (
  imagePath: string | undefined, 
  category: 'home' | 'research' | 'instruments' | 'people'
): string => {
  if (!imagePath) return '';
  // Absolute /images/... paths must be re-based so they work under a sub-path (GitHub Pages /ERSL/)
  const base = import.meta.env.BASE_URL;
  if (imagePath.startsWith('/images/')) {
    return `${base}${imagePath.slice(1)}`;
  }
  if (
    imagePath.startsWith('http://') || 
    imagePath.startsWith('https://') || 
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }
  // Otherwise, map to the designated local public images folder
  return `${base}images/${category}/${imagePath}`;
};

const isMockPublication = (p: Publication): boolean => 
  !p ||
  p.id === 'pub-0' ||
  p.title.includes('DeepSAR Flood Mapper') || 
  p.title.includes('RS‐FloodXDepth') || 
  p.title.includes('RS-FloodXDepth') ||
  p.title.includes('Estuarine Salinity and Dissolved Oxygen') ||
  p.title.includes('Toward robust evaluations of flood inundation') ||
  p.title.includes('Wide-Swath SWOT Altimetry Integration') ||
  p.title.includes('Deep Learning Estimation of Riverine Suspended Sediment Concentration');

const reconstructAbstract = (invertedIndex?: Record<string, number[]> | null): string => {
  if (!invertedIndex || typeof invertedIndex !== 'object') return '';
  const wordsByPos: { [pos: number]: string } = {};
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        wordsByPos[pos] = word;
      }
    }
  }
  const sorted = Object.keys(wordsByPos)
    .map(Number)
    .sort((a, b) => a - b);
  const text = sorted.map(pos => wordsByPos[pos]).join(' ');
  return text.length > 550 ? text.slice(0, 550) + '...' : text;
};

export default function App() {
  // Global States (with LocalStorage persistence for testing)
  // Real login: the user comes from the Supabase session (see effect below), never from localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [peopleSubTab, setPeopleSubTab] = useState<'member' | 'collaborator'>('member');

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('ersl_tab');
    return saved || 'home';
  });

  const [showSSOPopup, setShowSSOPopup] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(() => {
    return window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token');
  });
  const [editMode, setEditMode] = useState(false);
  const isAdmin = currentUser?.role === 'Admin';

  // Database lists
  const [themes, setThemes] = useState<ResearchTheme[]>(() => {
    const saved = localStorage.getItem('ersl_themes');
    return saved ? JSON.parse(saved) : initialThemes;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ersl_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [publications, setPublications] = useState<Publication[]>(() => {
    const saved = localStorage.getItem('ersl_publications');
    if (saved !== null) {
      try {
        const savedList: Publication[] = JSON.parse(saved);
        return savedList.filter(p => !isMockPublication(p));
      } catch {
        return [];
      }
    }
    // Start empty without forcing pre-created publications.json mock data
    return [];
  });

  // Automatically persist any publications update to local storage
  useEffect(() => {
    localStorage.setItem('ersl_publications', JSON.stringify(publications));
  }, [publications]);

  const [softwareList, setSoftwareList] = useState<Software[]>(() => {
    const saved = localStorage.getItem('ersl_software');
    return saved ? JSON.parse(saved) : initialSoftware;
  });

  const [dataLayers, setDataLayers] = useState<DataLayer[]>(() => {
    const saved = localStorage.getItem('ersl_datalayers');
    return saved ? JSON.parse(saved) : initialDataLayers;
  });

  const [instruments, setInstruments] = useState<Instrument[]>(() => {
    const saved = localStorage.getItem('ersl_instruments');
    return saved ? JSON.parse(saved) : initialInstruments;
  });

  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('ersl_people');
    if (!saved) return initialPeople;
    // Merge: people added to the code later (e.g. new members) must still show up for returning visitors
    const savedList: Person[] = JSON.parse(saved);
    const known = new Set(savedList.map(p => p.id));
    return [...savedList, ...initialPeople.filter(p => !known.has(p.id))];
  });

  const [boxFiles, setBoxFiles] = useState<BoxFile[]>(() => {
    const saved = localStorage.getItem('ersl_boxfiles');
    return saved ? JSON.parse(saved) : initialBoxFiles;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('ersl_auditlogs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);

  // News & Lab Updates State (Publications, Achievements, Blogs, Field Surveys)
  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem('ersl_news');
    if (!saved) return newsItems;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : newsItems;
    } catch {
      return newsItems;
    }
  });
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNewsItem, setEditingNewsItem] = useState<NewsItem | null>(null);
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('ersl_news', JSON.stringify(news));
  }, [news]);

  const handleSaveNewsItem = (savedItem: NewsItem) => {
    setNews(prev => {
      let updated: NewsItem[];
      const idx = prev.findIndex(n => n.id === savedItem.id);
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = savedItem;
      } else {
        updated = [savedItem, ...prev];
      }
      localStorage.setItem('ersl_news', JSON.stringify(updated));
      return updated;
    });
    setNewsModalOpen(false);
    setEditingNewsItem(null);
    appendAuditLog('UPDATE_NEWS', `Saved news update: "${savedItem.title}"`);
  };

  const handleDeleteNewsItem = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete news announcement "${title}"?`)) return;
    setNews(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('ersl_news', JSON.stringify(updated));
      return updated;
    });
    appendAuditLog('DELETE_NEWS', `Deleted news announcement: "${title}"`);
  };
  const [bulletinFolders, setBulletinFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('ersl_bulletin_folders');
    return saved ? JSON.parse(saved) : ['General'];
  });
  const [activeBulletinFolder, setActiveBulletinFolder] = useState<string>('All');
  useEffect(() => {
    localStorage.setItem('ersl_bulletin_folders', JSON.stringify(bulletinFolders));
  }, [bulletinFolders]);

  // Lab Bulletins & Announcements State (Point 5)
  const [bulletins, setBulletins] = useState<any[]>(() => {
    const saved = localStorage.getItem('ersl_bulletins');
    const defaultBulletins = [
      {
        id: 'b-1',
        title: 'NASA SWOT Satellite Pass Calibration Campaign',
        sender: 'Dr. Hongxing Liu',
        date: '2026-07-10 09:30',
        content: 'Team, we need to coordinate in-situ ADCP river surveys matching the upcoming NASA SWOT (Surface Water and Ocean Topography) wide-swath satellite passes over the Black Warrior basin on July 14th and 18th. Ensure all drone batteries are fully charged and the Sentera 6X Pro is calibrated. Postdocs and PhDs please check your assignments in the shared Box field survey folder.',
        priority: 'high'
      },
      {
        id: 'b-2',
        title: 'CIROH NOAA Annual Progress Reports Due',
        sender: 'Dr. Hongxing Liu',
        date: '2026-07-05 14:15',
        content: 'Reminder to all researchers: please upload your recent manuscripts, geospatial model weights, and draft reports to our NOAA CIROH shared directory by Friday. We must aggregate these inputs for the annual board review meeting. Reach out to Dr. Dan Tian if you need assistance with the RS-FloodXDepth validation charts.',
        priority: 'normal'
      }
    ];
    return saved ? JSON.parse(saved) : defaultBulletins;
  });

  // State for user management (inside Admin Panel)
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const defaultUsers: User[] = [
      { id: 'user-liu', name: 'Dr. Hongxing Liu', email: 'hongxing.liu@ua.edu', role: 'Admin', department: 'Geography' },
      { id: 'user-mandal', name: 'Dr. Tapas Mandal', email: 'tmandal@ua.edu', role: 'Researcher', department: 'Geography' },
      { id: 'user-naveen', name: 'Naveen Purushothaman', email: 'npurushothaman@ua.edu', role: 'Researcher', department: 'Geography' }
    ];
    const saved = localStorage.getItem('ersl_all_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  // Admissions Contact Forms Inbox (Simulated CRM)
  const [inboxEntries, setInboxEntries] = useState<any[]>(() => {
    const saved = localStorage.getItem('ersl_inbox');
    return saved ? JSON.parse(saved) : [];
  });

  // Teaching Materials state (Point 5)
  const [teachingList, setTeachingList] = useState<any[]>(() => {
    const defaultTeaching = [
      {
        id: 'teach-1',
        title: 'Course Syllabus: GY 404/504 - Advanced GIS & Remote Sensing',
        course: 'GY 404/504',
        description: 'Semester plan, grading schemas, satellite pass calendars, and field drone certification standards.',
        link: 'https://ua.box.com/s/gy404-syllabus-2026',
        updatedAt: '2026-06-15'
      },
      {
        id: 'teach-2',
        title: 'Laboratory Manual 3: SAR reach-scale surface water extraction on GEE',
        course: 'GY 404/504 Lab 3',
        description: 'Comprehensive walk-through to process Sentinel-1 polarization ratios and map surface inundation depths.',
        link: 'https://ua.box.com/s/gee-sar-manual',
        updatedAt: '2026-07-02'
      },
      {
        id: 'teach-3',
        title: 'Field Guide: ADCP River Gauging & Hydrodynamic Bathymetry Calibration',
        course: 'GY 504 Graduate Seminar',
        description: 'Operating manual for SonTek M9 RiverSurveyor profiling, transducer depth settings, and flow rate corrections.',
        link: 'https://ua.box.com/s/adcp-field-procedures',
        updatedAt: '2026-07-10'
      }
    ];
    const saved = localStorage.getItem('ersl_teaching');
    return saved ? JSON.parse(saved) : defaultTeaching;
  });

  // Helper to resolve clean initials ignoring Dr. prefix (Point 6)
  const getCleanInitials = (name: string): string => {
    const parts = name.split(' ').filter(p => {
      const lower = p.toLowerCase().replace(/\./g, '');
      return !['dr', 'prof', 'professor', 'phd', 'candidate', 'postdoc', 'researcher'].includes(lower);
    });
    if (parts.length === 0) return 'UA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Editor Modal Control state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'publication' | 'data-layer' | 'research-theme' | 'instrument' | 'person' | 'software' | 'teaching'>('publication');
  const [editingItem, setEditingItem] = useState<any>(null);

  // Home Slideshow states
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      file: 'river-channel-mask.png',
      image: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&w=1200&q=80',
      title: 'Automated River Channel Mask',
      desc: 'Formulating reach-scale river boundary delineations utilizing hierarchical slope-based classification on high-res digital elevation models (DEMs).'
    },
    {
      file: 'drone-survey-ortho.jpg',
      image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80',
      title: 'Riparian Zone Drone Survey',
      desc: 'Compiling ultra-high-resolution multispectral photogrammetry and aerial LiDAR surveys over local riparian corridors.'
    },
    {
      file: 'sar-composite.jpg',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      title: 'SAR Satellite Composite',
      desc: 'Integrating multi-temporal Sentinel-1 Synthetic Aperture Radar backscatter to extract inundation maps independent of weather or light.'
    }
  ];

  // Forms Search and filters
  const [pubSearch, setPubSearch] = useState('');
  const [pubSort, setPubSort] = useState<'newest' | 'oldest'>('newest');
  const [pubFilter, setPubFilter] = useState<string>('All');

  // Interactive Google Scholar Sync states
  const [isSyncingScholar, setIsSyncingScholar] = useState(false);
  const [syncScholarLogs, setSyncScholarLogs] = useState<string[]>([]);

  const [dataSearch, setDataSearch] = useState('');
  const [simulatedBand, setSimulatedBand] = useState<string>('green');
  
  // Track failed images to handle fallback elegantly
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  
  // Custom states for Water Remote Sensing Dashboard
  const [selectedStation, setSelectedStation] = useState<string>('northport');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>('2026-07-11 09:00 UTC');

  // Admissions Form States
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentDegree, setStudentDegree] = useState('PhD');
  const [studentStatement, setStudentStatement] = useState('');
  const [studentInterests, setStudentInterests] = useState<string[]>([]);
  const [showContactSuccess, setShowContactSuccess] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('ersl_themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('ersl_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ersl_publications', JSON.stringify(publications));
  }, [publications]);

  useEffect(() => {
    localStorage.setItem('ersl_software', JSON.stringify(softwareList));
  }, [softwareList]);

  useEffect(() => {
    localStorage.setItem('ersl_datalayers', JSON.stringify(dataLayers));
  }, [dataLayers]);

  useEffect(() => {
    localStorage.setItem('ersl_instruments', JSON.stringify(instruments));
  }, [instruments]);

  useEffect(() => {
    localStorage.setItem('ersl_people', JSON.stringify(people));
  }, [people]);

  useEffect(() => {
    localStorage.setItem('ersl_boxfiles', JSON.stringify(boxFiles));
  }, [boxFiles]);

  useEffect(() => {
    localStorage.setItem('ersl_auditlogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('ersl_bulletins', JSON.stringify(bulletins));
  }, [bulletins]);

  useEffect(() => {
    localStorage.setItem('ersl_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('ersl_inbox', JSON.stringify(inboxEntries));
  }, [inboxEntries]);

  useEffect(() => {
    localStorage.setItem('ersl_teaching', JSON.stringify(teachingList));
  }, [teachingList]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.removeItem('ersl_user'); // clear any old fake-SSO session
      setEditMode(false);
    } else if (currentUser.role === 'Admin') {
      setEditMode(true);
    }
  }, [currentUser]);

  // Supabase session -> currentUser (only approved members/admins are treated as logged in)
  useEffect(() => {
    if (!supabase) return;
    const apply = async (userId?: string) => {
      if (!userId) { setCurrentUser(null); return; }
      const profile = await fetchProfile(userId);
      if (profile && profile.role !== 'pending') setCurrentUser(profileToUser(profile));
      else setCurrentUser(null);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session?.user.id));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePasswordModal(true);
      }
      apply(session?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('ersl_tab', activeTab);
  }, [activeTab]);

  // Slideshow auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Helper: Log administrative/edit actions to audit trail
  const appendAuditLog = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'Anonymous',
      action,
      target
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Login handler from SSO Popup
  const handleSSOSuccess = (user: User) => {
    setCurrentUser(user);
    setShowSSOPopup(false);
    // Add to allUsers if new
    setAllUsers(prev => {
      if (prev.some(u => u.email === user.email)) return prev;
      return [...prev, user];
    });
    // Check role, keep edit mode disabled by default on login for security
    if (user.role !== 'Viewer') {
      setEditMode(false);
    }
    // Append audit log
    const newLog: AuditLog = {
      id: `log-sso-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: user.id,
      userName: user.name,
      action: 'SSO_LOGIN',
      target: `Logged into ERSL Workspace with Role: ${user.role}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    if (currentUser) {
      appendAuditLog('SSO_LOGOUT', 'Logged out of ERSL portal session');
    }
    supabase?.auth.signOut();
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Role modification inside Admin Panel (syncs with Active Directory)
  const handleUserRoleChange = (userId: string, newRole: Role) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    
    // If we changed current user role, sync current state
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
      if (newRole === 'Viewer') {
        setEditMode(false);
      }
    }

    const modifiedUser = allUsers.find(u => u.id === userId);
    appendAuditLog('ADMIN_USER_ROLE_CHANGE', `Changed ${modifiedUser?.name || 'User'}'s permission level to ${newRole}`);
  };

  const handleAdminAddUser = (newUser: Omit<User, 'id'>) => {
    const id = `user-${Date.now()}`;
    const userWithId = { ...newUser, id };
    setAllUsers(prev => [...prev, userWithId]);
    appendAuditLog('ADMIN_ADD_AUTHORIZED_USER', `Authorized ${newUser.name} (${newUser.email}) with role ${newUser.role}`);
  };

  const handleAdminDeleteUser = (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    if (!userToDelete) return;
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    appendAuditLog('ADMIN_REVOKE_USER_ACCESS', `Revoked access authorization for ${userToDelete.name} (${userToDelete.email})`);
  };

  // Unified Save handler for EditModal
  const handleModalSave = (savedItem: any) => {
    const isEdit = !!editingItem;

    if (modalType === 'publication') {
      setPublications(prev => {
        if (isEdit) {
          return prev.map(p => p.id === savedItem.id ? savedItem : p);
        } else {
          return [savedItem, ...prev];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_PUBLICATION' : 'ADD_PUBLICATION', savedItem.title);
    } else if (modalType === 'data-layer') {
      setDataLayers(prev => {
        if (isEdit) {
          return prev.map(d => d.id === savedItem.id ? savedItem : d);
        } else {
          return [savedItem, ...prev];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_DATALAYER' : 'ADD_DATALAYER', savedItem.name);
    } else if (modalType === 'research-theme') {
      setThemes(prev => {
        if (isEdit) {
          return prev.map(t => t.id === savedItem.id ? savedItem : t);
        } else {
          return [...prev, savedItem];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_RESEARCH_THEME' : 'ADD_RESEARCH_THEME', savedItem.title);
    } else if (modalType === 'instrument') {
      setInstruments(prev => {
        if (isEdit) {
          return prev.map(i => i.id === savedItem.id ? savedItem : i);
        } else {
          return [...prev, savedItem];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_INSTRUMENT' : 'ADD_INSTRUMENT', savedItem.name);
    } else if (modalType === 'person') {
      setPeople(prev => {
        if (isEdit) {
          return prev.map(p => p.id === savedItem.id ? savedItem : p);
        } else {
          return [...prev, savedItem];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_PEOPLE_ROSTER' : 'ADD_PEOPLE_ROSTER', savedItem.name);
    } else if (modalType === 'software') {
      setSoftwareList(prev => {
        if (isEdit) {
          return prev.map(s => s.id === savedItem.id ? savedItem : s);
        } else {
          return [savedItem, ...prev];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_SOFTWARE' : 'ADD_SOFTWARE', savedItem.title);
    } else if (modalType === 'teaching') {
      setTeachingList(prev => {
        if (isEdit) {
          return prev.map(t => t.id === savedItem.id ? savedItem : t);
        } else {
          return [savedItem, ...prev];
        }
      });
      appendAuditLog(isEdit ? 'UPDATE_TEACHING_MATERIAL' : 'ADD_TEACHING_MATERIAL', savedItem.title);
    }

    setModalOpen(false);
    setEditingItem(null);
  };

  // Unified Delete handlers
  const handleDeleteItem = (id: string, itemType: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete "${displayName}" from our records? This action will generate a safety log.`)) {
      return;
    }

    if (itemType === 'publication') {
      setPublications(prev => prev.filter(p => p.id !== id));
      appendAuditLog('DELETE_PUBLICATION', displayName);
    } else if (itemType === 'data-layer') {
      setDataLayers(prev => prev.filter(d => d.id !== id));
      appendAuditLog('DELETE_DATALAYER', displayName);
    } else if (itemType === 'research-theme') {
      setThemes(prev => prev.filter(t => t.id !== id));
      appendAuditLog('DELETE_RESEARCH_THEME', displayName);
    } else if (itemType === 'instrument') {
      setInstruments(prev => prev.filter(i => i.id !== id));
      appendAuditLog('DELETE_INSTRUMENT', displayName);
    } else if (itemType === 'person') {
      setPeople(prev => prev.filter(p => p.id !== id));
      appendAuditLog('DELETE_PEOPLE_ROSTER', displayName);
    } else if (itemType === 'software') {
      setSoftwareList(prev => prev.filter(s => s.id !== id));
      appendAuditLog('DELETE_SOFTWARE', displayName);
    } else if (itemType === 'teaching') {
      setTeachingList(prev => prev.filter(t => t.id !== id));
      appendAuditLog('DELETE_TEACHING_MATERIAL', displayName);
    }
  };

  // Box file operations
  const handleBoxAddFile = (newFile: BoxFile) => {
    setBoxFiles(prev => [newFile, ...prev]);
    appendAuditLog(newFile.type === 'folder' ? 'CREATE_BOX_FOLDER' : 'UPLOAD_BOX_FILE', `${newFile.name} added to workspace`);
  };

  const handleBoxDeleteFile = (fileId: string) => {
    const targetFile = boxFiles.find(f => f.id === fileId);
    setBoxFiles(prev => prev.filter(f => f.id !== fileId));
    appendAuditLog('DELETE_BOX_ITEM', `${targetFile?.name || 'File'} removed from Box workspace`);
  };

  // Admissions Application form handler
  const handleAdmissionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail) return;

    const newApplication = {
      id: `app-${Date.now()}`,
      name: studentName,
      email: studentEmail,
      degree: studentDegree,
      interests: studentInterests,
      statement: studentStatement,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setInboxEntries(prev => [newApplication, ...prev]);
    setShowContactSuccess(true);
    
    // Clear forms
    setStudentName('');
    setStudentEmail('');
    setStudentStatement('');
    setStudentInterests([]);

    appendAuditLog('PUBLIC_STUDENT_APPLICATION', `${studentName} submitted prospective student profile (${studentDegree})`);
  };

  const toggleInterest = (interest: string) => {
    setStudentInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleScholarSync = async () => {
    if (isSyncingScholar) return;
    setIsSyncingScholar(true);
    setSyncScholarLogs(['🔍 Connecting to live academic metadata feed for Dr. Hongxing Liu (Scholar ID: GN_fGecAAAAJ)...']);

    try {
      // 1. Live query to OpenAlex open research registry across Dr. Liu publications
      setSyncScholarLogs(prev => [...prev, '🌐 Querying live peer-reviewed works (Univ of Alabama, Cincinnati, Texas A&M, USGS)...']);
      const openAlexUrl = `https://api.openalex.org/works?filter=author.id:A5101778436&sort=publication_year:desc&per_page=100`;

      let liveWorks: Publication[] = [];
      try {
        const liveRes = await fetch(openAlexUrl);
        if (liveRes.ok) {
          const json = await liveRes.json();
          if (Array.isArray(json.results) && json.results.length > 0) {
            // Intelligent filter: Dr. Hongxing Liu in Geography, Remote Sensing, Hydrology, Water Quality
            const relevantResults = json.results.filter((w: any) => {
              const title = (w.title || w.display_name || '').toLowerCase();
              const concepts = (w.concepts || []).map((c: any) => (c.display_name || '').toLowerCase());
              const affiliations = (w.authorships || [])
                .flatMap((a: any) => (a.institutions || []).map((i: any) => (i.display_name || '').toLowerCase()))
                .concat((w.authorships || []).flatMap((a: any) => (a.raw_affiliation_strings || []).map((s: string) => s.toLowerCase())));

              // Exclude medical, surgical, cancer, or non-geospatial arsenic chemistry
              const isMed = title.includes('craniopharyngioma') || title.includes('carcinoma') || title.includes('oncology') || 
                            title.includes('neurosurgery') || title.includes('leukemia') || title.includes('arsenic removal') ||
                            title.includes('sorbent design') || title.includes('patient') || title.includes('clinical');
              if (isMed) return false;

              // Affirmative matches: UA, Cincinnati, Texas A&M, Ohio State, USGS, CIROH, Remote Sensing, Water, Geography
              const hasAffiliation = affiliations.some(aff => 
                aff.includes('alabama') || aff.includes('cincinnati') || aff.includes('texas a&m') || 
                aff.includes('ohio state') || aff.includes('geography') || aff.includes('remote sensing') ||
                aff.includes('usgs') || aff.includes('ciroh')
              );

              const hasKeywords = concepts.some(c => 
                c.includes('remote sensing') || c.includes('geography') || c.includes('hydrology') || 
                c.includes('gis') || c.includes('water') || c.includes('sediment') || c.includes('satellite') ||
                c.includes('earth observation') || c.includes('radar') || c.includes('spatial') || c.includes('photogrammetry')
              );

              const hasTitleTerms = title.includes('water') || title.includes('lake') || title.includes('river') || 
                                    title.includes('flood') || title.includes('satellite') || title.includes('remote sensing') || 
                                    title.includes('sar') || title.includes('lidar') || title.includes('snow') || 
                                    title.includes('ice') || title.includes('forest') || title.includes('dem') || 
                                    title.includes('geographic') || title.includes('spatial') || title.includes('swot') ||
                                    title.includes('sediment') || title.includes('algal') || title.includes('turbidity');

              return hasAffiliation || hasKeywords || hasTitleTerms;
            });

            liveWorks = relevantResults.map((w: any, idx: number) => {
              const authors = (w.authorships || [])
                .map((a: any) => a.author?.display_name)
                .filter(Boolean)
                .slice(0, 5)
                .join(', ') || 'H. Liu et al.';
              const venue = w.primary_location?.source?.display_name || w.primary_location?.raw_source_name || 'Academic Journal';
              const year = w.publication_year || 2024;
              const isConf = w.type === 'proceedings-article' || w.type === 'conference-paper';
              const link = w.doi || w.primary_location?.landing_page_url || `https://scholar.google.com/citations?user=GN_fGecAAAAJ`;
              const rawAbstract = reconstructAbstract(w.abstract_inverted_index);
              const abstract = rawAbstract || 'Peer-reviewed research publication in satellite remote sensing, inland water quality, hydrology, and geospatial environmental modeling by Dr. Hongxing Liu and collaborators.';
              return {
                id: `pub-scholar-${w.id ? w.id.replace('https://openalex.org/', '') : idx}`,
                title: w.title || w.display_name || 'Environmental Remote Sensing Research',
                authors,
                venue: w.biblio?.volume ? `${venue} ${w.biblio.volume}` : venue,
                year,
                type: isConf ? 'Conference' : 'Peer-Reviewed Article',
                link,
                abstract,
                keywords: (w.concepts || []).slice(0, 4).map((c: any) => c.display_name).filter(Boolean)
              };
            });
          }
        }
      } catch (err) {
        console.warn('Live API request notice:', err);
      }

      const cleanLiveWorks = liveWorks.filter(p => !isMockPublication(p));
      if (cleanLiveWorks.length > 0) {
        setPublications(cleanLiveWorks);
        localStorage.setItem('ersl_publications', JSON.stringify(cleanLiveWorks));
        setSyncScholarLogs(prev => [
          ...prev,
          `📥 Retrieved ${cleanLiveWorks.length} verified peer-reviewed articles & conference papers from Dr. Hongxing Liu's active research index!`,
          `✅ ERSL Lab publication catalog successfully synchronized and saved to local storage!`
        ]);
      } else {
        setSyncScholarLogs(prev => [
          ...prev,
          `ℹ️ No new papers automatically imported. You can add any publication manually by pasting its DOI or Google Scholar link using the "+ Add" button above!`
        ]);
      }
    } catch {
      setSyncScholarLogs(prev => [...prev, '❌ Unable to complete publications synchronization. Please use "+ Add" to add papers by DOI or link.']);
    } finally {
      setIsSyncingScholar(false);
      appendAuditLog('SCHOLAR_PROFILE_SYNC', 'Synchronized Dr. Hongxing Liu publications from academic index');
    }
  };

  // Filter and sort publication logic
  const filteredPublications = publications
    .filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(pubSearch.toLowerCase()) || 
                            pub.authors.toLowerCase().includes(pubSearch.toLowerCase()) ||
                            pub.venue.toLowerCase().includes(pubSearch.toLowerCase());
      const matchesFilter = pubFilter === 'All' || pub.type === pubFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      return pubSort === 'newest' ? b.year - a.year : a.year - b.year;
    });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 font-sans selection:bg-red-200 selection:text-red-900">
      
      {/* Top Banner indicating Admin / Editor rights */}
      {currentUser && currentUser.role !== 'Viewer' && (
        <div className="bg-[#1e293b] text-white px-4 py-2 text-xs flex justify-between items-center z-40 border-b border-slate-700 select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
            <span className="font-bold uppercase tracking-wider">
              {currentUser.role === 'Admin' ? '🛠️ UA Admin Mode Enabled' : '✍️ ERSL Researcher Mode Enabled'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300 font-medium">Session identity: {currentUser.name} ({currentUser.email})</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('admin')}
              className="bg-[#9E1B32] text-white text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider hover:bg-red-800 transition-colors cursor-pointer"
            >
              Control Panel
            </button>
          </div>
        </div>
      )}

      {/* Main Header / Navigation */}
      <UAHeader 
        currentUser={currentUser}
        onLoginClick={() => setShowSSOPopup(true)}
        onLogout={handleLogout}
        currentTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAdminClick={() => setActiveTab('admin')}
      />

      {/* Main Body view route controller */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Dynamic Slider Section */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-slate-900 aspect-[21/9] md:aspect-[16/6]">
              <img 
                src={
                  failedImages[`slide-${currentSlide}`]
                    ? slides[currentSlide].image
                    : resolveImagePath(slides[currentSlide].file, 'home')
                } 
                onError={() => {
                  setFailedImages(prev => ({ ...prev, [`slide-${currentSlide}`]: true }));
                }}
                alt={slides[currentSlide].title} 
                className="w-full h-full object-cover opacity-60 transition-all duration-1000 transform scale-102"
              />
              {/* Creative Floating Lab Insignia Badge */}
              <div className="absolute top-6 right-6 hidden md:flex items-center space-x-3.5 bg-slate-950/70 backdrop-blur-md border border-white/20 p-2.5 pr-4 rounded-2xl shadow-2xl z-10 select-none animate-in fade-in duration-500">
                <div className="w-13 h-13 rounded-full p-0.5 bg-gradient-to-tr from-[#9E1B32] via-red-500 to-amber-400 shadow-md flex items-center justify-center shrink-0">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/logo/logo.jpg`} 
                    alt="ERSL Lab Crest"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'images/logo/logo.jpg';
                    }}
                  />
                </div>
                <div className="text-left text-white leading-tight">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-200">RESEARCH FACILITY</span>
                  </div>
                  <p className="text-xs font-black text-white mt-0.5">ERSL Hydrologic Observatory</p>
                  <p className="text-[10px] text-slate-300 font-medium">The University of Alabama</p>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-12 select-none">
                <div className="max-w-2xl text-left">
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-xs md:text-sm text-slate-200 mt-2.5 font-medium leading-relaxed max-w-lg">
                    {slides[currentSlide].desc}
                  </p>
                  <div className="mt-5 flex space-x-3">
                    <button 
                      onClick={() => setActiveTab('research')} 
                      className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs py-2 px-5 rounded transition-all shadow-md shadow-red-950/40 cursor-pointer"
                    >
                      Explore Research Themes
                    </button>
                    <button 
                      onClick={() => setActiveTab('publications')} 
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs py-2 px-5 rounded backdrop-blur-sm transition-all cursor-pointer"
                    >
                      View Publications
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider Dots indicators */}
              <div className="absolute bottom-4 right-6 flex space-x-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === i ? 'bg-[#9E1B32] w-5' : 'bg-white/50 hover:bg-white'
                    }`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Public News & Lab Highlights */}
            <section id="home-news" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 text-left space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📢</span>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Latest News & Lab Updates</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#9E1B32] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      Public
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recent journal publications, student achievements, grant awards, field campaigns, and research stories.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(currentUser || isAdmin || editMode) && (
                    <button
                      onClick={() => {
                        setEditingNewsItem(null);
                        setNewsModalOpen(true);
                      }}
                      className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Post News / Story</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'All Updates', icon: '🌐' },
                  { id: 'publication', label: 'Publications', icon: '🎓' },
                  { id: 'achievement', label: 'Achievements', icon: '🏆' },
                  { id: 'field', label: 'Field Surveys', icon: '🚁' },
                  { id: 'blog', label: 'Blogs & Notes', icon: '✍️' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setNewsCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center space-x-1 ${
                      newsCategoryFilter === tab.id
                        ? 'bg-[#9E1B32] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {news
                  .filter(n => newsCategoryFilter === 'all' || (n.category || 'general') === newsCategoryFilter)
                  .map((n) => {
                    const cat = n.category || 'general';
                    const badgeStyles: Record<string, { label: string; icon: string; cls: string }> = {
                      publication: { label: 'Publication', icon: '🎓', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                      achievement: { label: 'Achievement', icon: '🏆', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
                      field: { label: 'Field Campaign', icon: '🚁', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
                      blog: { label: 'Lab Blog', icon: '✍️', cls: 'bg-purple-50 text-purple-800 border-purple-200' },
                      general: { label: 'Announcement', icon: '📢', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
                    };
                    const badge = badgeStyles[cat] || badgeStyles.general;

                    return (
                      <article key={n.id} className="border border-gray-100 rounded-xl p-4 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between text-left group relative">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.cls}`}>
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                            </span>
                            <time className="text-[10px] font-bold text-gray-400">
                              {new Date(n.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </time>
                          </div>

                          <h3 className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-[#9E1B32] transition-colors">
                            {n.title}
                          </h3>
                          <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                            {n.summary}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                          {n.link ? (
                            n.link.startsWith('#') ? (
                              <button
                                onClick={() => setActiveTab(n.link!.replace('#', ''))}
                                className="text-xs font-bold text-[#9E1B32] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>Explore tab →</span>
                              </button>
                            ) : (
                              <a
                                href={n.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-[#9E1B32] hover:underline flex items-center gap-1"
                              >
                                <span>Read more →</span>
                              </a>
                            )
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Lab update</span>
                          )}

                          {(currentUser || isAdmin || editMode) && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setEditingNewsItem(n);
                                  setNewsModalOpen(true);
                                }}
                                className="p-1 text-slate-500 hover:text-[#9E1B32] hover:bg-red-50 rounded cursor-pointer transition-colors"
                                title="Edit this announcement"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNewsItem(n.id, n.title)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                                title="Delete announcement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>

            {/* Core Feature Block with University Seal styling */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <div className="lg:col-span-7 text-left space-y-4">
                <span className="text-[#9E1B32] uppercase tracking-widest font-extrabold text-xs">Aims & Mission</span>
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Bridging Physical Hydrology & Cloud Earth Observation to Model Water Dynamics
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed" style={{ textWrap: 'balance' }}>
                  Our research balances extensive field-level tracking (with state-of-the-art UAV LiDAR and Acoustic Doppler Current Profilers) with multi-spectral satellite sensors. By establishing robust AI predictive models and river morphology profiles, our facility drives new breakthroughs in flood mitigation, water-level tracking, and ecological resilience.
                </p>
                <div className="pt-2 flex flex-wrap gap-2.5 text-xs font-semibold text-gray-700">
                  <button onClick={() => setActiveTab('people')} className="px-4 py-2 rounded border border-gray-200 hover:border-[#9E1B32] hover:text-[#9E1B32] transition-all bg-slate-50 hover:bg-white cursor-pointer">
                    👥 Meet the Team
                  </button>
                  <button onClick={() => setActiveTab('publications')} className="px-4 py-2 rounded border border-gray-200 hover:border-[#9E1B32] hover:text-[#9E1B32] transition-all bg-slate-50 hover:bg-white cursor-pointer">
                    📄 Academic Publications
                  </button>
                  <button onClick={() => setActiveTab('research')} className="px-4 py-2 rounded border border-gray-200 hover:border-[#9E1B32] hover:text-[#9E1B32] transition-all bg-slate-50 hover:bg-white cursor-pointer">
                    🔬 Research Areas
                  </button>
                </div>
              </div>

              {/* Graphic container */}
              <div className="lg:col-span-5 bg-gradient-to-br from-red-50 to-slate-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-center text-center space-y-4 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9E1B32]/3 rounded-full translate-x-12 -translate-y-12"></div>
                <div className="w-12 h-12 rounded-full bg-red-100 text-[#9E1B32] flex items-center justify-center mx-auto text-lg font-bold shadow-sm">
                  🌊
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Real-time Flood Gauging & Mapping</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed mt-1">
                    Calibrated on the Black Warrior River Basin, our deep neural networks predict reach-scale inundation in real-time.
                  </p>
                </div>
                <div className="border-t border-gray-100 my-1 pt-3 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-sm font-black text-[#9E1B32]">12K+ Points</span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Hydrologic Data Grid</p>
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-800">5cm/px</span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">UAV Resolution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: RESEARCH THEMES & PROJECTS */}
        {activeTab === 'research' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header banner */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">FACULTY STREAMS</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Active Research Themes</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Advanced computational modeling and multi-band sensor mapping across aquatic corridors, river geomorphology, and flood inundation models.
              </p>
            </div>

            {/* Themes Grid */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Investigative Streams</h3>
                {editMode && (
                  currentUser?.email === 'hongxing.liu@ua.edu' ? (
                    <button
                      onClick={() => {
                        setModalType('research-theme');
                        setEditingItem(null);
                        setModalOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded flex items-center space-x-1 shadow-sm hover:cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Research Theme</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 border border-gray-200 px-3 py-1.5 rounded select-none">
                      🔒 Research Areas editable only by Dr. Liu
                    </span>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {themes.map((theme, i) => (
                  <div key={theme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow relative h-[520px]">
                    
                    {/* Admin Actions Overlay inside card - Only Dr. Liu (hliu / hongxing.liu) */}
                    {editMode && currentUser?.email === 'hongxing.liu@ua.edu' && (
                      <div className="absolute top-2.5 right-2.5 flex space-x-1.5 z-10">
                        <button
                          onClick={() => {
                            setModalType('research-theme');
                            setEditingItem(theme);
                            setModalOpen(true);
                          }}
                          className="p-1 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded border border-gray-200 shadow-sm hover:cursor-pointer"
                          title="Edit Theme"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(theme.id, 'research-theme', theme.title)}
                          className="p-1 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 rounded border border-gray-200 shadow-sm hover:cursor-pointer"
                          title="Delete Theme"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div>
                      {/* Image representation */}
                      <div className="h-40 relative overflow-hidden bg-slate-800">
                        {theme.image ? (
                          <img
                            src={
                              failedImages[`theme-${theme.id}`]
                                ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80'
                                : resolveImagePath(theme.image, 'research')
                            }
                            onError={() => {
                              setFailedImages(prev => ({ ...prev, [`theme-${theme.id}`]: true }));
                            }}
                            alt={theme.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative text-center">
                            <div className="absolute inset-0 bg-[#9E1B32]/10 mix-blend-overlay"></div>
                            <span className="text-white font-extrabold tracking-tight text-xs uppercase px-4 py-2 border border-white/20 bg-black/30 rounded backdrop-blur-xs select-none">
                              {theme.title.split(' ')[0]} ANALYSIS
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 text-left overflow-hidden">
                        <h4 className="font-extrabold text-[#9E1B32] text-sm tracking-tight line-clamp-1">{theme.title}</h4>
                        <p className="text-gray-500 text-[11px] leading-relaxed mt-2.5 line-clamp-4">{theme.description}</p>
                      </div>
                    </div>

                    {/* Linked peer-reviewed publications linked dynamically (Point 3) */}
                    {(() => {
                      const linked = publications.filter(pub => {
                        return theme.keywords.some(kw => 
                          pub.title.toLowerCase().includes(kw.toLowerCase()) || 
                          pub.abstract?.toLowerCase().includes(kw.toLowerCase()) ||
                          (pub.keywords && pub.keywords.some((pk: string) => pk.toLowerCase() === kw.toLowerCase()))
                        );
                      });

                      if (linked.length === 0) {
                        return (
                          <div className="px-5 pb-3 text-left text-[10px] text-gray-400 font-bold">
                            📖 No publications indexed under this stream yet.
                          </div>
                        );
                      }

                      return (
                        <div className="px-5 pb-3 text-left">
                          <h5 className="text-[9px] font-bold text-[#9E1B32] uppercase tracking-wider mb-2">Selected Publications ({linked.length})</h5>
                          <ul className="space-y-1.5">
                            {linked.map(pub => (
                              <li key={pub.id} className="text-[10px] text-slate-600 hover:text-[#9E1B32] leading-snug flex items-start space-x-1.5">
                                <span className="text-[#9E1B32] font-bold shrink-0 select-none">&bull;</span>
                                <a 
                                  href={pub.link || "#"} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="hover:underline font-semibold"
                                >
                                  {pub.title} ({pub.year})
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}

                    <div className="p-5 pt-0 text-left border-t border-gray-50 mt-2">
                      <div className="flex flex-wrap gap-1 mt-3">
                        {theme.keywords.map(kw => (
                          <span key={kw} className="bg-slate-100 text-slate-700 font-semibold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Funded Projects Section */}
            <div className="bg-slate-50 border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="text-left mb-6">
                <span className="bg-red-50 text-[#9E1B32] text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">Funded Collaborations</span>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-800 mt-2">Active National Research Grants</h3>
                <p className="text-xs text-gray-500">Laboratory investigations backed by leading federal science and hydrographic administrations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {projects.map((proj) => (
                  <div 
                    key={proj.id} 
                    onClick={() => setSelectedProjectDetails(proj)}
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-[#9E1B32] flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#9E1B32] bg-red-50 px-2 py-0.5 rounded border border-red-100">{proj.agency}</span>
                        <span className="text-[#9E1B32] opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold flex items-center space-x-1">
                          <span>Explore Grant</span>
                          <span>&rarr;</span>
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-3 group-hover:text-[#9E1B32] transition-colors">{proj.title}</h4>
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed">{proj.details}</p>
                    </div>

                    <div className="border-t border-gray-50 pt-3 mt-4 flex items-center justify-between text-[10px] text-gray-400 font-bold">
                      <span>PROJECT NO: UA-ERSL-{proj.id.toUpperCase()}</span>
                      <span className="text-[#9E1B32] uppercase tracking-wider font-extrabold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#9E1B32] rounded-full animate-ping shrink-0"></span>
                        <span>RESEARCH ACTIVE</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: PUBLICATIONS PORTAL */}
        {activeTab === 'publications' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">ACADEMIC OUTPUTS</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Peer-Reviewed Publications</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Journal articles, international congress presentations, and technical hydrographic reports compiled by the ERSL facility.
              </p>
            </div>

            {/* Filter and Search controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles by title, author, or venue..."
                  value={pubSearch}
                  onChange={(e) => setPubSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 rounded border border-gray-200 focus:outline-none focus:border-[#9E1B32]"
                />
              </div>

              <div className="md:col-span-3 flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-400 shrink-0 uppercase tracking-wider">Type:</span>
                <select
                  value={pubFilter}
                  onChange={(e) => setPubFilter(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-gray-200 rounded focus:outline-none focus:border-[#9E1B32] font-semibold text-gray-700"
                >
                  <option value="All">All Publications</option>
                  <option value="Peer-Reviewed Article">Peer-Reviewed Articles</option>
                  <option value="Conference">Conference Proceedings</option>
                  <option value="Other">Other Reports</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <span className="text-xs font-bold text-gray-400 shrink-0 uppercase tracking-wider">Sort:</span>
                <select
                  value={pubSort}
                  onChange={(e) => setPubSort(e.target.value as 'newest' | 'oldest')}
                  className="w-full text-xs p-2 bg-slate-50 border border-gray-200 rounded focus:outline-none focus:border-[#9E1B32] font-semibold text-gray-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <div className="md:col-span-2 flex flex-wrap items-center justify-end gap-2">
                {(currentUser || isAdmin || editMode) ? (
                  <>
                    <button
                      onClick={() => {
                        setModalType('publication');
                        setEditingItem(null);
                        setModalOpen(true);
                      }}
                      className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs py-2 px-3 rounded flex items-center justify-center space-x-1 shadow-sm cursor-pointer shrink-0"
                      title="Add publication"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>

                    {publications.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear all publications? The catalog will be completely emptied. You can add papers manually by DOI or sync from Google Scholar.")) {
                            setPublications([]);
                            localStorage.setItem('ersl_publications', JSON.stringify([]));
                            appendAuditLog('CLEAR_PUBLICATIONS', 'Cleared all publications from website catalog');
                          }
                        }}
                        className="bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 text-xs font-bold py-2 px-2.5 rounded flex items-center justify-center space-x-1 cursor-pointer shrink-0"
                        title="Clear all publication records"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear All</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider text-center md:text-right">
                    📖 {filteredPublications.length} Records
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic publications render */}
            <div className="space-y-4">
              {filteredPublications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm space-y-3">
                  <FileText className="w-12 h-12 mx-auto text-gray-300" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-700">No publication records currently displayed.</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                      {currentUser
                        ? 'Click "+ Add" above to add research publications.'
                        : 'Publications will be displayed here once cataloged by the laboratory.'}
                    </p>
                  </div>
                  {(currentUser || isAdmin || editMode) && (
                    <button
                      onClick={() => {
                        setModalType('publication');
                        setEditingItem(null);
                        setModalOpen(true);
                      }}
                      className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs py-2 px-4 rounded-lg inline-flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Publication</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 text-left">
                  {filteredPublications.map((pub) => (
                    <div key={pub.id} className="p-5 flex items-start space-x-4 hover:bg-slate-50/30 transition-colors group relative">
                      
                      {/* Badge indicator */}
                      <span className="bg-red-50 text-[#9E1B32] font-extrabold text-[10px] px-2.5 py-1 rounded border border-red-100 h-6 shrink-0 shadow-xs">
                        {pub.year}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-[#9E1B32] uppercase tracking-wider text-[9px]">
                          {pub.type}
                        </p>
                        <h4 className="text-sm font-bold text-slate-800 leading-snug mt-1 max-w-4xl">
                          {pub.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1.5">
                          <strong>{pub.authors}</strong> | <span className="italic">{pub.venue}</span>
                        </p>

                        {pub.link && (
                          <a 
                            href={pub.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2 hover:underline"
                          >
                            <span>DOI Access URL</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Interactive elements on individual record */}
                      {(currentUser || isAdmin || editMode) && (
                        <div className="flex space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setModalType('publication');
                              setEditingItem(pub);
                              setModalOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded cursor-pointer transition-colors"
                            title="Edit Publication"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(pub.id, 'publication', pub.title)}
                            className="p-1 text-red-500 hover:bg-red-50 border border-gray-200 rounded cursor-pointer transition-colors"
                            title="Delete Publication"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>



          </div>
        )}

        {/* VIEW: PROFESSIONAL DEVELOPMENT (RESTRICTED FOR MEMBERS ONLY) */}
        {activeTab === 'professional' && (
          currentUser ? (
            <ProfessionalDevelopment currentUser={currentUser} />
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center max-w-lg mx-auto shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-red-50 text-[#9E1B32] flex items-center justify-center mx-auto border border-red-100">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9E1B32] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                  CONFIDENTIAL MEMBER RESOURCE
                </span>
                <h3 className="text-lg font-extrabold text-slate-800 mt-2">Professional Development Vault Is Restricted</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Proprietary journal manuscript frameworks, peer-reviewer rebuttal toolkits, NASA/NSF grant templates, and lab writing materials are reserved exclusively for authorized University of Alabama ERSL researchers.
                </p>
              </div>
              <button
                onClick={() => setShowSSOPopup(true)}
                className="bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-all shadow-md shadow-red-950/20 cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Authenticate via myBama SSO or Member Login</span>
              </button>
            </div>
          )
        )}

        {/* VIEW 4: SOFTWARE & MODELS */}
        {activeTab === 'software' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">OPEN CODE</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Software & Computational Models</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Open-source geospatial toolkits, river boundary segmentation architectures, and change-point detectors compiled in Python and R.
              </p>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {softwareList.map((soft) => (
                <div key={soft.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        soft.language === 'Python' 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : 'bg-purple-50 text-purple-600 border-purple-100'
                      }`}>
                        {soft.language}
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">v1.0.0</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 mt-4">{soft.title}</h4>
                    <p className="text-gray-500 text-xs mt-2.5 leading-relaxed">{soft.description}</p>
                  </div>

                  <div className="border-t border-gray-50 pt-4 mt-6 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-400">LICENSE: MIT OPEN SOURCE</span>
                    {soft.link && (
                      <a 
                        href={soft.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-slate-900 hover:bg-[#9E1B32] text-white text-[10px] font-bold py-1.5 px-3.5 rounded flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                      >
                        <span>GitHub Repository</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: DATA LAYERS */}
        {activeTab === 'data' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">REPOSITORIES</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Environmental Data Layers</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Access points for open-source global satellite archives and proprietary, field-surveyed geomorphic datasets.
              </p>
            </div>

            {/* Filter and Add */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter data layers..."
                  value={dataSearch}
                  onChange={(e) => setDataSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white rounded border border-gray-200 focus:outline-none focus:border-[#9E1B32] shadow-xs"
                />
              </div>

              {editMode && (
                <button
                  onClick={() => {
                    setModalType('data-layer');
                    setEditingItem(null);
                    setModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded flex items-center space-x-1 shadow-sm hover:cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Data Layer</span>
                </button>
              )}
            </div>

            {/* Lists */}
            <div className="space-y-4 text-left">
              {dataLayers
                .filter(data => data.name.toLowerCase().includes(dataSearch.toLowerCase()) || data.description.toLowerCase().includes(dataSearch.toLowerCase()))
                .map((data) => (
                  <div 
                    key={data.id} 
                    className="bg-white p-5 rounded-xl border border-gray-100 border-l-4 border-l-[#9E1B32] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative group"
                  >
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2.5">
                        <h4 className="text-sm font-extrabold text-slate-800">{data.name}</h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          data.availability === 'Public' 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : data.availability === 'Request'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {data.availability}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2 leading-relaxed max-w-4xl">{data.description}</p>
                    </div>

                    {/* Actions and access buttons */}
                    <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
                      {data.link && (
                        <a 
                          href={data.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="bg-[#9E1B32] hover:bg-red-800 text-white text-[10px] font-bold py-1.5 px-4 rounded shadow-sm flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Fetch Dataset</span>
                        </a>
                      )}

                      {editMode && (
                        <div className="flex space-x-1 opacity-85 group-hover:opacity-100 transition-opacity pl-2 border-l border-gray-100">
                          <button
                            onClick={() => {
                              setModalType('data-layer');
                              setEditingItem(data);
                              setModalOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded cursor-pointer transition-colors"
                            title="Edit Dataset"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(data.id, 'data-layer', data.name)}
                            className="p-1 text-red-500 hover:bg-red-50 border border-gray-200 rounded cursor-pointer transition-colors"
                            title="Delete Dataset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
            </div>

          </div>
        )}

        {/* VIEW 6: INSTRUMENTS & FACILITIES */}
        {activeTab === 'instruments' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">PHYSICAL ASSETS</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Research Instruments & Facilities</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Advanced aerial mapping, geodetic positioning, and underwater acoustic stream gauging systems stationed at the ERSL facility.
              </p>
            </div>

            {/* Grid */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Active Equipment Registry</h3>
                {editMode && (
                  <button
                    onClick={() => {
                      setModalType('instrument');
                      setEditingItem(null);
                      setModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded flex items-center space-x-1 shadow-sm hover:cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Instrument</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {instruments.map((inst) => (
                  <div key={inst.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all relative h-[395px]">
                    
                    {editMode && (
                      <div className="absolute top-2.5 right-2.5 flex space-x-1.5 z-10">
                        <button
                          onClick={() => {
                            setModalType('instrument');
                            setEditingItem(inst);
                            setModalOpen(true);
                          }}
                          className="p-1 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded border border-gray-200 shadow-sm cursor-pointer"
                          title="Edit Equipment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(inst.id, 'instrument', inst.name)}
                          className="p-1 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 rounded border border-gray-200 shadow-sm cursor-pointer"
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div>
                      {/* Photo display (Unsplash / uploaded URL) or placeholder */}
                      {inst.image && (inst.image.startsWith('http') || inst.image.includes('.')) ? (
                        <div className="h-44 w-full border-b border-gray-50 overflow-hidden relative select-none">
                          <img 
                            src={
                              failedImages[`inst-${inst.id}`]
                                ? 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=400&q=80'
                                : resolveImagePath(inst.image, 'instruments')
                            }
                            onError={() => {
                              setFailedImages(prev => ({ ...prev, [`inst-${inst.id}`]: true }));
                            }}
                            alt={inst.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-2.5 left-2.5 text-[9px] font-bold text-slate-400 tracking-wider uppercase border border-slate-200 bg-white/90 px-2 py-0.5 rounded shadow-xs z-10">
                            {inst.category}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-red-50 to-slate-100 h-44 flex flex-col items-center justify-center p-6 border-b border-gray-50 relative select-none text-center">
                          <span className="text-[#9E1B32] text-3xl mb-1 shrink-0">🛰️</span>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider mt-1 uppercase border border-slate-200 bg-white/80 px-2 py-0.5 rounded shadow-xs">
                            {inst.category}
                          </span>
                        </div>
                      )}

                      <div className="p-5 overflow-hidden">
                        <h4 className="font-extrabold text-[#9E1B32] text-sm tracking-tight leading-snug line-clamp-1">{inst.name}</h4>
                        <p className="text-gray-500 text-[11px] leading-relaxed mt-2 line-clamp-4">{inst.description}</p>
                        
                        {/* Dynamic Operating Manual Download Link (Point 1 of outstanding list) */}
                        {inst.manualLink && (
                          <div className="mt-3.5 pt-3 border-t border-dashed border-gray-100">
                            <a 
                              href={inst.manualLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#9E1B32] hover:text-red-800 font-extrabold text-[10px] uppercase flex items-center space-x-1 tracking-wider"
                            >
                              <span>📖</span>
                              <span>Download Operating Manual (PDF)</span>
                              <span>&rarr;</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-gray-50 mt-4 flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>STATUS: CALIBRATED</span>
                      <span className="text-green-600 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                        <span>Field Ready</span>
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 7: PEOPLE / LAB ROSTER */}
        {activeTab === 'people' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">RESEARCH DIRECTORY</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Our Researchers</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Dedicated professors, postdoctoral fellows, and graduate research students driving hydrographic innovations inside the ERSL.
              </p>
            </div>

            {/* List */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest">Active Team Roster</h3>
                {editMode && (
                  <button
                    onClick={() => {
                      setModalType('person');
                      setEditingItem(null);
                      setModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded flex items-center space-x-1 shadow-sm hover:cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member Profile</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2 border-b border-gray-200">
                {([['member', 'Team'], ['collaborator', 'Collaborators']] as const).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setPeopleSubTab(k)}
                    className={`px-5 py-2.5 text-sm font-bold -mb-px border-b-2 transition-colors cursor-pointer ${
                      peopleSubTab === k ? 'border-[#9E1B32] text-[#9E1B32]' : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {label} ({people.filter(p => (p.group || 'member') === k).length})
                  </button>
                ))}
              </div>

              <div className="space-y-10">
                {([
                  { key: 'member', title: 'People' },
                  { key: 'collaborator', title: 'Collaborators' },
                ] as const).filter(g => g.key === peopleSubTab).map(({ key, title }) => {
                  const group = people.filter(p => (p.group || 'member') === key);
                  if (group.length === 0 && !editMode) return (
                    <div key={key} className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-sm text-gray-500">
                      No {title.toLowerCase()} listed yet.
                    </div>
                  );
                  return (
              <div key={key} className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-800 border-b-2 border-[#9E1B32] inline-block pb-1">{title}</h3>
              <div className="grid grid-cols-1 gap-8 text-left">
                {group.map((person) => (
                  <div key={person.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row overflow-hidden group hover:shadow-md transition-shadow relative h-[480px] md:h-[280px]">
                    
                    {/* Admin actions */}
                    {editMode && (
                      <div className="absolute top-4 right-4 flex space-x-1.5 z-10">
                        <button
                          onClick={() => {
                            setModalType('person');
                            setEditingItem(person);
                            setModalOpen(true);
                          }}
                          className="p-1 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded border border-gray-200 shadow-sm cursor-pointer transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(person.id, 'person', person.name)}
                          className="p-1 bg-white hover:bg-red-50 text-red-500 hover:text-red-700 rounded border border-gray-200 shadow-sm cursor-pointer transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Left: Image Column (fixed width/height on both mobile and desktop to ensure no squishing/warping) */}
                    <div className="w-full md:w-[220px] lg:w-[240px] bg-slate-50 relative shrink-0 h-[200px] md:h-full">
                      {person.image && !failedImages[`person-${person.id}`] ? (
                        <img
                          src={resolveImagePath(person.image, 'people')}
                          onError={() => {
                            setFailedImages(prev => ({ ...prev, [`person-${person.id}`]: true }));
                          }}
                          alt={person.name}
                          className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] object-cover object-top rounded-xl shadow-xs select-none animate-in fade-in duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-3 bg-red-50 flex flex-col items-center justify-center rounded-xl font-bold text-[#9E1B32] select-none animate-in zoom-in-75">
                          <span className="text-4xl">{getCleanInitials(person.name)}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Info Column with fixed/responsive height to align with outer boundaries */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between overflow-hidden h-[280px] md:h-full">
                      <div>
                        <div className="border-b border-gray-100 pb-2 mb-3">
                          <h4 className="text-lg md:text-xl font-extrabold text-[#9E1B32] tracking-tight">{person.name}</h4>
                          <h6 className="text-xs font-semibold text-gray-500 mt-0.5 capitalize tracking-wide">{person.role}</h6>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs md:text-sm text-gray-800 leading-relaxed line-clamp-2">
                            <strong className="text-gray-900 font-extrabold">Research Focus:</strong>{' '}
                            <span className="font-semibold text-gray-600">{person.researchFocus}</span>
                          </p>
                          <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal text-justify line-clamp-4 md:line-clamp-3 lg:line-clamp-4" id={`bio-${person.id}`}>
                            {person.bio}
                          </p>
                        </div>
                      </div>

                      {/* Social networks & links */}
                      <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center text-xs shrink-0">
                        <div className="flex items-center space-x-2.5">
                          <a 
                            href={`mailto:${person.email}`} 
                            className="bg-slate-50 hover:bg-red-50 hover:text-[#9E1B32] border border-gray-200 text-gray-600 py-1.5 px-3 rounded-lg shadow-xs transition-colors flex items-center justify-center"
                            title="Email Contact"
                          >
                            <Mail className="w-4 h-4 mr-1.5" />
                            <span className="font-semibold text-xs pr-1">Email</span>
                          </a>
                          {person.scholar && (
                            <a 
                              href={person.scholar} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 text-gray-600 py-1.5 px-3 rounded-lg shadow-xs transition-colors flex items-center justify-center"
                              title="Google Scholar Profile"
                            >
                              <span className="font-bold text-[10px] px-1">SCHOLAR</span>
                            </a>
                          )}
                          {person.linkedin && (
                            <a 
                              href={person.linkedin} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 text-gray-600 py-1.5 px-3 rounded-lg shadow-xs transition-colors flex items-center justify-center"
                              title="LinkedIn Profile"
                            >
                              <span className="font-bold text-[10px] px-1">LINKEDIN</span>
                            </a>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">UA GEOGRAPHY</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
              </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* VIEW: FIELD PHOTOS */}
        {activeTab === 'field' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">FIELD WORK</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Field Photos</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Images from our field campaigns, UAV flights and river surveys.
              </p>
            </div>
            {fieldPhotos.length === 0 ? (
              <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 text-sm">
                No photos yet. Add images to <code className="font-mono">src/assets/field/</code> and push to publish.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {fieldPhotos.map((p) => (
                  <figure key={p.url} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <img src={p.url} alt={p.caption} loading="lazy" className="w-full h-48 object-cover" />
                    <figcaption className="p-2.5 text-xs text-gray-600 font-medium text-left">{p.caption}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: TEACHING MATERIALS (Point 5) */}
        {activeTab === 'teaching' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">LAB MEMBER PORTAL</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Teaching & Lab Training Materials</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                Course syllabi, processing checklists, hardware tutorials, and sensor calibration guides restricted to active ERSL team members.
              </p>
            </div>

            {/* Filter and Add */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest text-left">Internal Education Archive</h3>
              </div>

              {editMode && (
                <button
                  onClick={() => {
                    setModalType('teaching');
                    setEditingItem(null);
                    setModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3.5 rounded flex items-center space-x-1 shadow-sm hover:cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Teaching Material</span>
                </button>
              )}
            </div>

            {/* Teaching materials list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {teachingList.map((material) => (
                <div key={material.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group">
                  
                  {editMode && (
                    <div className="absolute top-4 right-4 flex space-x-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setModalType('teaching');
                          setEditingItem(material);
                          setModalOpen(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 border border-gray-200 rounded cursor-pointer transition-colors"
                        title="Edit Course Material"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(material.id, 'teaching', material.title)}
                        className="p-1 text-red-500 hover:bg-red-50 border border-gray-200 rounded cursor-pointer transition-colors"
                        title="Delete Course Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-50 text-[#9E1B32] font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-red-100">
                        {material.course || 'GY General'}
                      </span>
                      <span className="text-gray-400 font-mono text-[9px]">Last revised: {material.updatedAt}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 mt-3">{material.title}</h4>
                    <p className="text-gray-500 text-xs mt-2.5 leading-relaxed">{material.description}</p>
                  </div>

                  <div className="border-t border-gray-50 pt-4 mt-6 flex justify-between items-center">
                    <span className="text-[9px] font-bold text-[#9E1B32] uppercase tracking-wider">🔒 RESTRICTED INTERNAL</span>
                    {material.link && (
                      <a 
                        href={material.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-slate-900 hover:bg-[#9E1B32] text-white text-[10px] font-bold py-1.5 px-3.5 rounded flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                      >
                        <span>Access Material (Box)</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 7B: LAB BULLETINS & ANNOUNCEMENTS */}
        {activeTab === 'bulletins' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">LAB COMMUNICATIONS</span>
                <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Bulletins & Messages</h2>
                <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                  Coordinated notices, remote sensing directives, and operational field survey instructions published by Dr. Liu.
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-lg border border-white/10 text-xs shrink-0 text-left">
                <p className="font-extrabold">🚨 Internal Notice Hub</p>
                <p className="text-[10px] text-red-100 mt-0.5">Visible only to authenticated ERSL members</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Post new announcement (Dr. Liu or Admin only) */}
              {editMode && (currentUser?.email === 'hongxing.liu@ua.edu' || currentUser?.role === 'Admin') && (
                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-left space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2 pb-2 border-b border-gray-100">
                    <span className="text-lg">📢</span>
                    <span>Publish Lab Directive</span>
                  </h3>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const target = e.target as HTMLFormElement;
                      const title = (target.elements.namedItem('b_title') as HTMLInputElement).value;
                      const content = (target.elements.namedItem('b_content') as HTMLTextAreaElement).value;
                      const priority = (target.elements.namedItem('b_priority') as HTMLSelectElement).value;
                      const folder = (target.elements.namedItem('b_folder') as HTMLSelectElement).value;
                      
                      if (!title || !content) return;

                      const newB = {
                        id: `bulletin-${Date.now()}`,
                        title,
                        content,
                        priority,
                        folder,
                        sender: currentUser ? currentUser.name : 'Dr. Hongxing Liu',
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                      };

                      setBulletins(prev => [newB, ...prev]);
                      appendAuditLog('PUBLISH_BULLETIN', `Published notice: "${title}" (${priority})`);
                      target.reset();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Directive Title</label>
                      <input 
                        type="text" 
                        name="b_title" 
                        placeholder="e.g., ADCP Black Warrior River Calibration Campaign" 
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Research Idea Folder</label>
                      <select 
                        name="b_folder"
                        defaultValue={activeBulletinFolder !== 'All' ? activeBulletinFolder : 'General'}
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                      >
                        {bulletinFolders.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Priority Level</label>
                      <select 
                        name="b_priority"
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="high">Urgent/High Priority</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Directive / Message Body</label>
                      <textarea 
                        name="b_content" 
                        placeholder="Type detailed research directives, instructions, or meeting notifications here..." 
                        rows={4}
                        className="w-full p-2 bg-slate-50 border border-gray-300 rounded text-xs focus:outline-none focus:border-[#9E1B32]"
                        required 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-[#9E1B32] hover:bg-red-800 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <span>🚀</span>
                      <span>Broadcast Notice to Lab Feed</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Right Column (or full width if not editor): Bulletin Feed */}
              <div className={`${(editMode && (currentUser?.email === 'hongxing.liu@ua.edu' || currentUser?.role === 'Admin')) ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4 text-left`}>
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-2">
                  <span>📬</span>
                  <span>Active Notice Board ({bulletins.filter(b => activeBulletinFolder === 'All' || (b.folder || 'General') === activeBulletinFolder).length})</span>
                </h3>

                {/* Research idea folders */}
                <div className="flex flex-wrap items-center gap-2">
                  {['All', ...bulletinFolders].map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveBulletinFolder(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        activeBulletinFolder === f
                          ? 'bg-[#9E1B32] text-white border-[#9E1B32]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#9E1B32] hover:text-[#9E1B32]'
                      }`}
                    >
                      📁 {f}
                    </button>
                  ))}
                  {editMode && (currentUser?.email === 'hongxing.liu@ua.edu' || currentUser?.role === 'Admin') && (
                    <button
                      onClick={() => {
                        const name = prompt('New research idea folder name:')?.trim();
                        if (name && !bulletinFolders.includes(name)) {
                          setBulletinFolders(prev => [...prev, name]);
                          setActiveBulletinFolder(name);
                        }
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-bold border border-dashed border-emerald-500 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      + New Folder
                    </button>
                  )}
                </div>

                {bulletins.length === 0 ? (
                  <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-400 max-w-md mx-auto shadow-xs">
                    <p className="text-2xl">📭</p>
                    <p className="text-xs font-bold text-gray-700 mt-2">No active bulletins</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Check back later for announcements shared by Dr. Liu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulletins.filter(b => activeBulletinFolder === 'All' || (b.folder || 'General') === activeBulletinFolder).map((b) => (
                      <div 
                        key={b.id} 
                        className={`bg-white p-5 rounded-xl border-l-4 shadow-xs transition-all relative group ${
                          b.priority === 'high' 
                            ? 'border-l-red-600 border border-red-100 bg-red-50/10' 
                            : 'border-l-slate-400 border border-gray-100'
                        }`}
                      >
                        {/* Delete Directive */}
                        {editMode && (currentUser?.email === 'hongxing.liu@ua.edu' || currentUser?.role === 'Admin') && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete the bulletin "${b.title}"?`)) {
                                setBulletins(prev => prev.filter(x => x.id !== b.id));
                                appendAuditLog('DELETE_BULLETIN', `Deleted lab bulletin: "${b.title}"`);
                              }
                            }}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200"
                            title="Delete Notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex items-center space-x-2">
                          {b.priority === 'high' ? (
                            <span className="bg-red-100 text-red-700 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-red-200 flex items-center space-x-1 animate-pulse">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                              <span>Urgent Directive</span>
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-slate-200">
                              Lab Notice
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-medium">{b.date}</span>
                          <span className="text-[10px] font-bold text-[#9E1B32] bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">📁 {b.folder || 'General'}</span>
                        </div>

                        <h4 className="font-extrabold text-slate-800 text-sm mt-2">{b.title}</h4>
                        <p className="text-gray-600 text-xs mt-2 leading-relaxed whitespace-pre-wrap">{b.content}</p>

                        <div className="border-t border-gray-50 pt-2.5 mt-4 flex items-center justify-between text-[10px] text-gray-400 font-bold">
                          <span>POSTED BY: {b.sender}</span>
                          <span className="font-mono text-gray-300">ID: {b.id.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 8: OPPORTUNITIES & GRADUATE INTAKE */}
        {activeTab === 'opportunities' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="bg-[#9E1B32] rounded-2xl p-6 md:p-8 text-white shadow-md text-left">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest">JOIN ERSL</span>
              <h2 className="text-2xl md:text-3xl font-extrabold mt-2 tracking-tight">Prospective Graduate Students</h2>
              <p className="text-xs md:text-sm text-red-100 mt-1 max-w-xl">
                We are actively seeking motivated Master\'s and Ph.D. researchers with backgrounds in geomorphology, remote sensing, and computing.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Panel: Requirements details */}
              <div className="lg:col-span-5 text-left space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center space-x-1.5">
                    <GraduationCap className="w-5 h-5 text-[#9E1B32]" />
                    <span>Candidate Core Capabilities</span>
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Successful candidates are fully funded (GRA fellowships supported by NOAA CIROH) and typically exhibit skills in:
                  </p>

                  <ul className="space-y-2 text-xs text-gray-700 font-semibold">
                    <li className="flex items-center space-x-2 bg-slate-50 p-2 rounded">
                      <span className="text-green-600 font-bold shrink-0">✔️</span>
                      <span>Geospatial programming (Python, R, GEE)</span>
                    </li>
                    <li className="flex items-center space-x-2 bg-slate-50 p-2 rounded">
                      <span className="text-green-600 font-bold shrink-0">✔️</span>
                      <span>Fluvial geomorphology & hydrology principles</span>
                    </li>
                    <li className="flex items-center space-x-2 bg-slate-50 p-2 rounded">
                      <span className="text-green-600 font-bold shrink-0">✔️</span>
                      <span>UAV piloting or field ADCP surveying interest</span>
                    </li>
                    <li className="flex items-center space-x-2 bg-slate-50 p-2 rounded">
                      <span className="text-green-600 font-bold shrink-0">✔️</span>
                      <span>Synthetic Aperture Radar (SAR) processing</span>
                    </li>
                  </ul>
                </div>

                {/* Summer school panel */}
                <div className="bg-slate-950 p-6 rounded-xl text-white shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-800/10 rounded-full translate-x-8 -translate-y-8"></div>
                  <span className="bg-[#9E1B32] text-xs font-bold px-2 py-0.5 rounded">Summer School</span>
                  <h4 className="font-bold text-sm mt-3">FLOW Academy 2026</h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Every summer, ERSL organizes interactive field camps for university graduates to learn hydrodynamic gauging and aerial photogrammetry on Black Warrior River.
                  </p>
                </div>
              </div>

              {/* Right Panel: Admissions contact form */}
              <div className="lg:col-span-7">
                <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm text-left">
                  <h3 className="text-base font-extrabold text-slate-800 mb-2">Graduate Intake Application Intake Form</h3>
                  <p className="text-xs text-gray-400 mb-6">Apply to join our research campaigns. Submitted profiles sync to our team dashboard.</p>

                  {showContactSuccess ? (
                    <div className="border border-green-100 bg-green-50/50 rounded-xl p-6 text-center space-y-4 animate-in zoom-in-95">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold shadow-sm">
                        🎉
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">Application Submitted!</h4>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                          Thank you for your interest in ERSL. Your profile has been compiled and securely logged into the university CRM student database. The Lab Director will review your credentials shortly.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowContactSuccess(false)}
                        className="bg-[#222222] hover:bg-[#9E1B32] text-white font-bold text-xs py-1.5 px-4 rounded transition-colors cursor-pointer"
                      >
                        Submit another profile
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAdmissionsSubmit} className="space-y-4 text-xs text-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Full Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Jane Doe"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32]"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Email Address</label>
                          <input
                            type="email"
                            placeholder="e.g., jdoe@crimson.ua.edu"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Degree Objective</label>
                          <select
                            value={studentDegree}
                            onChange={(e) => setStudentDegree(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded focus:outline-none focus:border-[#9E1B32] font-semibold text-gray-700"
                          >
                            <option value="MS">Master of Science (MS) in Geography</option>
                            <option value="PhD">Doctor of Philosophy (PhD) in Geography</option>
                            <option value="PostDoc">Postdoctoral Fellow</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Attach Curriculum Vitae (Simulated)</label>
                          <div className="border border-dashed border-gray-300 rounded p-2 text-center bg-slate-50 font-bold text-[10px] text-gray-400">
                            📎 Drag & Drop CV PDF
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-gray-700 block">Select Primary Research Interests</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            'Python / Geospatial Coding',
                            'UAV Aerial Mapping & LiDAR',
                            'Fluvial Geomorphology & ADCP',
                            'Sentinel-1/2 SAR Remote Sensing'
                          ].map(interest => (
                            <label key={interest} className="flex items-center space-x-2 p-2 bg-slate-50 rounded border border-gray-200 cursor-pointer hover:bg-slate-100/50 transition-colors">
                              <input
                                type="checkbox"
                                checked={studentInterests.includes(interest)}
                                onChange={() => toggleInterest(interest)}
                                className="rounded text-[#9E1B32] focus:ring-[#9E1B32] border-gray-300"
                              />
                              <span className="font-medium text-gray-600">{interest}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Statement of Purpose / Research Intent</label>
                        <textarea
                          placeholder="Briefly state your academic research goals and why you want to work with ERSL..."
                          value={studentStatement}
                          onChange={(e) => setStudentStatement(e.target.value)}
                          rows={4}
                          className="w-full p-2.5 bg-slate-50 rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32]"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#9E1B32] hover:bg-red-800 text-white font-bold py-2.5 rounded transition-all shadow-md shadow-red-100 cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Submit Application to ERSL Portal</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 9: BOX FOLDERS (public folders for everyone, private ones for approved members) */}
        {activeTab === 'box' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {currentUser ? (
              <BoxFolders currentUser={currentUser} />
            ) : (
              <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-400 max-w-lg mx-auto shadow-sm space-y-4">
                <Lock className="w-12 h-12 mx-auto text-[#9E1B32]" />
                <div>
                  <h3 className="text-sm font-bold text-gray-800">🔐 Box Cloud Space Requires Authentication</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Collaborative folders containing proprietary drone imagery, hydrologic discharge models, and active draft manuscripts are reserved for certified University of Alabama lab members.
                  </p>
                </div>
                <button
                  onClick={() => setShowSSOPopup(true)}
                  className="bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold py-2 px-6 rounded transition-all shadow-md cursor-pointer"
                >
                  Authenticate via myBama SSO
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: WORK PLAN (private) */}
        {activeTab === 'workplan' && (
          <div>
            {currentUser ? (
              <Workplan currentUser={currentUser} />
            ) : (
              <div className="bg-white p-12 rounded-xl border border-gray-100 text-center max-w-lg mx-auto shadow-sm space-y-4">
                <Lock className="w-12 h-12 mx-auto text-[#9E1B32]" />
                <p className="text-sm font-bold text-gray-800">Members only</p>
                <button onClick={() => setShowSSOPopup(true)} className="bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold py-2 px-6 rounded cursor-pointer">Log in</button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 10: ADMIN PANEL / SETTINGS */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {currentUser && currentUser.role === 'Admin' && <MemberManager />}
            {currentUser && currentUser.role === 'Admin' ? (
              <AdminDashboard
                currentUser={currentUser}
                users={allUsers}
                onRoleChange={handleUserRoleChange}
                onAddUser={handleAdminAddUser}
                onDeleteUser={handleAdminDeleteUser}
                auditLogs={auditLogs}
                onClearLogs={() => {
                  setAuditLogs([]);
                  appendAuditLog('CLEAR_AUDIT_LOGS', 'Wiped operational terminal log history');
                }}
              />
            ) : (
              <div className="bg-white p-12 rounded-xl border border-gray-100 text-center text-gray-400 max-w-lg mx-auto shadow-sm space-y-4">
                <ShieldAlert className="w-12 h-12 mx-auto text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-gray-800">🚫 Administrative Access Blocked</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    You must be logged in as an **Admin** via the University SSO provider to configure LDAP directories, toggle security roles, or view operational audit trails.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setShowSSOPopup(true);
                  }}
                  className="bg-[#9E1B32] hover:bg-red-800 text-white text-xs font-bold py-2 px-6 rounded transition-all shadow-md cursor-pointer"
                >
                  Re-Authenticate as Admin
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modern, elegant, footer */}
      <footer className="bg-[#222222] text-[#d1d5db] py-10 px-4 md:px-8 border-t border-[#333333] select-none text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h5 className="text-white font-extrabold text-sm mb-3">Environmental Remote Sensing Laboratory (ERSL)</h5>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Calibrating continental-scale hydrological models using high-resolution drone mapping, machine learning, and satellite observations.
            </p>
          </div>
          <div>
            <h5 className="text-white font-extrabold text-sm mb-3">Academic Affiliations</h5>
            <ul className="text-xs space-y-2 text-gray-400">
              <li><a href="https://barefield.ua.edu/" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-all">College of Arts & Sciences</a></li>
              <li><a href="https://geography.ua.edu/" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-all">Department of Geography</a></li>
              <li><a href="https://www.ua.edu/" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-all">The University of Alabama</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-extrabold text-sm mb-3">Administrative Access</h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              Private member area (workplans, lab folders) requires an approved account. Request access from the Member Login.
            </p>
            {!currentUser && (
              <button 
                onClick={() => setShowSSOPopup(true)}
                className="mt-3 inline-flex items-center space-x-1 bg-red-800/50 hover:bg-[#9E1B32] text-red-200 border border-red-700 hover:text-white text-[10px] font-bold py-1.5 px-3 rounded transition-colors cursor-pointer"
              >
                <span>Authorized Portal Log In</span>
              </button>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#333333] flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest gap-2">
          <span>&copy; {new Date().getFullYear()} Environmental Remote Sensing Laboratory. All Rights Reserved.</span>
          <span>Tuscaloosa, AL 35487</span>
        </div>
      </footer>

      {/* SSO Login modal popup */}
      {showSSOPopup && (
        <LoginModal onClose={() => setShowSSOPopup(false)} />
      )}

      {/* Project Details Modal (Point 2) */}
      {selectedProjectDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-[#9E1B32] p-6 text-white relative">
              <button 
                onClick={() => setSelectedProjectDetails(null)}
                className="absolute top-4 right-4 text-white/85 hover:text-white bg-white/15 hover:bg-white/25 p-1.5 rounded-full cursor-pointer transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="bg-white/20 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest">
                Active Research Grant
              </span>
              <h3 className="text-base font-extrabold mt-2 leading-snug">{selectedProjectDetails.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Funding Sponsor</span>
                <p className="text-sm font-extrabold text-[#9E1B32] mt-0.5 flex items-center space-x-1">
                  <span>🏛️</span>
                  <span>{selectedProjectDetails.agency}</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Investigators & Details</span>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-slate-50 border border-slate-100 p-2.5 rounded font-semibold">
                  {selectedProjectDetails.details}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Project Registry Identifier</span>
                <p className="text-xs font-mono text-slate-500 mt-0.5 bg-slate-100 px-2 py-1.5 rounded border border-slate-200">
                  UA-ERSL-{selectedProjectDetails.id.toUpperCase()}
                </p>
              </div>

              <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex items-start space-x-2.5 text-xs text-red-900 mt-2">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <p className="font-extrabold text-[#9E1B32]">Dynamic Integration Node</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-normal">
                    This window presents registered research metadata directly from the ERSL database catalog. This SPA handles project views dynamically; no static sub-HTML pages are required.
                  </p>
                </div>
              </div>

              <div className="flex space-x-2.5 pt-4 border-t border-gray-100">
                {selectedProjectDetails.link && selectedProjectDetails.link !== '#' && (
                  <a
                    href={selectedProjectDetails.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-slate-900 hover:bg-[#9E1B32] text-white text-center py-2.5 rounded text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Official Agency Award Record</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedProjectDetails(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded text-xs font-bold transition-all text-center cursor-pointer border border-slate-200"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <EditModal
          type={modalType}
          item={editingItem}
          onSave={handleModalSave}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* News & Announcements Modal */}
      {newsModalOpen && (
        <NewsModal
          item={editingNewsItem}
          onSave={handleSaveNewsItem}
          onClose={() => {
            setNewsModalOpen(false);
            setEditingNewsItem(null);
          }}
        />
      )}

      {showUpdatePasswordModal && (
        <UpdatePasswordModal onClose={() => setShowUpdatePasswordModal(false)} />
      )}

    </div>
  );
}
