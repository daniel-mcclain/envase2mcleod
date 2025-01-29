import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { doc, setDoc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserRole } from '../types/user';

interface AuthState {
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: auth.currentUser,
    loading: true,
    userRole: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user role from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Create new user profile
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'user', // Default role
            lastLogin: Timestamp.now(),
            lastPasswordChange: Timestamp.now(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          setAuthState({ user, loading: false, userRole: 'user' });
        } else {
          // Update last login
          await updateDoc(userRef, {
            lastLogin: Timestamp.now(),
            updatedAt: Timestamp.now()
          });
          setAuthState({ 
            user, 
            loading: false, 
            userRole: userDoc.data().role as UserRole 
          });
        }
      } else {
        setAuthState({ user: null, loading: false, userRole: null });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
}