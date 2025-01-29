import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface PopupProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function Popup({ type, message, onClose }: PopupProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center mb-4">
          {type === 'success' ? (
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
          )}
          <h3 className={`text-lg font-medium ${
            type === 'success' ? 'text-green-900' : 'text-red-900'
          }`}>
            {type === 'success' ? 'Success' : 'Error'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-white ${
              type === 'success' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}