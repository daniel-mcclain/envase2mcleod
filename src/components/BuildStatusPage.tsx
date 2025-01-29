import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useBuildTasks } from '../hooks/useBuildTasks';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { AddTaskModal } from './build/AddTaskModal';
import { TaskList } from './build/TaskList';

export function BuildStatusPage() {
  const [showAddTask, setShowAddTask] = useState(false);
  const { 
    tasks, 
    loading, 
    error, 
    addTask, 
    deleteTask,
    updateTaskStatus,
    reorderTask,
    addSubTask,
    toggleSubTask,
    deleteSubTask,
    subscribeToTask,
    unsubscribeFromTask
  } = useBuildTasks();
  const { user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const handleAddTask = async (
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high'
  ) => {
    if (!user) return;
    
    try {
      await addTask(title, description, priority, user.uid);
      setShowAddTask(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Build Status</h1>
          <p className="text-gray-600">Track the progress of website development tasks</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
          <p className="mt-1 text-sm text-gray-500">
            No build tasks have been created yet.
          </p>
        </div>
      ) : (
        <TaskList
          tasks={tasks}
          isAdmin={isAdmin}
          currentUserId={user?.uid || ''}
          currentUserEmail={user?.email || ''}
          onStatusChange={updateTaskStatus}
          onAddSubTask={addSubTask}
          onToggleSubTask={toggleSubTask}
          onDeleteSubTask={deleteSubTask}
          onDeleteTask={deleteTask}
          onReorderTask={reorderTask}
          onSubscribe={subscribeToTask}
          onUnsubscribe={unsubscribeFromTask}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          onClose={() => setShowAddTask(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
}