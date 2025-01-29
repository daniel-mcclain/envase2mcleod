import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { UserProfile } from '../types/user';

interface DeleteUserModalProps {
  user: UserProfile;
  onClose: () => void;
  onDelete: (uid: string) => Promise<void>;
}

export function DeleteUserModal({ user, onClose, onDelete }: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== user.email) {
      setError('Please type the email address correctly to confirm deletion');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onDelete(user.uid);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">
            This action cannot be undone. This will permanently delete the user
            account for <strong>{user.email}</strong> and remove all associated data.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Please type <span className="font-mono">{user.email}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Type email to confirm"
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
            type="button"
            onClick={handleDelete}
            disabled={isLoading || confirmText !== user.email}
            className={`px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              isLoading || confirmText !== user.email
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
}