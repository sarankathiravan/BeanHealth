import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SimpleHeader from './SimpleHeader';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { MessagesIcon } from './icons/MessagesIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const DoctorDashboardContainer: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SimpleHeader 
        userName={profile?.first_name || profile?.last_name || user?.email || 'Doctor'}
        userRole={profile?.role || 'doctor'}
        onSignOut={signOut}
      />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, Dr. {profile?.last_name || user?.email}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Your practice dashboard and patient overview
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MessagesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Messages</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <DocumentIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Patients */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Patients</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by inviting patients to connect with you.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Getting Started</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <SparklesIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Complete your profile</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Complete
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserGroupIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Invite patients</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Invite
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Set up practice info</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Setup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboardContainer;