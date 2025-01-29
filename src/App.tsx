import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Titlebar } from './components/Titlebar';
import { BillingTable } from './components/BillingTable';
import { SettingsPage } from './components/SettingsPage';
import { BuildStatusPage } from './components/BuildStatusPage';
import { AuthForm } from './components/AuthForm';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useAuth } from './hooks/useAuth';
import { useBillingEntries } from './hooks/useBillingEntries';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, loading: authLoading } = useAuth();
  const { 
    entries, 
    loading: entriesLoading, 
    error, 
    syncToMcLeod 
  } = useBillingEntries(user?.uid ?? null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <div className="flex-1 transition-all duration-300" style={{ 
        marginLeft: isSidebarOpen ? '16rem' : '5rem',
        marginTop: '4rem'
      }}>
        <Titlebar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-8">
          {currentPage === 'dashboard' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
                <p className="text-gray-600">Track and manage your billing entries</p>
              </div>
              
              {error && <ErrorMessage message={error} />}
              
              <div className="bg-white rounded-lg shadow mt-4">
                {entriesLoading ? (
                  <div className="p-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <BillingTable entries={entries} onSync={syncToMcLeod} />
                )}
              </div>
            </>
          )}

          {currentPage === 'build-status' && <BuildStatusPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;