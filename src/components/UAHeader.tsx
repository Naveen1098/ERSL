import React, { useState } from 'react';
import { User, LogIn, LogOut, Shield, FolderGit2, Menu, X, ChevronDown, UserCircle } from 'lucide-react';

interface UAHeaderProps {
  currentUser: { name: string; email: string; role: string; avatarUrl?: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onAdminClick: () => void;
}

const getCleanInitials = (name: string): string => {
  const parts = name.split(' ').filter(p => {
    const lower = p.toLowerCase().replace(/\./g, '');
    return !['dr', 'prof', 'professor', 'phd', 'candidate', 'postdoc', 'researcher'].includes(lower);
  });
  if (parts.length === 0) return 'UA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UAHeader: React.FC<UAHeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogout,
  currentTab,
  onTabChange,
  onAdminClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [logoFailed, setLogoFailed] = useState(false);

  // Navigation tabs list
  const tabs = [
    { id: 'people', label: 'People' },
    { id: 'research', label: 'Research Areas' },
    { id: 'publications', label: 'Publications' },
    { id: 'professional', label: 'Professional Development' },
    ...(currentUser ? [{ id: 'teaching', label: 'Teaching Materials' }] : []),
    { id: 'field', label: 'Field Photos' },
    ...(currentUser ? [{ id: 'bulletins', label: 'Lab Bulletins' }, { id: 'workplan', label: 'Work Plan' }] : []),
  ];

  return (
    <header className="w-full select-none z-50">
      {/* University of Alabama Brand Bar */}
      <section className="bg-[#222222] text-[#e0e0e0] py-2 px-4 md:px-8 text-xs border-b border-[#333333]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <a 
              href="https://www.ua.edu/" 
              target="_blank" 
              rel="noreferrer" 
              className="uppercase tracking-widest font-semibold hover:text-white transition-colors"
            >
              The University of Alabama
            </a>
            <a 
              href="https://catalog.ua.edu/undergraduate/arts-sciences/" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs font-serif italic text-gray-400 hover:text-white transition-colors"
            >
              Barefield College of Arts & Sciences
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="https://catalog.ua.edu/undergraduate/arts-sciences/geography-and-the-environment/" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center hover:text-white transition-colors"
            >
              <span className="mr-1">🌍</span> Department of Geography and the Environment
            </a>
            <a 
              href="https://mybama.ua.edu/" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center hover:text-white transition-colors font-medium"
            >
              <UserCircle className="w-3.5 h-3.5 mr-1 text-[#9E1B32]" /> myBama Portal
            </a>
          </div>
        </div>
      </section>

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 bg-opacity-95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          {/* Logo / Brand Name */}
          <button 
            onClick={() => onTabChange('home')} 
            className="flex items-center space-x-3 text-left focus:outline-none cursor-pointer group py-1"
          >
            {/* Lab logo slot with prominent high-visibility container */}
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white border border-red-100 shadow-md p-2 flex items-center justify-center shrink-0 ring-2 ring-[#9E1B32]/15 group-hover:ring-[#9E1B32]/40 group-hover:scale-105 transition-all">
              {logoFailed ? (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#9E1B32] to-[#7A1527] text-white flex flex-col items-center justify-center text-[10px] font-black tracking-tighter leading-tight shadow-sm">
                  <span>ERSL</span>
                  <span className="text-[7px] text-red-200 font-bold uppercase tracking-widest">UA</span>
                </div>
              ) : (
                <img
                  src={`${import.meta.env.BASE_URL}images/logo/logo.png`}
                  onError={() => setLogoFailed(true)}
                  alt="ERSL Lab Logo"
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className={`font-extrabold text-xl md:text-2xl tracking-tight transition-colors group-hover:text-red-800 ${currentTab === 'home' ? 'text-[#9E1B32]' : 'text-[#9E1B32]/95'}`}>
                Environmental Remote Sensing Laboratory
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block">
                The University of Alabama • ERSL
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                  currentTab === tab.id
                    ? 'text-[#9E1B32] border-b-2 border-[#9E1B32] rounded-b-none bg-red-50/30'
                    : 'text-gray-700 hover:text-[#9E1B32] hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Authenticated Cloud Box Workspace Link */}
            {currentUser && (
              <button
                onClick={() => onTabChange('box')}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
                  currentTab === 'box'
                    ? 'text-blue-600 border-b-2 border-blue-600 rounded-b-none bg-blue-50/30'
                    : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50/50'
                }`}
              >
                <FolderGit2 className="w-4 h-4 text-blue-500" />
                <span>Box Workspace</span>
              </button>
            )}
          </div>

          {/* User Auth Buttons / Profile Panel */}
          <div className="hidden lg:flex items-center space-x-4 border-l pl-4 border-gray-100">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none py-1.5 px-3 rounded-full hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {getCleanInitials(currentUser.name)}
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-xs font-bold text-gray-800">{currentUser.name}</p>
                    <p className="text-[10px] font-medium text-gray-400 capitalize">{currentUser.role.toLowerCase()}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#9E1B32] border border-red-100">
                        🛡️ {currentUser.role} Account
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onTabChange('box');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50/50 hover:text-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <FolderGit2 className="w-4 h-4 text-blue-500" />
                      <span>Box Cloud Workspace</span>
                    </button>

                    {currentUser.role === 'Admin' && (
                      <button
                        onClick={() => {
                          onAdminClick();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50/50 hover:text-[#9E1B32] transition-colors flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4 text-[#9E1B32]" />
                        <span>Admin Settings Dashboard</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        onLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50/30 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-2 bg-[#9E1B32] hover:bg-red-800 text-white text-sm font-bold py-2 px-4 rounded-md transition-all shadow-sm shadow-red-100 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Member Login</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex lg:hidden items-center space-x-4">
            {currentUser && (
              <div className="w-8 h-8 rounded-full bg-[#9E1B32] text-white flex items-center justify-center font-bold text-xs">
                {getCleanInitials(currentUser.name)}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 p-1 hover:text-[#9E1B32] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white py-4 px-6 space-y-2 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3 text-sm font-semibold rounded-md flex items-center ${
                  currentTab === tab.id
                    ? 'text-[#9E1B32] bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {currentUser && (
              <button
                onClick={() => {
                  onTabChange('box');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2.5 px-3 text-sm font-semibold rounded-md flex items-center space-x-2 ${
                  currentTab === 'box'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-blue-500 hover:bg-blue-50/50'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Box Collaborative space</span>
              </button>
            )}

            <div className="border-t border-gray-100 my-3"></div>

            {currentUser ? (
              <div className="space-y-1">
                <div className="px-3 py-1.5">
                  <p className="text-xs font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                  <p className="text-[10px] font-bold text-[#9E1B32] uppercase mt-1">Role: {currentUser.role}</p>
                </div>

                {currentUser.role === 'Admin' && (
                  <button
                    onClick={() => {
                      onAdminClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4 text-[#9E1B32]" />
                    <span>Admin Settings Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 px-3 text-sm font-semibold text-red-600 rounded-md hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#9E1B32] hover:bg-red-800 text-white text-center font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Member Login</span>
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};
