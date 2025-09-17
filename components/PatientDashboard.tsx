import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Records from './Records';
import Upload from './Upload';
import Messages from './Messages';
import Billing from './Billing';
import { View, Patient, Vitals, Medication, MedicalRecord } from '../types';

const PatientDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mock data and state management
  const [vitals, setVitals] = useState<Vitals>({
    bloodPressure: { value: '120/80', unit: 'mmHg', trend: 'stable' },
    heartRate: { value: '72', unit: 'bpm', trend: 'stable' },
    temperature: { value: '98.6', unit: '°F', trend: 'stable' }
  });
  
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
    { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
    { id: '3', name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
  ]);
  
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'Lab Results',
      summary: 'Blood work showing normal glucose levels',
      doctor: 'Dr. Smith',
      category: 'Lab Work'
    },
    {
      id: '2',
      date: '2024-01-01',
      type: 'Check-up',
      summary: 'Annual physical examination - all vitals normal',
      doctor: 'Dr. Johnson',
      category: 'General'
    }
  ]);
  
  const [aiSummary, setAiSummary] = useState('Your recent vitals show stable readings. Blood pressure and heart rate are within normal ranges. Continue taking medications as prescribed.');
  const [summaryNote, setSummaryNote] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Convert auth user to app user format
  const appUser = {
    id: user?.id || profile?.id || '',
    name: profile?.first_name || user?.email || 'User',
    email: user?.email || '',
    role: 'patient' as const,
    avatarUrl: profile?.avatar_url
  };

  // Create patient object
  const patient: Patient = useMemo(() => ({
    id: appUser.id,
    name: appUser.name,
    email: appUser.email,
    role: 'patient',
    dateOfBirth: profile?.date_of_birth || '1990-01-01',
    condition: profile?.condition || 'General Health Monitoring',
    vitals,
    vitalsHistory: [{
      date: new Date().toISOString().split('T')[0],
      vitals
    }],
    medications,
    records: medicalRecords,
    doctors: [{
      id: 'doc1',
      name: 'Dr. Sarah Johnson',
      email: 'dr.johnson@clinic.com',
      role: 'doctor',
      specialty: 'Internal Medicine'
    }],
    chatMessages: [{
      id: 'msg1',
      senderId: 'doc1',
      recipientId: appUser.id,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      text: 'Hello! How are you feeling today? Please remember to take your medications as prescribed.',
      isRead: false,
      isUrgent: false
    }],
    subscriptionTier: 'FreeTrial',
    urgentCredits: 3,
    notes: summaryNote,
    avatarUrl: appUser.avatarUrl,
    trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString() // 14 days from now
  }), [appUser, vitals, medications, medicalRecords, summaryNote, profile]);

  // Event handlers
  const handleVitalsChange = (vitalKey: keyof Vitals, newValue: string) => {
    setVitals(prev => ({
      ...prev,
      [vitalKey]: { ...prev[vitalKey], value: newValue }
    }));
  };

  const handleMedicationAdd = (newMedication: Omit<Medication, 'id'>) => {
    const medication = {
      ...newMedication,
      id: Date.now().toString()
    };
    setMedications(prev => [...prev, medication]);
  };

  const handleMedicationChange = (updatedMedication: Medication) => {
    setMedications(prev => 
      prev.map(med => med.id === updatedMedication.id ? updatedMedication : med)
    );
  };

  const handleMedicationRemove = (medicationId: string) => {
    setMedications(prev => prev.filter(med => med.id !== medicationId));
  };

  const handleRefreshSummary = async () => {
    setIsSummaryLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAiSummary('Updated summary based on your latest health data. All readings continue to be stable.');
      setIsSummaryLoading(false);
    }, 2000);
  };

  const handleUpdateAvatar = (dataUrl: string) => {
    // Handle avatar update
    console.log('Avatar updated:', dataUrl);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            patient={patient}
            aiSummary={aiSummary}
            onRefreshSummary={handleRefreshSummary}
            isSummaryLoading={isSummaryLoading}
            onSummaryChange={setAiSummary}
            summaryNote={summaryNote}
            onSummaryNoteChange={setSummaryNote}
            onVitalsChange={handleVitalsChange}
            onMedicationAdd={handleMedicationAdd}
            onMedicationChange={handleMedicationChange}
            onMedicationRemove={handleMedicationRemove}
          />
        );
      case 'records':
        return (
          <Records 
            records={patient.records} 
            onRemoveRecord={(recordId) => {
              setMedicalRecords(prev => prev.filter(record => record.id !== recordId));
            }} 
          />
        );
      case 'upload':
        return (
          <Upload 
            onUpload={(file, category) => {
              // Handle file upload
              console.log('Uploading file:', file.name, 'Category:', category);
            }} 
            isLoading={false} 
          />
        );
      case 'messages':
        return (
          <Messages 
            currentUser={appUser}
            contacts={patient.doctors}
            messages={patient.chatMessages}
            onSendMessage={(message) => {
              console.log('Sending message:', message);
            }}
            onMarkMessagesAsRead={(contactId) => {
              console.log('Marking messages as read for:', contactId);
            }}
            preselectedContactId={null}
            clearPreselectedContact={() => {}}
            onNavigateToBilling={() => setActiveView('billing')}
          />
        );
      case 'billing':
        return (
          <Billing 
            patient={patient} 
            onPurchaseCredits={(amount) => {
              console.log('Purchasing credits:', amount);
              // In a real app, this would handle payment processing
            }}
            onUpgradeSubscription={(tier) => {
              console.log('Upgrading subscription to:', tier);
              // In a real app, this would handle subscription upgrade
            }}
          />
        );
      default:
        return (
          <Dashboard
            patient={patient}
            aiSummary={aiSummary}
            onRefreshSummary={handleRefreshSummary}
            isSummaryLoading={isSummaryLoading}
            onSummaryChange={setAiSummary}
            summaryNote={summaryNote}
            onSummaryNoteChange={setSummaryNote}
            onVitalsChange={handleVitalsChange}
            onMedicationAdd={handleMedicationAdd}
            onMedicationChange={handleMedicationChange}
            onMedicationRemove={handleMedicationRemove}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900 bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={appUser}
          onLogout={signOut}
          onMenuClick={() => setSidebarOpen(true)}
          onUpdateAvatar={handleUpdateAvatar}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;