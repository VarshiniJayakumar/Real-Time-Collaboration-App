export interface User {
  _id: string;
  id?: string;
  username: string;
  email: string;
  avatarUrl: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  owner: User | string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  author: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  labels: string[];
  assignees: User[];
  board: string;
  column: string;
  position: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  name: string;
  board: string;
  position: number;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  workspace: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  actor: User;
  board: string;
  task?: {
    _id: string;
    title: string;
  };
  type: string;
  description: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: User;
  type: 'task_assigned' | 'comment_mention' | 'workspace_invite';
  message: string;
  isRead: boolean;
  board?: string;
  task?: {
    _id: string;
    title: string;
  };
  createdAt: string;
}
