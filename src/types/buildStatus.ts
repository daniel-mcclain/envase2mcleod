export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuildTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  subTasks: SubTask[];
  order: number;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';