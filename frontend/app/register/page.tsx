'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({ username, email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E5E7EB] relative flex items-center justify-center p-6 overflow-hidden font-sans">
      {/* Decorative background grids and blur */}
      <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] glow-orb-purple pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] glow-orb-cyan pointer-events-none z-0" />
      <div className="absolute inset-0 grid-bg opacity-35 pointer-events-none z-0" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md glass rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-4">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white text-center">Create Sandbox Account</h2>
          <p className="text-gray-400 text-sm mt-1 text-center">Join SyncSpace and start planning</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3.5 flex items-center gap-2 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full bg-[#111827]/40 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#111827]/40 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (6+ characters)"
                className="w-full bg-[#111827]/40 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all cursor-pointer border border-violet-500/20 active:scale-98"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
