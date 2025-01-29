import React, { useState } from 'react';
import { User, Users, Shield, UserPlus } from 'lucide-react';
import { auth } from '../lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, AuthErrorCodes, updatePassword } from 'firebase/auth';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { Popup } from './Popup';
import { EditUserModal } from './EditUserModal';
import { DeleteUserModal } from './DeleteUserModal';
import { AddUserModal } from './settings/AddUserModal';
import { UserManagementTable } from './settings/UserManagementTable';
import { SecuritySettings } from './settings/SecuritySettings';
import { ProfileSettings } from './settings/ProfileSettings';
import type { UserRole, UserProfile } from '../types/user';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [newPassword, setNewPassword] = useState('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [popup, setPopup] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });
  
  const { 
    users, 
    createUser, 
    updateUserRole, 
    updateUserProfile, 
    updateLastPasswordChange,
    deleteUser 
  } = useUsers();
  const { user: currentUser, userRole } = useAuth();

  const validatePassword = (password: string): string | null => {
    console.log('Validating password requirements');
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    console.log('Password validation passed');
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent, currentPassword: string) => {
    e.preventDefault();
    console.log('Starting password change process');
    
    try {
      if (!currentUser || !currentUser.email) {
        console.error('No user is currently logged in');
        throw new Error('No user is currently logged in. Please log in and try again.');
      }

      if (!currentPassword || !newPassword) {
        console.error('Missing current or new password');
        throw new Error('Both current and new passwords are required.');
      }

      // Validate new password
      const validationError = validatePassword(newPassword);
      if (validationError) {
        console.error('Password validation failed:', validationError);
        throw new Error(validationError);
      }

      if (currentPassword === newPassword) {
        console.error('New password matches current password');
        throw new Error('New password must be different from current password.');
      }

      console.log('Creating credentials for reauthentication');
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      console.log('Attempting to reauthenticate user');
      await reauthenticateWithCredential(currentUser, credential);
      console.log('Reauthentication successful');
      
      console.log('Updating password');
      try {
        await updatePassword(currentUser, newPassword);
        console.log('Password updated successfully');
      } catch (updateError: any) {
        console.error('Error in updatePassword:', updateError);
        throw new Error(updateError.message || 'Failed to update password. Please try again.');
      }
      
      console.log('Updating lastPasswordChange in Firestore');
      await updateLastPasswordChange(currentUser.uid);
      console.log('LastPasswordChange updated in Firestore');
      
      setNewPassword('');
      setPopup({
        show: true,
        type: 'success',
        message: 'Password updated successfully! Please use your new password for future logins.'
      });
    } catch (error: any) {
      console.error('Error in password change process:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case AuthErrorCodes.INVALID_PASSWORD:
            errorMessage = 'User entered the wrong current password';
            break;
          case 'auth/weak-password':
          case AuthErrorCodes.WEAK_PASSWORD:
            errorMessage = 'The new password is too weak. Please choose a stronger password.';
            break;
          case 'auth/requires-recent-login':
          case AuthErrorCodes.REQUIRES_RECENT_LOGIN:
            errorMessage = 'For security reasons, please log out and log back in before changing your password.';
            break;
          case 'auth/too-many-requests':
          case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
          case AuthErrorCodes.NETWORK_REQUEST_FAILED:
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Password changes are currently disabled. Please contact support.';
            break;
        }
      }
      
      setPopup({
        show: true,
        type: 'error',
        message: errorMessage
      });
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
      setPopup({
        show: true,
        type: 'success',
        message: 'User role updated successfully'
      });
    } catch (error) {
      setPopup({
        show: true,
        type: 'error',
        message: 'Failed to update user role'
      });
    }
  };

  const handleEditUser = async (uid: string, displayName: string) => {
    try {
      await updateUserProfile(uid, displayName);
      setPopup({
        show: true,
        type: 'success',
        message: 'User updated successfully'
      });
    } catch (error) {
      throw error;
    }
  };

  const handleAddUser = async (email: string, password: string, role: string, displayName: string) => {
    try {
      await createUser(email, password, role as UserRole, displayName);
      setPopup({
        show: true,
        type: 'success',
        message: 'User created successfully'
      });
    } catch (error: any) {
      setPopup({
        show: true,
        type: 'error',
        message: error.message || 'Failed to create user'
      });
      throw error;
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    try {
      await deleteUser(user.uid);
      setPopup({
        show: true,
        type: 'success',
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      setPopup({
        show: true,
        type: 'error',
        message: error.message || 'Failed to delete user'
      });
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="max-w-6xl mx-auto">
      {popup.show && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup({ ...popup, show: false })}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditUser}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onAdd={handleAddUser}
        />
      )}

      {userToDelete && (
        <DeleteUserModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onDelete={handleDeleteUser}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application settings</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              ...(isAdmin ? [{ id: 'users', icon: Users, label: 'Users' }] : []),
              { id: 'security', icon: Shield, label: 'Security' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings currentUser={currentUser} />}

          {activeTab === 'users' && isAdmin && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">User Management</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
              <UserManagementTable
                users={users}
                onEditUser={setEditingUser}
                onDeleteUser={setUserToDelete}
                onRoleChange={handleRoleChange}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <SecuritySettings
              onPasswordChange={handlePasswordChange}
              newPassword={newPassword}
              onNewPasswordChange={setNewPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
}