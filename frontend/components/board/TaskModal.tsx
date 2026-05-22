'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Trash, 
  Calendar, 
  Tag, 
  Users, 
  AlertCircle, 
  MessageSquare, 
  Plus, 
  Clock, 
  AlignLeft, 
  CheckSquare, 
  Sparkles 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Task, User } from '../../types';
import { api } from '../../services/api';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { 
    activeBoard, 
    updateTask, 
    deleteTask, 
    addComment, 
    typingStatus, 
    emitTyping 
  } = useStore();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.substring(0, 10) : '');
  const [newComment, setNewComment] = useState('');
  const [newLabel, setNewLabel] = useState('');
  
  const [workspaceMembers, setWorkspaceMembers] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch workspace members to allow assigning users
  useEffect(() => {
    if (activeBoard) {
      api.get<{ members: User[] }>(`/workspaces/${activeBoard.workspace}/members`)
        .then((res) => setWorkspaceMembers(res.members))
        .catch(console.error);
    }
  }, [activeBoard]);

  // Handle auto-saving on blur
  const handleSave = () => {
    if (title.trim() === '') return;
    updateTask(task._id, {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
  };

  // Keyboard shortcut command: ESC to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Handle typing state
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    
    if (activeBoard) {
      if (!isTyping) {
        setIsTyping(true);
        emitTyping(activeBoard._id, task._id, true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        emitTyping(activeBoard._id, task._id, false);
      }, 2000);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;

    if (activeBoard && isTyping) {
      setIsTyping(false);
      emitTyping(activeBoard._id, task._id, false);
    }
    
    await addComment(task._id, newComment);
    setNewComment('');
  };

  const handleAddLabel = () => {
    if (newLabel.trim() === '') return;
    const labels = [...(task.labels || []), newLabel.trim()];
    updateTask(task._id, { labels });
    setNewLabel('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const labels = task.labels.filter((l) => l !== labelToRemove);
    updateTask(task._id, { labels });
  };

  const handleAssigneeToggle = (memberId: string) => {
    const isAssigned = task.assignees.some((a) => a._id === memberId);
    let assigneesIds = task.assignees.map((a) => a._id);

    if (isAssigned) {
      assigneesIds = assigneesIds.filter((id) => id !== memberId);
    } else {
      assigneesIds.push(memberId);
    }

    updateTask(task._id, { assignees: assigneesIds as any });
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task._id);
      onClose();
    }
  };

  const currentTypingUsers = typingStatus[task._id] || [];

  return (
    <div className="fixed inset-0 bg-[#0B0F19]/80 backdrop-blur-md z-40 flex items-center justify-end font-sans">
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Sidebar drawer panel */}
      <div className="relative w-full max-w-2xl h-screen bg-[#111827] border-l border-white/10 shadow-2xl overflow-y-auto no-scrollbar glass flex flex-col justify-between p-6 z-50">
        
        {/* Header toolbar */}
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-violet-400" />
              <span className="text-xs font-mono text-gray-500">TASK DETAILS</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="w-8 h-8 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <Trash className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left side: Main text contents */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Title input */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  className="w-full bg-transparent text-xl font-extrabold text-white outline-none border-b border-transparent focus:border-violet-500/30 pb-1"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleSave}
                  placeholder="Add a detailed description..."
                  className="w-full h-32 bg-[#1F2937]/30 hover:bg-[#1F2937]/50 focus:bg-[#1F2937]/50 border border-white/5 focus:border-violet-500/30 rounded-xl p-4 text-xs text-gray-300 placeholder-gray-600 outline-none resize-none transition-all"
                />
              </div>

              {/* Real-time Comments Thread */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Discussion Thread
                </h3>

                {/* Comment composer */}
                <form onSubmit={handleCommentSubmit} className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={newComment}
                      onChange={handleCommentChange}
                      placeholder="Ask a question or leave feedback..."
                      className="w-full h-20 bg-[#1F2937]/30 hover:bg-[#1F2937]/50 focus:bg-[#1F2937]/50 border border-white/5 focus:border-violet-500/30 rounded-xl p-3 text-xs text-gray-300 outline-none resize-none transition-all placeholder-gray-600"
                    />
                    
                    {currentTypingUsers.length > 0 && (
                      <div className="absolute left-3 bottom-[-1.5rem] text-[9px] text-cyan-400 font-bold flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        {currentTypingUsers.join(', ')} {currentTypingUsers.length === 1 ? 'is' : 'are'} typing...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-violet-500/10 transition-colors cursor-pointer"
                    >
                      Comment
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3 pt-4">
                  {task.comments && task.comments.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-xs font-medium">No comments yet. Start the conversation.</div>
                  ) : (
                    task.comments && [...task.comments].reverse().map((c) => (
                      <div key={c._id} className="bg-[#1F2937]/20 border border-white/5 p-3 rounded-xl flex items-start gap-3">
                        <img
                          src={c.author?.avatarUrl}
                          alt={c.author?.username}
                          className="w-7 h-7 rounded-lg border border-white/10 shrink-0 bg-[#111827]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{c.author?.username}</span>
                            <span className="text-[9px] text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed font-medium">{c.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Sidebar metadata */}
            <div className="space-y-6">
              
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    updateTask(task._id, { priority: e.target.value as any });
                  }}
                  className="w-full bg-[#1F2937]/40 border border-white/5 focus:border-violet-500/30 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none transition-all cursor-pointer font-bold uppercase"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    updateTask(task._id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined });
                  }}
                  className="w-full bg-[#1F2937]/40 border border-white/5 focus:border-violet-500/30 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none transition-all cursor-pointer font-semibold"
                />
              </div>

              {/* Labels tag system */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  Labels
                </label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.labels && task.labels.map((lbl) => (
                    <span
                      key={lbl}
                      onClick={() => handleRemoveLabel(lbl)}
                      className="text-[9px] font-bold text-violet-300 bg-violet-600/10 border border-violet-500/25 px-2 py-0.5 rounded-md cursor-pointer hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25 transition-all"
                    >
                      {lbl} &times;
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                    placeholder="Add label..."
                    className="w-full bg-[#1F2937]/40 border border-white/5 focus:border-violet-500/30 rounded-xl px-3 py-1.5 text-xs text-gray-300 outline-none transition-all placeholder-gray-600"
                  />
                  <button
                    onClick={handleAddLabel}
                    className="w-8 h-8 shrink-0 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/10 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assignees Selector list */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Assign Team
                </label>
                <div className="border border-white/5 bg-[#1F2937]/20 rounded-xl max-h-[160px] overflow-y-auto p-1 divide-y divide-white/5 no-scrollbar">
                  {workspaceMembers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-gray-500">No members in workspace</div>
                  ) : (
                    workspaceMembers.map((member) => {
                      const isAssigned = task.assignees.some((a) => a._id === member._id);
                      return (
                        <div
                          key={member._id}
                          onClick={() => handleAssigneeToggle(member._id)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${isAssigned ? 'bg-violet-600/10' : 'hover:bg-white/5'}`}
                        >
                          <img
                            src={member.avatarUrl}
                            alt={member.username}
                            className="w-6 h-6 rounded-md border border-white/10 bg-[#111827]"
                          />
                          <span className={`text-xs font-semibold ${isAssigned ? 'text-violet-300' : 'text-gray-400'}`}>
                            {member.username}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
