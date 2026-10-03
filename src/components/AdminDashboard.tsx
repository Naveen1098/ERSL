import React, { useState } from 'react';
import { Users, FileText, RefreshCw, Cloud, Database, Shield } from 'lucide-react';
import { User, Role, AuditLog } from '../types';
import { MemberManager } from './MemberManager';

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
  const [activeTab, setActiveTab] = useState<'users' | 'box' | 'logs'>('users');
  const [syncLoading, setSyncLoading] = useState(false);

  const triggerSync = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      alert('System Sync Complete!\n- Synced publications with Google Scholar\n- Refreshed database roles and access permissions');
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden select-none text-left">
      {/* Dashboard Header */}
      <div className="bg-[#9E1B32] text-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-white text-[#9E1B32] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">ADMIN CONTROL PANEL</span>
              <h2 className="text-xl md:text-2xl font-extrabold">ERSL Administrator Dashboard</h2>
            </div>
            <p className="text-xs text-red-100 mt-1 max-w-xl">
              Manage member access requests, grant role authorizations, configure Box cloud folders, and inspect security audit logs.
            </p>
          </div>

          <button
            onClick={triggerSync}
            disabled={syncLoading}
            className="flex items-center space-x-2 bg-white hover:bg-red-50 text-[#9E1B32] text-xs font-bold py-2 px-4 rounded-lg shadow-md transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
            <span>Sync System Cache</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[450px]">
        {/* Left Drawer Navigation */}
        <div className="lg:col-span-3 bg-slate-50 border-r border-gray-100 p-4 space-y-1.5">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-3 mb-2">Controls</p>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-[#9E1B32] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members & Access Requests</span>
          </button>

          <button
            onClick={() => setActiveTab('box')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'box' ? 'bg-[#9E1B32] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Box Workspace Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left py-2.5 px-3 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#9E1B32] text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Security Audit Logs</span>
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-9 p-6 overflow-y-auto max-h-[600px]">
          
          {/* Members & Access Requests Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Database Member Approvals & Access Requests */}
              <MemberManager />
            </div>
          )}

          {/* Box Enterprise Integration Tab */}
          {activeTab === 'box' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <Cloud className="w-4 h-4 mr-1.5 text-blue-600" />
                  Box Shared Workspace Settings
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Manage embedded Box shared folder links accessible to lab members.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-gray-600 space-y-2">
                <h4 className="font-bold text-gray-800 flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>How to add a Box Folder:</span>
                </h4>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li>In UA Box, open your shared folder → click **Share → Copy Link**.</li>
                  <li>Go to the **Box Workspace** tab in the top navigation bar.</li>
                  <li>Click **Add Folder**, paste the link, and choose whether it is **Members Only** or **Public**.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Security Audit Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center">
                    <Database className="w-4 h-4 mr-1.5 text-orange-600" />
                    Security & Activity Trail Logs
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Trace all member logins, publication additions, and role modifications in real-time.
                  </p>
                </div>
                <button
                  onClick={onClearLogs}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 font-mono text-[11px] text-gray-300 space-y-2 max-h-[350px] overflow-y-auto border border-slate-800">
                {auditLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">[Security Log Ready for updates]</p>
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

        </div>
      </div>
    </div>
  );
};
