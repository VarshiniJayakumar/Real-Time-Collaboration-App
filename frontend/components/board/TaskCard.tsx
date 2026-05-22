'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  typingUsers?: string[];
}

export default function TaskCard({ task, onClick, typingUsers = [] }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'high':
        return 'text-red-400 bg-red-950/20 border-red-800/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-950/20 border-yellow-800/20';
      default:
        return 'text-green-400 bg-green-950/20 border-green-800/20';
    }
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-[#111827]/20 border border-dashed border-violet-500/20 h-32 rounded-xl"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[#1F2937]/40 hover:bg-[#1F2937]/60 border border-white/5 hover:border-violet-500/20 rounded-xl p-4 transition-all duration-200 cursor-grab active:cursor-grabbing group shadow-md shadow-black/10 select-none relative overflow-hidden"
    >
      {/* Dynamic border highlighting on hover */}
      <div className="absolute top-0 left-0 w-1 h-full bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-3">
        {/* Priority & typing indicator */}
        <div className="flex justify-between items-center">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>
          
          {typingUsers.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] text-cyan-400 font-bold bg-cyan-950/30 border border-cyan-800/20 px-1.5 py-0.5 rounded-md animate-pulse">
              <Sparkles className="w-3 h-3" />
              Typing...
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors leading-relaxed line-clamp-2">
          {task.title}
        </h4>

        {/* Labels list */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((lbl) => (
              <span
                key={lbl}
                className="text-[9px] font-semibold text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md"
              >
                {lbl}
              </span>
            ))}
          </div>
        )}

        {/* Metadata section (Comments, Dates, Assignees) */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] text-gray-500 font-medium">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <span className="flex items-center gap-1 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}

            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}
          </div>

          {/* User avatars */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {task.assignees.map((user) => (
                <img
                  key={user._id}
                  src={user.avatarUrl}
                  alt={user.username}
                  title={user.username}
                  className="w-5 h-5 rounded-full border border-[#111827] bg-[#111827] shrink-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
