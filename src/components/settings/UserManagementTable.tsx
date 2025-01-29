import React from 'react';
import { User, Trash2 } from 'lucide-react';
import type { UserProfile, UserRole } from '../../types/user';
import { formatDate } from '../../utils/dateFormatter';

interface UserManagementTableProps {
  users: UserProfile[];
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
  onRoleChange: (uid: string, role: UserRole) => void;
}

export function UserManagementTable({ 
  users, 
  onEditUser, 
  onDeleteUser,
  onRoleChange 
}: UserManagementTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Login
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Password Change
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.uid}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName || 'Unnamed User'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => onRoleChange(user.uid, e.target.value as UserRole)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.lastLogin)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.lastPasswordChange)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => onEditUser(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteUser(user)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}