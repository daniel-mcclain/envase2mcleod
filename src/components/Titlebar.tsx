import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

interface TitlebarProps {
  onMenuClick: () => void;
}

export function Titlebar({ onMenuClick }: TitlebarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
        >
          <Menu className="h-6 w-6 text-gray-500" />
        </button>
        <div className="ml-4 relative">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <button className="p-2 rounded-lg hover:bg-gray-100 relative">
          <Bell className="h-6 w-6 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
}