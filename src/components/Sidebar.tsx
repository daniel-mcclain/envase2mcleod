import React from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, ListTodo } from 'lucide-react';
import { auth } from '../lib/firebase';

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ isOpen, currentPage, onNavigate }: SidebarProps) {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div 
      className={`bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 flex flex-col h-full">
        <h1 className={`font-bold mb-8 transition-opacity duration-300 ${
          isOpen ? 'text-xl opacity-100' : 'text-sm opacity-0'
        }`}>
          Billing Tracker
        </h1>
        
        {/* Main navigation */}
        <nav className="space-y-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full ${
              currentPage === 'dashboard' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              Dashboard
            </span>
          </button>
          <button
            onClick={() => onNavigate('invoices')}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full ${
              currentPage === 'invoices' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <FileText className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              Invoices
            </span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full ${
              currentPage === 'settings' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              Settings
            </span>
          </button>
        </nav>

        {/* Bottom section with Build Status and Logout */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => onNavigate('build-status')}
            className={`flex items-center space-x-3 p-3 rounded-lg w-full ${
              currentPage === 'build-status' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <ListTodo className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              Build Status
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}