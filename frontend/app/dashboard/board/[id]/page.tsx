'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  ArrowLeft, 
  Calendar, 
  Search, 
  Sparkles, 
  Layers, 
  Filter, 
  Activity as ActivityIcon, 
  Users, 
  HelpCircle,
  X 
} from 'lucide-react';
import { useStore } from '../../../store/useStore';
import BoardArea from '../../../components/board/BoardArea';
import TaskModal from '../../../components/board/TaskModal';
import { Task, Board } from '../../../types';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const {
    activeBoard,
    fetchBoardDetails,
    createTask,
    typingStatus,
    activities,
    fetchActivities,
    loading
  } = useStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [showActivitiesPanel, setShowActivitiesPanel] = useState(false);

  useEffect(() => {
    if (boardId) {
      fetchBoardDetails(boardId);
      
      // Poll activities every 10 seconds for real-time history logs sync
      const interval = setInterval(() => {
        fetchActivities(boardId);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [boardId, fetchBoardDetails, fetchActivities]);

  // Make sure we update the selected task details in real-time when the active board changes!
  useEffect(() => {
    if (selectedTask && activeBoard) {
      // Find the updated task object inside the columns
      for (const col of activeBoard.columns) {
        const found = col.tasks.find((t) => t._id === selectedTask._id);
        if (found) {
          setSelectedTask(found);
          break;
        }
      }
    }
  }, [activeBoard, selectedTask]);

  const handleAddTask = async (title: string, columnId: string) => {
    await createTask({
      title,
      boardId,
      columnId,
    });
  };

  // Apply search & priority filtering logic to active board columns tasks!
  const getFilteredBoard = (): Board | null => {
    if (!activeBoard) return null;

    const filteredCols = activeBoard.columns.map((col) => {
      const filteredTasks = col.tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          task.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        const matchesAssignee = assigneeFilter === 'all' || 
          task.assignees.some((a) => a._id === assigneeFilter);

        return matchesSearch && matchesPriority && matchesAssignee;
      });

      return {
        ...col,
        tasks: filteredTasks,
      };
    });

    return {
      ...activeBoard,
      columns: filteredCols,
    };
  };

  const filteredBoard = getFilteredBoard();

  if (loading.activeBoard && !activeBoard) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeBoard) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-white mb-2">Board Not Found</h2>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </button>
      </div>
    );
  }

  // Get distinct assignees on the board for filter options
  const boardAssignees = Array.from(
    new Map(
      activeBoard.columns
        .flatMap((c) => c.tasks)
        .flatMap((t) => t.assignees)
        .map((a) => [a._id, a])
    ).values()
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col gap-6 relative max-w-full">
      {/* Board Title Toolbar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{activeBoard.name}</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">Sprint track planning logs, reordering positioning, and real-time syncing.</p>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-3">
          {/* Quick search input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="bg-[#111827]/40 border border-white/5 focus:border-violet-500/30 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-600 outline-none w-44 md:w-56 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <div className="relative shrink-0">
            <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#111827]/40 border border-white/5 rounded-xl py-2 pl-8 pr-3 text-xs text-gray-400 outline-none cursor-pointer appearance-none uppercase font-bold text-center"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignees filter */}
          {boardAssignees.length > 0 && (
            <div className="relative shrink-0 hidden sm:block">
              <Users className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-[#111827]/40 border border-white/5 rounded-xl py-2 pl-8 pr-3 text-xs text-gray-400 outline-none cursor-pointer appearance-none text-center"
              >
                <option value="all">All Assignees</option>
                {boardAssignees.map((a) => (
                  <option key={a._id} value={a._id}>{a.username}</option>
                ))}
              </select>
            </div>
          )}

          {/* Activity Panel toggle */}
          <button
            onClick={() => setShowActivitiesPanel(!showActivitiesPanel)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              showActivitiesPanel 
                ? 'bg-violet-600/10 border-violet-500/30 text-violet-400' 
                : 'bg-[#111827]/40 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <ActivityIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden max-w-full">
        {/* Kanban Board Container */}
        {filteredBoard && (
          <BoardArea
            board={filteredBoard}
            onTaskClick={(task) => setSelectedTask(task)}
            onAddTask={handleAddTask}
            typingStatus={typingStatus}
          />
        )}

        {/* Side Panel: Global Activity Logs Feed */}
        {showActivitiesPanel && (
          <aside className="w-80 shrink-0 bg-[#111827]/40 border border-white/5 rounded-2xl flex flex-col h-full glass relative overflow-hidden animate-slide-in">
            <div className="px-4 py-3.5 border-b border-white/5 flex justify-between items-center bg-[#1F2937]/10 shrink-0">
              <span className="font-bold text-xs tracking-wide text-gray-200 uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-violet-400" />
                History Timeline
              </span>
              <button
                onClick={() => setShowActivitiesPanel(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-600 font-medium">
                  No board modifications recorded yet.
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="text-xs space-y-1 relative pl-4 border-l border-white/5">
                    {/* Circle icon bullet */}
                    <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-violet-500 border border-[#111827]" />
                    <div className="flex justify-between items-center text-gray-500 text-[10px]">
                      <span className="font-bold text-gray-300">{act.actor?.username}</span>
                      <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-400 leading-normal font-medium">{act.description}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Selected Task details modal overlay */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
