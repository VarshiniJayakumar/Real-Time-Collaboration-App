import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { api } from '../services/api';
import { User, Workspace, Board, Column, Task, Comment, Activity, Notification } from '../types';

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  boards: Board[];
  activeBoard: Board | null;
  notifications: Notification[];
  activities: Activity[];
  socket: Socket | null;
  typingStatus: Record<string, string[]>; // taskId -> usernames
  loading: Record<string, boolean>;
  error: string | null;

  // Actions
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  // Workspace Actions
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  inviteToWorkspace: (email: string) => Promise<void>;

  // Board Actions
  fetchBoards: (workspaceId: string) => Promise<void>;
  createBoard: (name: string, description: string, workspaceId: string) => Promise<Board>;
  fetchBoardDetails: (boardId: string) => Promise<void>;
  setActiveBoard: (board: Board | null) => void;
  fetchActivities: (boardId: string) => Promise<void>;

  // Task Actions
  createTask: (taskData: { title: string; description?: string; priority?: string; dueDate?: string; labels?: string[]; assignees?: string[]; boardId: string; columnId: string }) => Promise<void>;
  updateTask: (taskId: string, updateData: Partial<Task>) => Promise<void>;
  updateTaskPositionsOptimistic: (
    boardId: string, 
    sourceColumnId: string, 
    destColumnId: string, 
    sourceIndex: number, 
    destIndex: number,
    taskId: string
  ) => void;
  deleteTask: (taskId: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;

  // Notification Actions
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;

  // Socket Actions
  initSocket: () => void;
  disconnectSocket: () => void;
  joinBoardRoom: (boardId: string) => void;
  leaveBoardRoom: (boardId: string) => void;
  emitTaskMove: (boardId: string, updatedBoard: Board) => void;
  emitTyping: (boardId: string, taskId: string, isTyping: boolean) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  workspaces: [],
  activeWorkspace: null,
  boards: [],
  activeBoard: null,
  notifications: [],
  activities: [],
  socket: null,
  typingStatus: {},
  loading: {},
  error: null,

  // Auth actions
  login: async (credentials) => {
    set((state) => ({ loading: { ...state.loading, auth: true }, error: null }));
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      set({ user: data.user, isAuthenticated: true });
      get().initSocket();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  register: async (userData) => {
    set((state) => ({ loading: { ...state.loading, auth: true }, error: null }));
    try {
      const data = await api.post<{ token: string; user: User }>('/auth/register', userData);
      localStorage.setItem('token', data.token);
      set({ user: data.user, isAuthenticated: true });
      get().initSocket();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.error('Logout API failed:', err);
    }
    localStorage.removeItem('token');
    get().disconnectSocket();
    set({
      user: null,
      isAuthenticated: false,
      workspaces: [],
      activeWorkspace: null,
      boards: [],
      activeBoard: null,
      notifications: [],
      activities: [],
    });
  },

  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    set((state) => ({ loading: { ...state.loading, auth: true } }));
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      set({ user: data.user, isAuthenticated: true });
      get().initSocket();
    } catch (err) {
      console.error('Check auth failed:', err);
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    } finally {
      set((state) => ({ loading: { ...state.loading, auth: false } }));
    }
  },

  // Workspace Actions
  fetchWorkspaces: async () => {
    set((state) => ({ loading: { ...state.loading, workspaces: true } }));
    try {
      const data = await api.get<{ workspaces: Workspace[] }>('/workspaces');
      set({ workspaces: data.workspaces });
      
      // Auto-set active workspace if none is set
      const currentActive = get().activeWorkspace;
      if (data.workspaces.length > 0) {
        const found = data.workspaces.find(w => w._id === currentActive?._id);
        set({ activeWorkspace: found || data.workspaces[0] });
      } else {
        set({ activeWorkspace: null });
      }
    } catch (err: any) {
      console.error('Fetch workspaces error:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, workspaces: false } }));
    }
  },

  createWorkspace: async (name, description) => {
    try {
      const data = await api.post<{ workspace: Workspace }>('/workspaces', { name, description });
      set((state) => ({ workspaces: [...state.workspaces, data.workspace] }));
      set({ activeWorkspace: data.workspace });
      return data.workspace;
    } catch (err: any) {
      console.error('Create workspace error:', err);
      throw err;
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace, activeBoard: null, boards: [] });
    if (workspace) {
      get().fetchBoards(workspace._id);
    }
  },

  inviteToWorkspace: async (email) => {
    const activeWorkspace = get().activeWorkspace;
    if (!activeWorkspace) return;

    try {
      await api.post(`/workspaces/${activeWorkspace._id}/invite`, { email });
      await get().fetchWorkspaces();
    } catch (err: any) {
      console.error('Invite to workspace error:', err);
      throw err;
    }
  },

  // Board Actions
  fetchBoards: async (workspaceId) => {
    set((state) => ({ loading: { ...state.loading, boards: true } }));
    try {
      const data = await api.get<{ boards: Board[] }>(`/boards?workspaceId=${workspaceId}`);
      set({ boards: data.boards });
    } catch (err: any) {
      console.error('Fetch boards error:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, boards: false } }));
    }
  },

  createBoard: async (name, description, workspaceId) => {
    try {
      const data = await api.post<{ board: Board }>('/boards', { name, description, workspaceId });
      set((state) => ({ boards: [...state.boards, data.board] }));
      return data.board;
    } catch (err: any) {
      console.error('Create board error:', err);
      throw err;
    }
  },

  fetchBoardDetails: async (boardId) => {
    set((state) => ({ loading: { ...state.loading, activeBoard: true } }));
    try {
      const data = await api.get<{ board: Board }>(`/boards/${boardId}`);
      set({ activeBoard: data.board });
      get().joinBoardRoom(boardId);
      get().fetchActivities(boardId);
    } catch (err: any) {
      console.error('Fetch board details error:', err);
    } finally {
      set((state) => ({ loading: { ...state.loading, activeBoard: false } }));
    }
  },

  setActiveBoard: (board) => {
    const currentActiveBoard = get().activeBoard;
    if (currentActiveBoard) {
      get().leaveBoardRoom(currentActiveBoard._id);
    }
    set({ activeBoard: board });
    if (board) {
      get().fetchBoardDetails(board._id);
    }
  },

  fetchActivities: async (boardId) => {
    try {
      const data = await api.get<{ activities: Activity[] }>(`/boards/${boardId}/activities`);
      set({ activities: data.activities });
    } catch (err: any) {
      console.error('Fetch board activities error:', err);
    }
  },

  // Task Actions
  createTask: async (taskData) => {
    try {
      const data = await api.post<{ task: Task }>('/tasks', taskData);
      
      const activeBoard = get().activeBoard;
      if (activeBoard) {
        // Find column and add task
        const updatedColumns = activeBoard.columns.map((col) => {
          if (col._id === taskData.columnId) {
            return { ...col, tasks: [...col.tasks, data.task] };
          }
          return col;
        });

        const updatedBoard = { ...activeBoard, columns: updatedColumns };
        set({ activeBoard: updatedBoard });
        get().emitTaskMove(activeBoard._id, updatedBoard);
        get().fetchActivities(activeBoard._id);
      }
    } catch (err: any) {
      console.error('Create task error:', err);
      throw err;
    }
  },

  updateTask: async (taskId, updateData) => {
    try {
      const data = await api.put<{ task: Task }>(`/tasks/${taskId}`, updateData);
      
      const activeBoard = get().activeBoard;
      if (activeBoard) {
        // Replace task in active columns list
        const updatedColumns = activeBoard.columns.map((col) => {
          // If task moved to another column (and this update was sent via standard updates)
          const hasTask = col.tasks.some((t) => t._id === taskId);
          const isTargetCol = col._id === data.task.column;

          if (hasTask && col._id !== data.task.column) {
            // Remove from old column
            return { ...col, tasks: col.tasks.filter((t) => t._id !== taskId) };
          } else if (isTargetCol && !hasTask) {
            // Add to new column
            return { ...col, tasks: [...col.tasks, data.task].sort((a, b) => a.position - b.position) };
          } else if (hasTask && isTargetCol) {
            // Modify inside same column
            return {
              ...col,
              tasks: col.tasks.map((t) => (t._id === taskId ? data.task : t)).sort((a, b) => a.position - b.position),
            };
          }
          return col;
        });

        const updatedBoard = { ...activeBoard, columns: updatedColumns };
        set({ activeBoard: updatedBoard });
        get().emitTaskMove(activeBoard._id, updatedBoard);
        get().fetchActivities(activeBoard._id);
      }
    } catch (err: any) {
      console.error('Update task error:', err);
      throw err;
    }
  },

  // Perform a high-performance optimistic state transformation for drag and drop
  updateTaskPositionsOptimistic: (boardId, sourceColumnId, destColumnId, sourceIndex, destIndex, taskId) => {
    const activeBoard = get().activeBoard;
    if (!activeBoard || activeBoard._id !== boardId) return;

    // Deep copy columns list
    const updatedColumns = activeBoard.columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    const sourceCol = updatedColumns.find((c) => c._id === sourceColumnId);
    const destCol = updatedColumns.find((c) => c._id === destColumnId);

    if (!sourceCol || !destCol) return;

    const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
    
    if (movedTask) {
      // Modify task column ID property
      movedTask.column = destColumnId;
      destCol.tasks.splice(destIndex, 0, movedTask);

      // Re-assign positions
      sourceCol.tasks.forEach((t, idx) => {
        t.position = idx;
      });
      destCol.tasks.forEach((t, idx) => {
        t.position = idx;
      });

      const updatedBoard = { ...activeBoard, columns: updatedColumns };
      set({ activeBoard: updatedBoard });

      // Notify Socket of the optimistic layout shifts immediately
      get().emitTaskMove(boardId, updatedBoard);
      
      // Dispatch async call to save in Database
      api.put<{ task: Task }>(`/tasks/${taskId}`, {
        column: destColumnId,
        position: destIndex,
      }).catch((err) => {
        console.error('Failed to save drag drop in database, rolling back', err);
        get().fetchBoardDetails(boardId); // rollback on failure
      });
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      
      const activeBoard = get().activeBoard;
      if (activeBoard) {
        const updatedColumns = activeBoard.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t._id !== taskId),
        }));

        const updatedBoard = { ...activeBoard, columns: updatedColumns };
        set({ activeBoard: updatedBoard });
        get().emitTaskMove(activeBoard._id, updatedBoard);
        get().fetchActivities(activeBoard._id);
      }
    } catch (err: any) {
      console.error('Delete task error:', err);
      throw err;
    }
  },

  addComment: async (taskId, content) => {
    try {
      const data = await api.post<{ comment: Comment }>(`/tasks/${taskId}/comments`, { content });
      
      const activeBoard = get().activeBoard;
      if (activeBoard) {
        const updatedColumns = activeBoard.columns.map((col) => {
          return {
            ...col,
            tasks: col.tasks.map((task) => {
              if (task._id === taskId) {
                return {
                  ...task,
                  comments: [...(task.comments || []), data.comment],
                };
              }
              return task;
            }),
          };
        });

        const updatedBoard = { ...activeBoard, columns: updatedColumns };
        set({ activeBoard: updatedBoard });
        
        // Emit Socket Event
        const socket = get().socket;
        if (socket) {
          socket.emit('comment:add', { boardId: activeBoard._id, taskId, comment: data.comment });
        }
        
        get().fetchActivities(activeBoard._id);
      }
    } catch (err: any) {
      console.error('Add comment error:', err);
      throw err;
    }
  },

  // Notifications Actions
  fetchNotifications: async () => {
    if (!get().isAuthenticated) return;
    try {
      const data = await api.get<{ notifications: Notification[] }>('/notifications');
      set({ notifications: data.notifications });
    } catch (err: any) {
      console.error('Fetch notifications error:', err);
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`, {});
      set((state) => ({
        notifications: state.notifications.map((n) =>
          notificationId === 'all' || n._id === notificationId ? { ...n, isRead: true } : n
        ),
      }));
    } catch (err: any) {
      console.error('Mark notification read error:', err);
    }
  },

  // Socket configurations
  initSocket: () => {
    if (get().socket) return;
    const socket = io(BACKEND_URL, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Socket client connected successfully');
    });

    // Handle real-time board changes broadcast
    socket.on('task:moved', ({ updatedBoard }: { updatedBoard: Board }) => {
      const activeBoard = get().activeBoard;
      if (activeBoard && activeBoard._id === updatedBoard._id) {
        set({ activeBoard: updatedBoard });
      }
    });

    // Handle typing status
    socket.on('task:typing', ({ taskId, username }: { taskId: string; username: string }) => {
      set((state) => {
        const list = state.typingStatus[taskId] || [];
        if (!list.includes(username)) {
          return {
            typingStatus: {
              ...state.typingStatus,
              [taskId]: [...list, username],
            },
          };
        }
        return state;
      });
    });

    socket.on('task:stop-typing', ({ taskId, username }: { taskId: string; username: string }) => {
      set((state) => {
        const list = state.typingStatus[taskId] || [];
        return {
          typingStatus: {
            ...state.typingStatus,
            [taskId]: list.filter((name) => name !== username),
          },
        };
      });
    });

    socket.on('comment:added', ({ taskId, comment }: { taskId: string; comment: Comment }) => {
      const activeBoard = get().activeBoard;
      if (activeBoard) {
        const updatedColumns = activeBoard.columns.map((col) => {
          return {
            ...col,
            tasks: col.tasks.map((task) => {
              if (task._id === taskId) {
                // Prevent duplicate comments
                const exists = task.comments.some((c) => c._id === comment._id);
                return {
                  ...task,
                  comments: exists ? task.comments : [...(task.comments || []), comment],
                };
              }
              return task;
            }),
          };
        });
        set({ activeBoard: { ...activeBoard, columns: updatedColumns } });
      }
    });

    // Re-fetch everything if someone changes column layout
    socket.on('board:updated', () => {
      const activeBoard = get().activeBoard;
      if (activeBoard) {
        get().fetchBoardDetails(activeBoard._id);
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  joinBoardRoom: (boardId) => {
    const socket = get().socket;
    const user = get().user;
    if (socket && user) {
      socket.emit('board:join', { boardId, user });
    }
  },

  leaveBoardRoom: (boardId) => {
    const socket = get().socket;
    const user = get().user;
    if (socket && user) {
      socket.emit('board:leave', { boardId, user });
    }
  },

  emitTaskMove: (boardId, updatedBoard) => {
    const socket = get().socket;
    if (socket) {
      socket.emit('task:move', { boardId, updatedBoard });
    }
  },

  emitTyping: (boardId, taskId, isTyping) => {
    const socket = get().socket;
    const user = get().user;
    if (socket && user) {
      const event = isTyping ? 'task:typing' : 'task:stop-typing';
      socket.emit(event, { boardId, taskId, username: user.username });
    }
  },
}));
