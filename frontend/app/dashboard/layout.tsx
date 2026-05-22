'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Layers, 
  ChevronDown, 
  Plus, 
  Menu, 
  X, 
  Search, 
  UserPlus, 
  LogOut, 
  Kanban, 
  LayoutDashboard, 
  ChevronLeft, 
  ChevronRight, 
  User 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import NotificationCenter from '../../components/notification-center';
import CommandMenu from '../../components/command-menu';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
    user, 
    isAuthenticated, 
    workspaces, 
    activeWorkspace, 
    boards, 
    fetchWorkspaces, 
    createWorkspace, 
    setActiveWorkspace, 
    createBoard, 
    logout, 
    inviteToWorkspace 
  } = useStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  // Authenticate checks
  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('token')) {
      router.push('/login');
    } else {
      fetchWorkspaces();
    }
  }, [isAuthenticated, fetchWorkspaces, router]);

  // Bind Keyboard Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMenuOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateWorkspace = async () => {
    const name = prompt('Enter workspace name:');
    if (name) {
      await createWorkspace(name);
      setShowWorkspaceDropdown(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!activeWorkspace) return;
    const name = prompt('Enter board name:');
    if (name) {
      const b = await createBoard(name, 'Sprints and tasks', activeWorkspace._id);
      router.push(`/dashboard/board/${b._id}`);
    }
  };

  const handleInviteUser = async () => {
    if (!activeWorkspace) return;
    const email = prompt('Enter email address of user to invite:');
    if (email) {
      try {
        await inviteToWorkspace(email);
        alert('User invited successfully!');
      } catch (err: any) {
        alert(err.message || 'Invitation failed');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  const sidebarContent = (
    <div className="flex-1 flex flex-col justify-between h-full bg-[#111827]/30 border-r border-white/5 relative z-20">
      <div>
        {/* Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-gray-200">SyncSpace</span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex w-7 h-7 rounded-lg hover:bg-white/5 items-center justify-center text-gray-400 hover:text-white"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace select dropdown */}
        <div className="p-3 relative border-b border-white/5">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className={`w-full bg-white/5 border border-white/5 hover:border-violet-500/20 px-3 py-2.5 rounded-xl text-left text-sm text-white flex items-center justify-between transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                {activeWorkspace?.name.charAt(0) || 'W'}
              </div>
              {!isSidebarCollapsed && (
                <span className="font-semibold text-gray-300 truncate">{activeWorkspace?.name || 'Workspace'}</span>
              )}
            </div>
            {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {showWorkspaceDropdown && (
            <div className="absolute left-3 right-3 mt-2 bg-[#111827] border border-white/10 rounded-xl shadow-2xl glass p-1 z-30">
              <div className="text-[10px] font-bold text-gray-500 px-3 py-1.5 uppercase">Workspaces</div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto no-scrollbar">
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setShowWorkspaceDropdown(false);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between hover:bg-white/5 cursor-pointer ${ws._id === activeWorkspace?._id ? 'text-violet-400 bg-violet-600/5' : 'text-gray-400 hover:text-white'}`}
                  >
                    <span className="truncate">{ws.name}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-white/5 mt-1.5 pt-1.5">
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-2 hover:bg-white/5 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Workspace...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation / Boards lists */}
        <div className="p-3">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === '/dashboard' ? 'bg-violet-600/10 text-violet-400 border border-violet-500/15' : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isSidebarCollapsed && <span>Dashboard Overview</span>}
            </Link>

            <div className="pt-4">
              <div className="flex justify-between items-center px-3 mb-2">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Boards</span>
                )}
                {activeWorkspace && !isSidebarCollapsed && (
                  <button
                    onClick={handleCreateBoard}
                    className="w-5 h-5 rounded hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-0.5 max-h-[300px] overflow-y-auto no-scrollbar">
                {boards.map((b) => {
                  const isActive = pathname === `/dashboard/board/${b._id}`;
                  return (
                    <Link
                      key={b._id}
                      href={`/dashboard/board/${b._id}`}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive ? 'bg-violet-600/10 text-violet-400 border border-violet-500/15' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <Kanban className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && <span className="truncate">{b.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* User profile details bottom */}
      <div className="p-3 border-t border-white/5">
        <div className={`flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user.avatarUrl}
            alt="avatar"
            className="w-8 h-8 rounded-lg shrink-0 border border-white/10"
          />
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.username}</div>
              <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
            </div>
          )}
          {!isSidebarCollapsed && (
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-400 w-6 h-6 flex items-center justify-center hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E5E7EB] flex font-sans">
      {/* Global Command Menu */}
      <CommandMenu isOpen={isCommandMenuOpen} onClose={() => setIsCommandMenuOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-all ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-[#0B0F19] flex flex-col z-50">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main panel content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* Header bar */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between backdrop-blur-md bg-[#0B0F19]/40 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Keyboard-First Search click panel */}
            <div
              onClick={() => setIsCommandMenuOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-white/5 hover:border-violet-500/20 text-gray-500 hover:text-gray-400 text-xs cursor-pointer select-none transition-all w-56 justify-between"
            >
              <span className="flex items-center gap-2 font-medium">
                <Search className="w-3.5 h-3.5" />
                Search boards...
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1F2937] text-gray-500 rounded border border-white/5 shrink-0">Ctrl+K</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeWorkspace && (
              <button
                onClick={handleInviteUser}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/30 text-violet-300 rounded-xl transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite Team
              </button>
            )}

            <NotificationCenter />
          </div>
        </header>

        {/* App content page container */}
        <main className="flex-1 p-6 relative max-w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
