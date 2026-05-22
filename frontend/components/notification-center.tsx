'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Trash, UserPlus, MessageSquare, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function NotificationCenter() {
  const router = useRouter();
  const { notifications, fetchNotifications, markNotificationRead, isAuthenticated } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll notifications every 30 seconds as fallback to socket
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, isAuthenticated]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    await markNotificationRead('all');
  };

  const handleNotificationClick = async (n: any) => {
    await markNotificationRead(n._id);
    setIsOpen(false);
    if (n.board) {
      router.push(`/dashboard/board/${n.board}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'comment_mention':
        return <MessageSquare className="w-4 h-4 text-violet-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-600 border-2 border-[#0B0F19] text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass z-40">
          <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-[#1F2937]/20">
            <span className="text-xs font-bold text-white">Notifications ({unreadCount})</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto p-1 divide-y divide-white/5 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 p-3 cursor-pointer rounded-xl transition-all ${
                    n.isRead ? 'opacity-60 hover:bg-white/5' : 'bg-violet-600/5 hover:bg-violet-600/10 border-l-2 border-violet-500'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-300 font-medium leading-relaxed">
                      <span className="font-bold text-white">{n.sender?.username}</span> {n.message}
                    </div>
                    <div className="text-[9px] text-gray-500 mt-1 font-medium">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
