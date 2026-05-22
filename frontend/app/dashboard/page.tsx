'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Kanban, 
  Plus, 
  Layers, 
  LayoutGrid, 
  Calendar, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight 
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeWorkspace, boards, createBoard } = useStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBoard = async () => {
    if (!activeWorkspace) return;
    const name = prompt('Enter board name:');
    if (name) {
      setIsCreating(true);
      try {
        const board = await createBoard(name, 'Roadmap & Sprints', activeWorkspace._id);
        router.push(`/dashboard/board/${board._id}`);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCreating(false);
      }
    }
  };

  // Dynamic welcome message
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (!activeWorkspace) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Active Workspaces Found</h2>
        <p className="text-gray-400 text-sm max-w-sm mb-6">Create a workspace to start organizing your teams, planning boards, and tracking issues.</p>
        <button
          onClick={() => {
            const name = prompt('Enter workspace name:');
            if (name) useStore.getState().createWorkspace(name);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create First Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-950/20 to-cyan-950/10 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden glass">
        <div className="absolute top-0 right-0 w-32 h-32 glow-orb-purple opacity-30 z-0" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-500/10 border border-violet-500/25 rounded-full text-[10px] font-bold text-violet-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Personalized Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {getGreeting()}, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{user?.username}</span> 👋
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium">Welcome to <span className="text-gray-200 font-bold">{activeWorkspace.name}</span>. Select a board or create a new planning track below.</p>
        </div>

        <button
          onClick={handleCreateBoard}
          disabled={isCreating}
          className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Planning Board
        </button>
      </div>

      {/* Grid listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            Active Boards ({boards.length})
          </h2>
        </div>

        {boards.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 mb-4">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-1">No Boards in Workspace</h3>
            <p className="text-xs text-gray-500 max-w-xs mb-6">Organize tasks and track deadlines by adding a Kanban board to your new workspace.</p>
            <button
              onClick={handleCreateBoard}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg shadow-violet-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Build First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boards.map((b) => (
              <div
                key={b._id}
                onClick={() => router.push(`/dashboard/board/${b._id}`)}
                className="glass-card rounded-2xl p-6 border border-white/5 hover:border-violet-500/20 transition-all cursor-pointer group flex flex-col justify-between h-44 relative overflow-hidden"
              >
                <div className="absolute top-[-20%] right-[-20%] w-24 h-24 glow-orb-purple opacity-10 pointer-events-none group-hover:scale-125 transition-all" />
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-2">
                    <Kanban className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-violet-400 transition-colors truncate">{b.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{b.description || 'Sprint planner, columns lists, card actions, comments'}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 text-violet-400 font-bold group-hover:translate-x-1 transition-transform">
                    Open Board
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
