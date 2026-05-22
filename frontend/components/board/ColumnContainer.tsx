'use client';

import { useState } from 'react';
import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, X, Kanban } from 'lucide-react';
import TaskCard from './TaskCard';
import { Column, Task } from '../../types';

interface ColumnContainerProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (title: string, columnId: string) => Promise<void>;
  typingStatus: Record<string, string[]>;
}

export default function ColumnContainer({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  typingStatus,
}: ColumnContainerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim() === '') return;
    await onAddTask(taskTitle, column._id);
    setTaskTitle('');
    setIsAdding(false);
  };

  const taskIds = tasks.map((t) => t._id);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-72 md:w-80 shrink-0 h-[70vh] bg-[#111827]/10 border border-dashed border-violet-500/10 rounded-2xl"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-72 md:w-80 shrink-0 bg-[#111827]/40 border border-white/5 rounded-2xl flex flex-col h-[75vh] glass relative"
    >
      {/* Drag handle header area */}
      <div
        {...attributes}
        {...listeners}
        className="px-4 py-3.5 border-b border-white/5 flex justify-between items-center bg-[#1F2937]/10 rounded-t-2xl cursor-grab active:cursor-grabbing select-none shrink-0"
      >
        <div className="flex items-center gap-2">
          <Kanban className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-xs tracking-wide text-gray-200 uppercase truncate max-w-[150px]">
            {column.name}
          </span>
          <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-mono font-bold border border-white/5">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-6 h-6 rounded-md hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable list of Tasks */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
              typingUsers={typingStatus[task._id]}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isAdding && (
          <div className="py-12 text-center text-[10px] text-gray-600 font-medium">
            Empty Stage. Drag cards here.
          </div>
        )}

        {/* Quick Add inline Form */}
        {isAdding && (
          <form onSubmit={handleAddTaskSubmit} className="bg-[#1F2937]/20 border border-violet-500/20 p-3 rounded-xl space-y-2">
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-[#111827]/40 border border-white/5 focus:border-violet-500/30 rounded-lg p-2 text-xs text-white placeholder-gray-600 outline-none transition-all"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="submit"
                className="px-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
