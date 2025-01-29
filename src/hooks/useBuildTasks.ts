import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BuildTask, TaskStatus, SubTask } from '../types/buildStatus';

export function useBuildTasks() {
  const [tasks, setTasks] = useState<BuildTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initially fetch without order to prevent index error
    const q = query(
      collection(db, 'build_tasks'),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const buildTasks: BuildTask[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          buildTasks.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assignedTo: data.assignedTo,
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString(),
            createdBy: data.createdBy,
            subTasks: data.subTasks || [],
            order: data.order || 0
          });
        });
        
        // Sort tasks by order after fetching
        buildTasks.sort((a, b) => a.order - b.order);
        
        setTasks(buildTasks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching build tasks:', err);
        setError('Failed to load build tasks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addTask = async (
    title: string,
    description: string,
    priority: BuildTask['priority'],
    createdBy: string
  ) => {
    try {
      // Get the highest order number and add 1
      const maxOrder = tasks.reduce((max, task) => Math.max(max, task.order), 0);
      
      await addDoc(collection(db, 'build_tasks'), {
        title,
        description,
        status: 'pending' as TaskStatus,
        priority,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy,
        subTasks: [],
        order: maxOrder + 1
      });
    } catch (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'build_tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const taskRef = doc(db, 'build_tasks', taskId);
      await updateDoc(taskRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  };

  const reorderTask = async (taskId: string, newOrder: number) => {
    try {
      const taskRef = doc(db, 'build_tasks', taskId);
      await updateDoc(taskRef, {
        order: newOrder,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error reordering task:', error);
      throw new Error('Failed to reorder task');
    }
  };

  const addSubTask = async (taskId: string, title: string) => {
    try {
      const taskRef = doc(db, 'build_tasks', taskId);
      const newSubTask: SubTask = {
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');
      
      await updateDoc(taskRef, {
        subTasks: [...task.subTasks, newSubTask],
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw new Error('Failed to add subtask');
    }
  };

  const toggleSubTask = async (taskId: string, subTask: SubTask) => {
    try {
      const taskRef = doc(db, 'build_tasks', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedSubTasks = task.subTasks.map(st => 
        st.id === subTask.id 
          ? { ...st, completed: !st.completed, updatedAt: new Date().toISOString() }
          : st
      );
      
      await updateDoc(taskRef, {
        subTasks: updatedSubTasks,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error toggling subtask:', error);
      throw new Error('Failed to update subtask');
    }
  };

  const deleteSubTask = async (taskId: string, subTask: SubTask) => {
    try {
      const taskRef = doc(db, 'build_tasks', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const updatedSubTasks = task.subTasks.filter(st => st.id !== subTask.id);
      
      await updateDoc(taskRef, {
        subTasks: updatedSubTasks,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw new Error('Failed to delete subtask');
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    updateTaskStatus,
    reorderTask,
    addSubTask,
    toggleSubTask,
    deleteSubTask
  };
}