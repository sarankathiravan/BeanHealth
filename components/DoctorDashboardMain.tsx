import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, ChatMessage } from '../types';
import { PatientAdditionService } from '../services/patientInvitationService';
import { ChatService } from '../services/chatService';
import SimpleHeader from './SimpleHeader';
import AddPatientModal from './AddPatientModal';
import Messages from './Messages';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { MessagesIcon } from './icons/MessagesIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { DashboardIcon } from './icons/DashboardIcon';

const DoctorDashboardMain: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patients, setPatients] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'messages'>('dashboard');

  // Fetch doctor's patients
  const fetchPatients = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const patientsData = await PatientAdditionService.getDoctorPatients(user.id);
      setPatients(patientsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for all patients
  const fetchMessages = async () => {
    if (!user?.id || patients.length === 0) return;
    
    try {
      const allMessages = await ChatService.getAllConversations(user.id);
      setMessages(allMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user?.id]);

  useEffect(() => {
    fetchMessages();
  }, [patients, user?.id]);

  const handleAddPatientClick = () => {
    setShowAddPatientModal(true);
  };

  const handleModalClose = () => {
    setShowAddPatientModal(false);
  };

  const handlePatientAdded = () => {
    // Refresh patient list
    fetchPatients();
    console.log('Patient added successfully');
  };

  const handleSendMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => {
    try {
      await ChatService.sendMessage(
        message.senderId,
        message.recipientId,
        message.text,
        message.isUrgent
      );
      // Refresh messages
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleMarkMessagesAsRead = async (patientId: string) => {
    // Implementation for marking messages as read
    // This would need to be added to ChatService
    console.log('Mark messages as read for patient:', patientId);
  };

  const unreadMessagesCount = messages.filter(m => 
    m.recipientId === user?.id && !m.isRead
  ).length;

  const renderDashboard = () => (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {profile?.name || user?.email}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Your practice dashboard and patient overview
            </p>
          </div>
          <button
            onClick={handleAddPatientClick}
            className="flex items-center justify-center mt-4 md:mt-0 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add New Patient
          </button>
        </div>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : patients.length}
              </p>
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
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {unreadMessagesCount}
              </p>
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
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Patients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Patients</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading patients...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <button 
                    onClick={fetchPatients}
                    className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Try again
                  </button>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by adding existing patients to your roster.
                  </p>
                  <button
                    onClick={handleAddPatientClick}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add First Patient
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {patient.name?.charAt(0) || patient.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {patient.name || patient.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {patient.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveView('messages')}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                  {patients.length > 5 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      And {patients.length - 5} more patients...
                    </p>
                  )}
                </div>
              )}
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Add patients</span>
                  </div>
                  <button 
                    onClick={handleAddPatientClick}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Add
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
    </>
  );

  const renderMessages = () => {
    // Convert User objects to Patient-like contacts for Messages component
    const patientContacts = patients.map(patient => ({
      ...patient,
      role: 'patient' as const, // Force to patient role for Messages component
      dateOfBirth: patient.dateOfBirth || patient.date_of_birth || '1990-01-01', // Required for Patient
      condition: patient.condition || 'General Health', // Required for Patient
      subscriptionTier: (patient.subscriptionTier || patient.subscription_tier || 'FreeTrial') as 'FreeTrial' | 'Paid', // Required for Patient
      urgentCredits: patient.urgentCredits || patient.urgent_credits || 0, // Required for Patient
      vitals: {
        bloodPressure: { value: '', unit: 'mmHg', trend: 'stable' as const },
        heartRate: { value: '', unit: 'bpm', trend: 'stable' as const },
        temperature: { value: '', unit: '°F', trend: 'stable' as const }
      },
      vitalsHistory: [],
      medications: [],
      records: [],
      doctors: [], // Required for Patient type
      chatMessages: messages.filter(m => 
        (m.senderId === patient.id && m.recipientId === user?.id) ||
        (m.senderId === user?.id && m.recipientId === patient.id)
      ),
      aiSummary: ''
    }));

    const currentUserContact = user ? {
      ...user,
      name: profile?.name || user.email || 'Doctor',
      email: user.email!, // Required for User type
      role: 'doctor' as const,
      avatarUrl: profile?.avatar_url || null,
      avatar_url: profile?.avatar_url || null,
      specialty: profile?.specialty || null,
      dateOfBirth: profile?.date_of_birth || null,
      date_of_birth: profile?.date_of_birth || null,
      condition: null,
      subscriptionTier: null,
      subscription_tier: null,
      urgentCredits: null,
      urgent_credits: null,
      trialEndsAt: null,
      trial_ends_at: null,
      notes: null,
      created_at: profile?.created_at || null,
      updated_at: profile?.updated_at || null
    } : null;

    if (!currentUserContact) return null;

    return (
      <Messages
        currentUser={currentUserContact}
        contacts={patientContacts}
        messages={messages}
        onSendMessage={handleSendMessage}
        onMarkMessagesAsRead={handleMarkMessagesAsRead}
        preselectedContactId={null}
        clearPreselectedContact={() => {}}
        onNavigateToBilling={() => {}}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SimpleHeader 
        userName={profile?.name || user?.email || 'Doctor'}
        userRole={profile?.role || 'doctor'}
        onSignOut={signOut}
      />
      
      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <DashboardIcon className="inline h-5 w-5 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'messages'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <MessagesIcon className="inline h-5 w-5 mr-2" />
              Messages
              {unreadMessagesCount > 0 && (
                <span className="ml-2 inline-block px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeView === 'dashboard' ? renderDashboard() : renderMessages()}
        </div>
      </main>

      {/* Add Patient Modal */}
      {user?.id && (
        <AddPatientModal
          isOpen={showAddPatientModal}
          onClose={handleModalClose}
          doctorId={user.id}
          onPatientAdded={handlePatientAdded}
        />
      )}
    </div>
  );
};

export default DoctorDashboardMain;