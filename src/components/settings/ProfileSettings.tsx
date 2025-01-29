import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ProfileSettingsProps {
  currentUser: FirebaseUser | null;
}

export function ProfileSettings({ currentUser }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-8 h-8 text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium">{displayName || 'User'}</h3>
          <p className="text-sm text-gray-500">{currentUser?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={displayName}
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={currentUser?.email || ''}
            disabled
          />
        </div>
      </div>
    </div>
  );
}