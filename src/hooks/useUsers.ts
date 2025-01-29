import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, deleteDoc, Timestamp, getDocs, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile, deleteUser as deleteAuthUser } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import type { UserProfile, UserRole } from '../types/user';

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    setLoading(true);

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const userProfiles: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userProfiles.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName,
            role: data.role,
            lastLogin: data.lastLogin,
            lastPasswordChange: data.lastPasswordChange,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        setUsers(userProfiles);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createUser = async (email: string, password: string, role: UserRole, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Update the user's display name in Firebase Auth
      await updateProfile(user, { displayName });

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName,
        role,
        lastLogin: Timestamp.now(),
        lastPasswordChange: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  };

  const updateUserRole = async (uid: string, role: UserRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  };

  const updateUserProfile = async (uid: string, displayName: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        displayName,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  };

  const updateLastLogin = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw new Error('Failed to update last login');
    }
  };

  const updateLastPasswordChange = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        lastPasswordChange: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating last password change:', error);
      throw new Error('Failed to update last password change');
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      // Delete user document
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);

      // Delete user's task subscriptions
      const subscriptionsQuery = query(
        collection(db, 'task_subscriptions'),
        where('userId', '==', uid)
      );
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      const subscriptionDeletions = subscriptionsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(subscriptionDeletions);

      // Remove user from task subscribers arrays
      const tasksQuery = query(
        collection(db, 'build_tasks'),
        where('subscribers', 'array-contains', uid)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const taskUpdates = tasksSnapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          subscribers: doc.data().subscribers.filter((id: string) => id !== uid)
        })
      );
      await Promise.all(taskUpdates);

      // Delete user from Firebase Auth
      const userRecord = await auth.getUser(uid);
      if (userRecord) {
        await deleteAuthUser(userRecord);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUserRole,
    updateUserProfile,
    updateLastLogin,
    updateLastPasswordChange,
    deleteUser
  };
}