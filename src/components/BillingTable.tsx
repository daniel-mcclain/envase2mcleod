import React from 'react';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { BillingEntry } from '../types/billing';

interface BillingTableProps {
  entries: BillingEntry[];
  onSync: (entry: BillingEntry) => Promise<void>;
}

export function BillingTable({ entries, onSync }: BillingTableProps) {
  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'syncing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Upload className="w-5 h-5 text-gray-500" />;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No billing entries found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sync Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {entry.invoice_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {entry.customer_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${entry.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  entry.status === 'processed' ? 'bg-green-100 text-green-800' :
                  entry.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {entry.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getSyncIcon(entry.sync_status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => onSync(entry)}
                  disabled={entry.sync_status === 'syncing' || entry.sync_status === 'synced'}
                  className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sync to McLeod
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}