import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, PauseCircle, Plus, X, ChevronDown, ChevronRight, Trash2, ListChecks, GripVertical, Lock, Bell, BellOff } from 'lucide-react';
import type { BuildTask, TaskStatus, SubTask } from '../../types/buildStatus';
import { formatDate } from '../../utils/dateFormatter';

interface TaskListProps {
  tasks: BuildTask[];
  isAdmin: boolean;
  currentUserId: string;
  currentUserEmail: string;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  onAddSubTask: (taskId: string, title: string) => Promise<void>;
  onToggleSubTask: (taskId: string, subTask: SubTask) => Promise<void>;
  onDeleteSubTask: (taskId: string, subTask: SubTask) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onReorderTask: (taskId: string, newOrder: number) => Promise<void>;
  onSubscribe: (taskId: string, userId: string, email: string) => Promise<void>;
  onUnsubscribe: (taskId: string, userId: string) => Promise<void>;
}

export function TaskList({ 
  tasks, 
  isAdmin,
  currentUserId,
  currentUserEmail,
  onStatusChange,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  onDeleteTask,
  onReorderTask,
  onSubscribe,
  onUnsubscribe
}: TaskListProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [newSubTasks, setNewSubTasks] = useState<Record<string, string>>({});
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<BuildTask | null>(null);

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAddSubTask = async (taskId: string) => {
    const title = newSubTasks[taskId]?.trim();
    if (!title) return;

    try {
      await onAddSubTask(taskId, title);
      setNewSubTasks(prev => ({ ...prev, [taskId]: '' }));
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (deletingTask === taskId) {
      try {
        await onDeleteTask(taskId);
        setDeletingTask(null);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    } else {
      setDeletingTask(taskId);
      setTimeout(() => setDeletingTask(null), 3000);
    }
  };

  const handleDragStart = (task: BuildTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetTask: BuildTask) => {
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const draggedOrder = draggedTask.order;
    const targetOrder = targetTask.order;
    
    try {
      // If dropping above target
      if (draggedOrder > targetOrder) {
        // Move tasks between target and dragged down
        for (const task of tasks) {
          if (task.order >= targetOrder && task.order < draggedOrder) {
            await onReorderTask(task.id, task.order + 1);
          }
        }
      } else {
        // Move tasks between dragged and target up
        for (const task of tasks) {
          if (task.order > draggedOrder && task.order <= targetOrder) {
            await onReorderTask(task.id, task.order - 1);
          }
        }
      }
      
      // Move dragged task to target position
      await onReorderTask(draggedTask.id, targetOrder);
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
    }
    
    setDraggedTask(null);
  };

  const handleSubscriptionToggle = async (task: BuildTask) => {
    try {
      if (task.subscribers.includes(currentUserId)) {
        await onUnsubscribe(task.id, currentUserId);
      } else {
        await onSubscribe(task.id, currentUserId, currentUserEmail);
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'blocked':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <PauseCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: BuildTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
    }
  };

  const getSubTaskStats = (subTasks: SubTask[]) => {
    const total = subTasks.length;
    const completed = subTasks.filter(task => task.completed).length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progress };
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => {
          const { total, completed, progress } = getSubTaskStats(task.subTasks);
          const isSubscribed = task.subscribers.includes(currentUserId);
          
          return (
            <li 
              key={task.id}
              draggable={isAdmin}
              onDragStart={() => handleDragStart(task)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(task)}
              className={`${isAdmin ? 'cursor-move' : ''} ${
                draggedTask?.id === task.id ? 'opacity-50' : ''
              }`}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isAdmin && (
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                    )}
                    <button
                      onClick={() => toggleExpand(task.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedTasks.has(task.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    {getStatusIcon(task.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      {total > 0 && (
                        <div className="flex items-center mt-1 space-x-2">
                          <ListChecks className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {completed}/{total} completed
                          </span>
                          <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{progress}%</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSubscriptionToggle(task)}
                      className={`p-2 rounded-md ${
                        isSubscribed 
                          ? 'text-indigo-600 hover:text-indigo-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={isSubscribed ? 'Unsubscribe from updates' : 'Subscribe to updates'}
                    >
                      {isSubscribed ? (
                        <Bell className="w-5 h-5" />
                      ) : (
                        <BellOff className="w-5 h-5" />
                      )}
                    </button>
                    {isAdmin && (
                      <>
                        <select
                          value={task.status}
                          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className={`p-2 rounded-md ${
                            deletingTask === task.id
                              ? 'bg-red-100 text-red-600'
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                          title={deletingTask === task.id ? 'Click again to confirm' : 'Delete task'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Created: {formatDate(task.createdAt)}</p>
                  <p>Last updated: {formatDate(task.updatedAt)}</p>
                </div>

                {expandedTasks.has(task.id) && (
                  <div className="mt-4 pl-8">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sub-tasks</h4>
                    <ul className="space-y-2">
                      {task.subTasks.map((subTask) => (
                        <li key={subTask.id} className="flex items-center space-x-2">
                          {isAdmin ? (
                            <input
                              type="checkbox"
                              checked={subTask.completed}
                              onChange={() => onToggleSubTask(task.id, subTask)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={subTask.completed}
                                disabled
                                className="rounded text-gray-300 cursor-not-allowed"
                              />
                              <Lock className="w-3 h-3 text-gray-400 absolute -right-4" />
                            </div>
                          )}
                          <span className={`text-sm ${subTask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {subTask.title}
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => onDeleteSubTask(task.id, subTask)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    
                    {isAdmin && (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSubTasks[task.id] || ''}
                          onChange={(e) => setNewSubTasks(prev => ({ ...prev, [task.id]: e.target.value }))}
                          placeholder="Add a sub-task"
                          className="text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleAddSubTask(task.id)}
                          className="p-1 text-indigo-600 hover:text-indigo-700"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}