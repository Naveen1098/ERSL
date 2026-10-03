import React, { useState } from 'react';
import { 
  Users, ShieldAlert, FileText, Settings, Server, RefreshCw, CheckCircle2, 
  Terminal, Shield, Database, HelpCircle, HardDrive, Key, LogOut, ArrowRight, UserCheck, Cloud,
  Trash2, UserPlus
} from 'lucide-react';
import { User, Role, AuditLog } from '../types';

interface AdminDashboardProps {
  currentUser: User | null;
  users: User[];
  onRoleChange: (userId: string, newRole: Role) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  auditLogs: AuditLog[];
  onClearLogs: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  onRoleChange,
  onAddUser,
  onDeleteUser,
  auditLogs,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sso' | 'box' | 'logs' | 'deploy'>('users');
  const [ssoClientUrl, setSsoClientUrl] = useState('https://auth.ua.edu/idp/shibboleth');
  const [boxFolderId, setBoxFolderId] = useState('ersl-shared-2025-prod');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'Synced' | 'Stale' | 'Loading'>('Synced');

  // New states for User Authorization Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Researcher');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    
    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      department: 'Department of Geography'
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Researcher');
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const triggerSync = () => {
    setSyncLoading(true);
    setSyncStatus('Loading');
    setTimeout(() => {
      setSyncLoading(false);
      setSyncStatus('Synced');
      alert('Enterprise Sync Complete!\n- Synced 12 publications with Google Scholar\n- Refreshed 9 equipment categories\n- Updated Active Directory database mappings');
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden select-none">
      {/* Dashboard Brand Header */}
      <div className="bg-[#9E1B32] text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-white text-[#9E1B32] font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">ADMIN PORTAL</span>
              <h2 className="text-xl font-bold">ERSL Administrative Settings & Control Panel</h2>
            </div>
            <p className="text-xs text-red-100 mt-1">
              Configure single sign-on attributes, role permissions, active database synchronization, and university server deployment variables.
            </p>
          </div>

          <button
            onClick={triggerSync}
            disabled={syncLoading}
            className="flex items-center space-x-2 bg-white hover:bg-red-50 text-[#9E1B32] text-xs font-bold py-2 px-4 rounded-lg shadow-md transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>Sync Active Directory LDAP</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Drawer tabs */}
        <div className="lg:col-span-3 bg-slate-50 border-r border-gray-100 p-4 space-y-1.5">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-3 mb-2">Configurations</p>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-[#9E1B32] text-white shadow-sm shadow-red-100' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User & Role Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('sso')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'sso' ? 'bg-[#9E1B32] text-white shadow-sm shadow-red-100' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Shibboleth SSO Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('box')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'box' ? 'bg-[#9E1B32] text-white shadow-sm shadow-red-100' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Box Enterprise Link</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#9E1B32] text-white shadow-sm shadow-red-100' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>System Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'deploy' ? 'bg-[#9E1B32] text-white shadow-sm shadow-red-100' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>University Deploy Guide</span>
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-9 p-6 overflow-y-auto max-h-[600px]">
          
          {/* Tab 1: Users and Role Permissions */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Form to Authorize a New User */}
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-4.5 text-left space-y-3">
                <h4 className="text-xs font-bold text-gray-800 flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4 text-[#9E1B32]" />
                  <span>Authorize New Lab Member / Collaborator</span>
                </h4>
                <p className="text-[10px] text-gray-500 leading-none">
                  Instantly authorize new personnel or external collaborators (e.g., Naveen, Dan) by signing them into the active ERSL directory.
                </p>

                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Dan Tian"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full text-xs p-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">University Email</label>
                    <input
                      type="email"
                      placeholder="e.g., dtian1@ua.edu"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full text-xs p-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Access Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as Role)}
                      className="w-full text-xs p-2 bg-white rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32] font-semibold text-gray-700"
                    >
                      <option value="Admin">Administrator (Full Access)</option>
                      <option value="Researcher">Researcher (Edit Content)</option>
                      <option value="Viewer">Viewer (Read-Only Public)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#9E1B32] hover:bg-red-800 text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Authorize Access</span>
                  </button>
                </form>

                {submitSuccess && (
                  <p className="text-[10px] text-emerald-600 font-bold animate-in fade-in">
                    ✔️ Directory updated! Access credentials registered in Shibboleth LDAP scopes.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-[#9E1B32]" />
                  Active User Directory Attributes
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Change roles to test how permissions lock down/unblock editing features instantly. This emulates an Active Directory Sync.
                </p>
              </div>

              <div className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase font-extrabold tracking-wider">
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">University Email</th>
                      <th className="py-2.5 px-4">Access Permission Role</th>
                      <th className="py-2.5 px-4">Mapped Mappings</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="text-xs text-gray-700 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-800">{user.name}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-500">{user.email}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => onRoleChange(user.id, e.target.value as Role)}
                            className="bg-white border border-gray-200 rounded px-2.5 py-1 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#9E1B32]"
                          >
                            <option value="Admin">Administrator (Full Access)</option>
                            <option value="Researcher">Researcher (Edit Content)</option>
                            <option value="Viewer">Viewer (Read-Only Public)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-gray-100 text-gray-600 font-mono text-[9px] px-2 py-0.5 rounded border border-gray-200">
                            OU=Geography,OU=Users
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {user.email !== 'hongxing.liu@ua.edu' ? (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                              title="Revoke Authorization"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[9px] text-gray-400 italic">Owner</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Shibboleth SSO Configurations */}
          {activeTab === 'sso' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Key className="w-4 h-4 mr-1.5 text-[#9E1B32]" />
                  Shibboleth SAML 2.0 / OpenID Connect Parameters
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Connect the ERSL dynamic application to the University of Alabama Single Sign-On IdP (Identity Provider).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">UA IdP Metadata URL</label>
                  <input
                    type="text"
                    value={ssoClientUrl}
                    onChange={(e) => setSsoClientUrl(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:border-[#9E1B32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Entity ID Audience URI</label>
                  <input
                    type="text"
                    value="https://ersl.ua.edu/sp/shibboleth"
                    readOnly
                    className="w-full text-xs p-2.5 bg-gray-100 text-gray-500 rounded border border-gray-200"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-2.5">
                <h4 className="font-bold text-gray-800 flex items-center space-x-1">
                  <Terminal className="w-4 h-4 text-[#9E1B32]" />
                  <span>How to Register in UA OIT Portal:</span>
                </h4>
                <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-[11px]">
                  <li>Log in to the **UA Office of Information Technology (OIT)** Integration registry.</li>
                  <li>Register a new Service Provider (SP) using the Entity ID <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-red-600">https://ersl.ua.edu/sp/shibboleth</code>.</li>
                  <li>Set Assertion Consumer Service (ACS) Redirect endpoint to <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-red-600">https://ersl.ua.edu/api/auth/sso/callback</code>.</li>
                  <li>Map LDAP Directory Attributes:
                    <ul className="list-disc pl-4 mt-1 font-mono text-[10px] text-[#9E1B32] space-y-0.5">
                      <li>givenName → user.name</li>
                      <li>mail → user.email</li>
                      <li>eduPersonEntitlement (e.g. "urn:mace:ua.edu:ersl:admin") → user.role</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab 3: Box Cloud Space Syncing */}
          {activeTab === 'box' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Cloud className="w-4 h-4 mr-1.5 text-blue-600" />
                  Box Enterprise API Key & Folder Linkage
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Integrate your Box folders securely using Enterprise JWT Auth or Developer Developer Tokens.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Target Box Folder ID</label>
                  <input
                    type="text"
                    value={boxFolderId}
                    onChange={(e) => setBoxFolderId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Box Client ID</label>
                  <input
                    type="text"
                    value="cli_ersl_box_prod_2530_10"
                    readOnly
                    className="w-full text-xs p-2.5 bg-gray-100 text-gray-500 rounded border border-gray-200"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-xs text-gray-600 space-y-2.5">
                <h4 className="font-bold text-gray-800 flex items-center space-x-1">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  <span>Administrative Permission Guidelines (Box):</span>
                </h4>
                <p className="text-[11px] leading-relaxed">
                  To allow team members to view and upload, the Box App must be authorized by the **UA Box Administrator**.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Navigate to the **Box Developer Console** and click **Submit for Authorization**.</li>
                  <li>Send the client ID to **central-it@ua.edu** to unlock enterprise scope permissions.</li>
                  <li>The app uses secure Service Account tokens to read/write files to avoid prompting users for secondary Box logins.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 4: System Audit Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <Database className="w-4 h-4 mr-1.5 text-orange-600" />
                    Security & Transaction Logs
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Trace all file updates, publication additions, and role modifications in real-time.
                  </p>
                </div>
                <button
                  onClick={onClearLogs}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 py-1.5 px-3 rounded hover:bg-gray-100 transition-colors"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-slate-900 rounded-lg p-4 font-mono text-[11px] text-gray-300 space-y-2 max-h-[300px] overflow-y-auto border border-slate-800">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">[Terminal Audit Log Clear - Ready for updates]</p>
                ) : (
                  auditLogs.map((log) => (
                    <p key={log.id} className="leading-relaxed">
                      <span className="text-green-400">[{log.timestamp}]</span>{' '}
                      <span className="text-red-400 font-bold">{log.userName}</span>{' '}
                      <span className="text-blue-400">({log.action})</span>{' '}
                      <span className="text-gray-400">&rarr;</span>{' '}
                      <span className="text-white">{log.target}</span>
                    </p>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 5: University Manual Server Deployment Guide */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Server className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Manual Deployment Guide on a University Linux Server
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Step-by-step instructions for academic researchers with limited IT skills to publish this site securely.
                </p>
              </div>

              <div className="space-y-4 text-xs text-gray-600">
                
                {/* Method A */}
                <div className="border border-gray-200 rounded-lg p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-gray-800 flex items-center justify-between">
                    <span>Option 1: Deploying as a Static Web Page (Apache/Nginx)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">RECOMMENDED</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed">
                    Most university departments provide professors and laboratories with a static directory (e.g. <code className="bg-gray-100 text-red-600 px-1 rounded">public_html</code> folders) running on Apache. Since our app compiles to raw HTML and JS, you can host it with ZERO background servers!
                  </p>
                  <ol className="list-decimal pl-4 text-[11px] space-y-1 text-gray-600">
                    <li>Run <code className="bg-gray-100 text-gray-800 px-1 rounded font-mono">npm run build</code> in your workspace root directory. This creates a <code className="font-bold text-gray-800">dist/</code> folder.</li>
                    <li>Upload all files inside <code className="bg-gray-100 px-1 rounded font-mono">dist/*</code> to your university account directory via WinSCP or FileZilla.</li>
                    <li>Ensure permissions are set to public readable (<code className="bg-gray-100 text-gray-800 px-1 rounded font-mono">chmod 755 -R public_html</code>).</li>
                  </ol>
                </div>

                {/* Method B */}
                <div className="border border-gray-200 rounded-lg p-4 bg-slate-50 space-y-2">
                  <h4 className="font-bold text-gray-800">Option 2: Deploying as a Full Node.js Service (PM2 / Systemd)</h4>
                  <p className="text-[11px] leading-relaxed">
                    If you require a custom login middleware session proxy:
                  </p>
                  <ol className="list-decimal pl-4 text-[11px] space-y-1 text-gray-600">
                    <li>Log into your server via SSH: <code className="bg-gray-100 px-1 rounded font-mono text-gray-800">ssh myname@server.ua.edu</code>.</li>
                    <li>Install Node.js (v18+) and clone the project directory.</li>
                    <li>Install production dependencies: <code className="bg-gray-100 px-1 rounded font-mono text-gray-800">npm install --omit=dev</code>.</li>
                    <li>Run using a process manager: <code className="bg-gray-100 px-1 rounded font-mono text-gray-800">pm2 start server.js --name "ersl-portal"</code>.</li>
                  </ol>
                </div>

                <div className="flex justify-end pt-2">
                  <span className="text-[10px] font-bold text-gray-400">UA Office of Information Technology Co-Sign, 2026</span>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
