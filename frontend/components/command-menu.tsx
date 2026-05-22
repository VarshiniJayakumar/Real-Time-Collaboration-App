'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Layers, Kanban, Plus, ShieldAlert, Moon, Sun, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { workspaces, boards, createBoard, activeWorkspace } = useStore();
  
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Command items definition
  const getFilteredItems = () => {
    const items: Array<{
      id: string;
      title: string;
      subtitle?: string;
      category: string;
      icon: any;
      action: () => void;
    }> = [];

    // Navigation options
    boards.forEach((board) => {
      items.push({
        id: `board-${board._id}`,
        title: `Go to ${board.name}`,
        subtitle: board.description || 'View task columns',
        category: 'Boards',
        icon: Kanban,
        action: () => {
          router.push(`/dashboard/board/${board._id}`);
          onClose();
        },
      });
    });

    // Quick Actions
    if (activeWorkspace) {
      items.push({
        id: 'new-board',
        title: 'Create New Board...',
        subtitle: 'Add a new Kanban board to this workspace',
        category: 'Actions',
        icon: Plus,
        action: () => {
          const name = prompt('Enter board name:');
          if (name) {
            createBoard(name, '', activeWorkspace._id).then((b) => {
              router.push(`/dashboard/board/${b._id}`);
            });
          }
          onClose();
        },
      });
    }

    // Settings / Themes
    items.push({
      id: 'toggle-theme',
      title: 'Toggle Color Theme',
      subtitle: 'Switch between light and dark defaults',
      category: 'Preferences',
      icon: Moon,
      action: () => {
        alert('SyncSpace operates in optimized AMOLED dark mode for performance.');
        onClose();
      },
    });

    return items.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const filtered = getFilteredItems();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop closer */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#1F2937]/20">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search boards..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1F2937] text-gray-400 rounded border border-white/5">ESC</span>
        </div>

        {/* List items */}
        <div className="max-h-[350px] overflow-y-auto p-2 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No matching shortcuts found.
            </div>
          ) : (
            <div>
              {/* Group items by category */}
              {Array.from(new Set(filtered.map((item) => item.category))).map((cat) => (
                <div key={cat} className="mb-2">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                    {cat}
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {filtered
                      .filter((item) => item.category === cat)
                      .map((item, idx) => {
                        const globalIdx = filtered.findIndex((f) => f.id === item.id);
                        const isSelected = globalIdx === selectedIndex;
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.id}
                            onClick={item.action}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-violet-600/20 border-l-2 border-violet-500 text-white'
                                : 'hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-gray-400'}`} />
                              <div>
                                <div className="text-xs font-semibold">{item.title}</div>
                                {item.subtitle && (
                                  <div className="text-[10px] text-gray-500 mt-0.5">{item.subtitle}</div>
                                )}
                              </div>
                            </div>
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 text-violet-400" />}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
