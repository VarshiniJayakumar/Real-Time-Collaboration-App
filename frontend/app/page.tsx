'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Zap, 
  Sparkles, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Laptop, 
  Search, 
  Lock 
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, login, checkAuth } = useStore();
  const [isLoggingInDemo, setIsLoggingInDemo] = useState(false);

  // Recruiter quick login handler
  const handleRecruiterDemoLogin = async () => {
    setIsLoggingInDemo(true);
    try {
      // Direct mock recruiter logins. If not exist, register the user
      // We will sign in with standard demo credentials
      const demoEmail = `recruiter.${Math.floor(Math.random() * 10000)}@syncspace.com`;
      const demoUsername = `Recruiter_${Math.floor(Math.random() * 1000)}`;
      
      try {
        // Try registering a fresh sandbox recruiter account
        await useStore.getState().register({
          username: demoUsername,
          email: demoEmail,
          password: 'supersecretpassword123',
        });
      } catch (e) {
        // Fallback to login if already exists (should not happen for randomized emails)
        await login({
          email: 'demo@syncspace.com',
          password: 'password123',
        });
      }
      
      // Auto-create sample workspace & boards for this user to make it look active!
      const store = useStore.getState();
      const workspace = await store.createWorkspace('Nova Workspace', 'A premium sandbox environment.');
      const board = await store.createBoard('Sprint Planning 🚀', 'Product roadmap and task boards.', workspace._id);
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Demo login failed', error);
      // Fallback redirect
      router.push('/login');
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E5E7EB] relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] glow-orb-purple pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] glow-orb-cyan pointer-events-none z-0" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-[#0B0F19]/40 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">SyncSpace</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Live Preview</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hidden sm:inline-flex text-sm font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl transition-all">
              Create Account
            </Link>
            <button 
              onClick={handleRecruiterDemoLogin}
              disabled={isLoggingInDemo}
              className="relative group inline-flex items-center justify-center text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer overflow-hidden border border-violet-500/30"
            >
              {isLoggingInDemo ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Syncing Sandbox...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                  Recruiter Demo
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-950/20 text-violet-300 text-xs font-semibold mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          MERN Full-Stack Sandbox Built for Recruiters
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8"
        >
          Where Teams Flow in <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            Real-Time Harmony
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-medium mb-12 leading-relaxed"
        >
          A premium collaboration platform combining drag-and-drop task boards, instant Socket.io state synchronization, command actions, and rich activities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <button
            onClick={handleRecruiterDemoLogin}
            disabled={isLoggingInDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 text-white px-8 py-4 rounded-2xl shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all border border-violet-400/20 active:scale-98 cursor-pointer"
          >
            {isLoggingInDemo ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up sandbox...
              </span>
            ) : (
              <>
                Launch Sandbox Workspace
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl backdrop-blur-md transition-all active:scale-98"
          >
            Create Sandbox Account
          </Link>
        </motion.div>
      </section>

      {/* Interactive Mock Board Preview Section */}
      <section id="preview" className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl relative"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs text-gray-500 font-mono ml-2">localhost:3000/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
              Realtime Client connected
            </div>
          </div>

          {/* Kanban mock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="bg-[#111827]/60 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm text-gray-300">Backlog 📂</span>
                <span className="text-xs bg-[#1F2937] text-gray-400 px-2 py-0.5 rounded-full font-mono">2</span>
              </div>
              <div className="space-y-4">
                <div className="bg-[#1F2937]/80 rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-all cursor-grab">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/20">Feature</span>
                    <span className="text-xs text-red-400 font-semibold bg-red-950/20 px-2 py-0.5 rounded-full">High</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Redux / Zustand State Setup</h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">Establish reactive client slices mapping state mutations.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">May 25</span>
                    <div className="w-6 h-6 rounded-full bg-violet-600 text-[10px] font-bold flex items-center justify-center">R</div>
                  </div>
                </div>
                <div className="bg-[#1F2937]/80 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-800/20">Task</span>
                    <span className="text-xs text-gray-400 font-semibold bg-gray-800 px-2 py-0.5 rounded-full">Low</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Command Menu Hotkeys</h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">Create customizable global keyboard listener logic.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">May 30</span>
                    <div className="w-6 h-6 rounded-full bg-cyan-600 text-[10px] font-bold flex items-center justify-center">D</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="bg-[#111827]/60 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm text-gray-300">In Progress 🚀</span>
                <span className="text-xs bg-[#1F2937] text-gray-400 px-2 py-0.5 rounded-full font-mono">1</span>
              </div>
              <div className="space-y-4">
                <motion.div 
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-[#1F2937]/80 rounded-xl p-4 border border-violet-500/30 shadow-lg shadow-violet-500/5 cursor-grab"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-violet-400 px-2 py-0.5 rounded-full bg-violet-950/40 border border-violet-800/20">Design</span>
                    <span className="text-xs text-yellow-400 font-semibold bg-yellow-950/20 px-2 py-0.5 rounded-full">Medium</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">Linear SaaS Dashboard UI</h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">Build glassmorphic sidebar layout and responsive panels.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">May 24</span>
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-violet-600 text-[10px] font-bold flex items-center justify-center border border-[#1F2937]">R</div>
                      <div className="w-6 h-6 rounded-full bg-cyan-600 text-[10px] font-bold flex items-center justify-center border border-[#1F2937]">D</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Column 3 */}
            <div className="bg-[#111827]/60 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm text-gray-300">Completed ✅</span>
                <span className="text-xs bg-[#1F2937] text-gray-400 px-2 py-0.5 rounded-full font-mono">1</span>
              </div>
              <div className="space-y-4">
                <div className="bg-[#1F2937]/80 rounded-xl p-4 border border-white/5 opacity-70">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-green-400 px-2 py-0.5 rounded-full bg-green-950/40 border border-green-800/20">Setup</span>
                    <span className="text-xs text-green-400 font-semibold bg-green-950/20 px-2 py-0.5 rounded-full">Low</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-200 mb-2 line-through">MongoDB Database Models</h4>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">Implement Mongoose configuration schemas.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 font-medium">Completed</span>
                    <div className="w-6 h-6 rounded-full bg-[#111827] text-[10px] border border-white/10 font-bold flex items-center justify-center text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Packed with Advanced SaaS Features</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">Everything a professional collaborative app requires, designed for flawless UX.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Real-Time Syncing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Leverages customized Web Socket events mapping updates, comment typing indicators, and immediate notification updates.</p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Optimistic UI Updating</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Task movements reflect locally instantly, pushing updates asynchronously to the backend with automatic state rollbacks on network failures.</p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Command Menu (Ctrl+K)</h3>
            <p className="text-gray-400 text-sm leading-relaxed">A modern keyboard search console, enabling workspace changes, quick card additions, setting navigation, and filtering.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-200">SyncSpace</span>
          </div>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SyncSpace. Designed with absolute precision.</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">Privacy</a>
            <a href="#" className="hover:text-gray-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
