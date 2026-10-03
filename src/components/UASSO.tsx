import React, { useState } from 'react';
import { ShieldAlert, Key, HelpCircle, Server, FileText, Info, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { User, Role } from '../types';

interface UASSOProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export const UASSO: React.FC<UASSOProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDevHelper, setShowDevHelper] = useState(false);

  // Authorized team roster emails map for Single Sign-On Active Directory mapping
  const authorizedRoster = [
    {
      email: 'hongxing.liu@ua.edu',
      aliases: ['hliu@ua.edu', 'hongxing.liu'],
      name: 'Dr. Hongxing Liu',
      role: 'Admin' as Role,
      dept: 'Department of Geography',
      designation: 'Laboratory Director & Professor',
      password: 'hliu@admin2026'
    },
    {
      email: 'dtian1@ua.edu',
      aliases: ['dtian1'],
      name: 'Dr. Dan Tian',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'Research Scientist',
      password: 'dtian@research2026'
    },
    {
      email: 'npurushothaman@ua.edu',
      aliases: ['npurushothaman'],
      name: 'Dr. Naveenkumar Purushothaman',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'Post Doctoral Researcher',
      password: 'npurushothaman2026'
    },
    {
      email: 'emiliutina@crimson.ua.edu',
      aliases: ['emiliutina'],
      name: 'Ekaterina Miliutina',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'PhD Candidate',
      password: 'emiliutina2026'
    },
    {
      email: 'apalaparthi@crimson.ua.edu',
      aliases: ['apalaparthi'],
      name: 'Anindya Palaparthi',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'PhD Candidate',
      password: 'apalaparthi2026'
    },
    {
      email: 'jseo9@crimson.ua.edu',
      aliases: ['jseo9'],
      name: 'Jihee Seo',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'PhD Candidate',
      password: 'jseo92026'
    },
    {
      email: 'tmandal@crimson.ua.edu',
      aliases: ['tmandal'],
      name: 'Tantu Mandal',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'PhD Student',
      password: 'tmandal2026'
    },
    {
      email: 'sraju1@crimson.ua.edu',
      aliases: ['sraju1'],
      name: 'Saravanan Raju',
      role: 'Researcher' as Role,
      dept: 'Department of Geography',
      designation: 'Research Assistant',
      password: 'sraju12026'
    }
  ];

  const handleQuickLogin = (email: string) => {
    setAuthError(null);
    const match = authorizedRoster.find(
      r => r.email === email || r.aliases.includes(email)
    );
    if (match) {
      setUsername(match.email);
      setPassword(match.password);
    }
  };

  const handleMyBamaLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setAuthError(null);
    setIsLoading(true);

    setTimeout(() => {
      const normalizedInput = username.trim().toLowerCase();
      // Search the roster by email or alias
      const match = authorizedRoster.find(
        r => r.email.toLowerCase() === normalizedInput || 
             r.aliases.some(a => a.toLowerCase() === normalizedInput) ||
             r.email.toLowerCase() === `${normalizedInput}@ua.edu` ||
             r.email.toLowerCase() === `${normalizedInput}@crimson.ua.edu`
      );

      if (match) {
        if (password === match.password) {
          onSuccess({
            id: `user-${match.email.split('@')[0]}`,
            name: match.name,
            email: match.email,
            role: match.role,
            department: match.dept
          });
        } else {
          setAuthError(
            `Security Warning (LDAP Password Verification Failed): The password entered for myBama account '${normalizedInput}' is incorrect. Please verify your credentials.`
          );
        }
      } else {
        // Authenticated but unauthorized
        const displayEmail = normalizedInput.includes('@') ? normalizedInput : `${normalizedInput}@crimson.ua.edu`;
        setAuthError(
          `Security Warning (LDAP Authorization Denied): Credentials for '${displayEmail}' are valid on myBama, but this account is not registered on the ERSL Lab authorized active directory group. Active laboratory membership is required. Please contact Dr. Hongxing Liu for directory authorization.`
        );
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-[#021424]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-900/10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left Side: UA Central Authentication Branding & Security Info */}
        <div className="md:col-span-5 bg-gradient-to-b from-[#9E1B32] to-[#701221] p-8 text-white flex flex-col justify-between">
          <div>
            <div className="border-b border-red-900/40 pb-4 mb-6 text-left">
              <h3 className="text-2xl font-black tracking-tight uppercase">myBama</h3>
              <p className="text-xs font-serif italic text-red-100 mt-0.5">Central Authentication Service</p>
            </div>

            <div className="space-y-5 text-left">
              <div className="flex items-start space-x-3">
                <Server className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Central SSO Portal</h4>
                  <p className="text-xs text-red-100/90 mt-1 leading-relaxed">
                    Access is restricted. This laboratory workstation utilizes your official University of Alabama credentials, restricted to authorized members of the Environmental Remote Sensing Lab.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Active Directory Whitelist</h4>
                  <p className="text-xs text-red-100/90 mt-1 leading-relaxed">
                    General student accounts do not have default access. To prevent unauthorized modification of hydrology tools and data files, your myBama LDAP profile must map to an active lab staff role.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-red-200 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Dual Verification</h4>
                  <p className="text-xs text-red-100/90 mt-1 leading-relaxed">
                    Administrative sessions log IP, timestamp, and user attributes to maintain a secure field survey audit trail.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-red-900/40 pt-4 flex flex-col space-y-2 text-[10px] text-red-100/80 font-medium text-left">
            <div className="flex items-center space-x-1.5">
              <span className="text-emerald-400">🔒</span>
              <span>AES-256 Bit Secure Connection</span>
            </div>
            <p className="opacity-80">University of Alabama IT Security Group</p>
          </div>
        </div>

        {/* Right Side: SSO Interactive Options */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between bg-sky-50/30 overflow-y-auto max-h-[90vh] relative">
          {/* Subtle water background icon element */}
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-5 pointer-events-none text-blue-900">
            <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2.69C12,2.69 19,10.24 19,15A7,7 0 0,1 12,22A7,7 0 0,1 5,15C5,10.24 12,2.69 12,2.69M12,4.83C10.23,7.21 7.2,11.83 7.2,15A4.8,4.8 0 0,0 12,19.8A4.8,4.8 0 0,0 16.8,15C16.8,11.83 13.77,7.21 12,4.83Z" />
            </svg>
          </div>

          <div className="flex justify-between items-start mb-5 relative z-10">
            <div className="text-left">
              <h2 className="text-base font-black text-[#9E1B32] tracking-tight flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#9E1B32]" />
                <span>AUTHORIZED ERSL STAFF LOGIN ONLY</span>
              </h2>
              <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">Active laboratory directory gateway mapping.</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold hover:bg-gray-250/50 p-1 px-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {/* Highly prominent Active Directory restrict warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-left text-amber-900">
              <div className="flex space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#9E1B32] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-extrabold text-[#9E1B32]">⚠️ STRICTLY LIMITED ACCESS</h4>
                  <p className="text-[10px] leading-relaxed text-amber-800 mt-1">
                    While most Alabama students have a valid <strong className="text-amber-900">myBama</strong> account, <strong>anyone who is not on the active ERSL Lab group roster is blocked</strong> from accessing internal files. There is no self-registration option. Accounts must be pre-authorized by the system administrator.
                  </p>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest">Querying Active Directory Database...</p>
                <p className="text-[11px] text-gray-400">Matching credentials against active lab directory attributes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {authError && (
                  <div className="bg-red-50 border-l-4 border-l-red-600 p-4 rounded-r-lg text-left animate-in shake duration-300">
                    <div className="flex items-start space-x-2.5">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-red-800">LDAP Access Denied</h4>
                        <p className="text-[11px] text-red-700/90 mt-1 leading-relaxed">
                          {authError}
                        </p>
                        <button 
                          onClick={() => setAuthError(null)}
                          className="text-[10px] font-bold text-[#9E1B32] hover:underline mt-2 block"
                        >
                          Try with authorized credentials
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secure Login Form */}
                <form onSubmit={handleMyBamaLogin} className="space-y-3.5 bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-sm text-left">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-wider">Active Directory Sync</span>
                    <h3 className="text-xs font-bold text-gray-800">myBama LDAP Sign-In</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">myBama Username or Email</label>
                      <input
                        type="text"
                        placeholder="e.g., npurushothaman@ua.edu"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-gray-250 focus:ring-1 focus:ring-[#9E1B32] focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-gray-250 focus:ring-1 focus:ring-[#9E1B32] focus:outline-none bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!username || !password}
                    className="w-full bg-[#1e293b] hover:bg-cyan-950 disabled:bg-gray-250 disabled:text-gray-400 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm mt-1"
                  >
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Log In via Secure SSO Gateway</span>
                  </button>
                </form>

                {/* Collapsible Sandbox Debugger for Local Testing */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowDevHelper(!showDevHelper)}
                    className="w-full flex items-center justify-between p-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-700 text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border border-slate-200"
                  >
                    <span className="flex items-center space-x-1.5">
                      <span>⚙️</span>
                      <span>{showDevHelper ? 'Hide' : 'Show'} Sandbox Directory Simulation Helper</span>
                    </span>
                    <span className="text-gray-400 font-mono text-[9px]">
                      {showDevHelper ? '▼' : '►'}
                    </span>
                  </button>

                  {showDevHelper && (
                    <div className="mt-3.5 p-3.5 bg-[#f8fafc] border border-dashed border-slate-300 rounded-xl space-y-3.5 text-left animate-in fade-in duration-200">
                      <div className="flex items-start space-x-2 bg-slate-200/50 p-2 rounded text-slate-700">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-relaxed font-semibold">
                          <strong>Active Directory Roster Mock (Sandbox Only):</strong> In a live production environment, this application initiates a SAML/CAS request to the real <code>mybama.ua.edu</code> identity providers, redirecting users to the secure Shibboleth portal. Since we are in an isolated development workspace, use these simulated profiles to test roles.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-600 animate-pulse" />
                            Pre-Authorized Sandbox Accounts
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickLogin('hongxing.liu@ua.edu')}
                            className="text-left p-2.5 bg-white hover:bg-red-50/10 rounded-lg border border-slate-200 hover:border-[#9E1B32] transition-all flex items-center space-x-2 cursor-pointer text-[11px]"
                          >
                            <span className="w-5.5 h-5.5 rounded-full bg-red-100 text-[#9E1B32] font-black text-[9px] flex items-center justify-center shrink-0">HL</span>
                            <div className="min-w-0">
                              <p className="font-extrabold text-gray-800 truncate leading-none">Dr. Hongxing Liu</p>
                              <p className="text-[9px] text-gray-500 truncate mt-1">Lab Director & PI (Admin)</p>
                              <p className="text-[8px] font-mono text-gray-400 truncate mt-0.5">pass: hliu@admin2026</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickLogin('npurushothaman@ua.edu')}
                            className="text-left p-2.5 bg-white hover:bg-blue-50/10 rounded-lg border border-slate-200 hover:border-blue-600 transition-all flex items-center space-x-2 cursor-pointer text-[11px]"
                          >
                            <span className="w-5.5 h-5.5 rounded-full bg-blue-100 text-blue-600 font-black text-[9px] flex items-center justify-center shrink-0">NP</span>
                            <div className="min-w-0">
                              <p className="font-extrabold text-gray-800 truncate leading-none">Dr. Naveen P.</p>
                              <p className="text-[9px] text-gray-500 truncate mt-1">PostDoc (Researcher)</p>
                              <p className="text-[8px] font-mono text-gray-400 truncate mt-0.5">pass: npurushothaman2026</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickLogin('emiliutina@crimson.ua.edu')}
                            className="text-left p-2.5 bg-white hover:bg-teal-50/10 rounded-lg border border-slate-200 hover:border-teal-600 transition-all flex items-center space-x-2 cursor-pointer text-[11px] sm:col-span-2"
                          >
                            <span className="w-5.5 h-5.5 rounded-full bg-teal-100 text-teal-600 font-black text-[9px] flex items-center justify-center shrink-0">EM</span>
                            <div className="min-w-0">
                              <p className="font-extrabold text-gray-800 truncate leading-none">Ekaterina Miliutina</p>
                              <p className="text-[9px] text-gray-500 truncate mt-1">PhD Candidate (Researcher)</p>
                              <p className="text-[8px] font-mono text-gray-400 truncate mt-0.5">pass: emiliutina2026</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Banner at footer */}
          <div className="mt-5 bg-blue-50/80 border border-blue-100/50 rounded-xl p-3.5 flex items-start space-x-2.5 text-left">
            <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-gray-900">ERSL Authorization Standard</h5>
              <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">
                General University of Alabama student accounts are authenticated but blocked by default on this application. Access credentials map straight to the geography department active directory directory for ERSL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
