import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SimpleHeader from './SimpleHeader';
import { DashboardIcon } from './icons/DashboardIcon';
import { HeartIcon } from './icons/HeartIcon';
import { BloodPressureIcon } from './icons/BloodPressureIcon';
import { TemperatureIcon } from './icons/TemperatureIcon';
import { PillIcon } from './icons/PillIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { DocumentUploadIcon } from './icons/DocumentUploadIcon';

const PatientDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SimpleHeader 
        userName={profile?.name || user?.email || 'User'}
        userRole={profile?.role || 'patient'}
        onSignOut={signOut}
      />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {profile?.name || user?.email}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Here's your health overview for today
            </p>
          </div>

          {/* Health Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <HeartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Heart Rate</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">72 BPM</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BloodPressureIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blood Pressure</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">120/80</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <TemperatureIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperature</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">98.6°F</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <PillIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Medications</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">3 Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Took medication: Metformin - <span className="text-gray-400">2 hours ago</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Blood pressure recorded - <span className="text-gray-400">6 hours ago</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Lab results uploaded - <span className="text-gray-400">1 day ago</span>
                    </p>
                  </div>
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
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Complete profile</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Complete
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserPlusIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Connect with a doctor</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Browse
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentUploadIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Upload medical records</span>
                    </div>
                    <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                      Upload
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

export default PatientDashboard;