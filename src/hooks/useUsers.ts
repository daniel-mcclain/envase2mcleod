import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

  return {
    users,
    loading,
    error,
    createUser,
    updateUserRole,
    updateUserProfile,
    updateLastLogin,
    updateLastPasswordChange
  };
}