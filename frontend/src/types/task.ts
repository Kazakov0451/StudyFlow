export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string | null;
}

export interface TaskCreate {
  title: string;
  description?: string;
  deadline?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  deadline?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
