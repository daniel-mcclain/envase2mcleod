import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import type { UserProfile } from '../types/user';

interface EditUserModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (uid: string, displayName: string) => Promise<void>;
}

export function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSave(user.uid, displayName);
      onClose();
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter display name"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}