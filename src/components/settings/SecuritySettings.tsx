import React, { useState } from 'react';
import { Key } from 'lucide-react';

interface SecuritySettingsProps {
  onPasswordChange: (e: React.FormEvent, currentPassword: string) => Promise<void>;
  newPassword: string;
  onNewPasswordChange: (value: string) => void;
}

export function SecuritySettings({ 
  onPasswordChange, 
  newPassword, 
  onNewPasswordChange 
}: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password update process started');
    
    if (!currentPassword || !newPassword) {
      console.log('Password update aborted: Missing current or new password');
      return;
    }
    
    console.log('Calling onPasswordChange with current password');
    try {
      await onPasswordChange(e, currentPassword);
      console.log('Password update completed successfully');
      setCurrentPassword('');
    } catch (error) {
      console.error('Password update failed in SecuritySettings:', error);
    }
  };

  const passwordRequirements = [
    'At least 8 characters long',
    'At least one uppercase letter',
    'At least one lowercase letter',
    'At least one number',
    'At least one special character (!@#$%^&*(),.?":{}|<>)'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter current password"
                required
                minLength={8}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  onNewPasswordChange(e.target.value);
                  setShowPasswordRequirements(true);
                }}
                onFocus={() => setShowPasswordRequirements(true)}
                className="pl-10 block w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            {showPasswordRequirements && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentPassword || !newPassword}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}