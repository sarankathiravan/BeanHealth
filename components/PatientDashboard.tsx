import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Records from "./Records";
import Upload from "./Upload";
import Messages from "./Messages";
import Billing from "./Billing";
import { View, Patient, Vitals, Medication, MedicalRecord } from "../types";
import { MedicalRecordsService } from "../services/medicalRecordsService";
import { uploadFileToSupabase, uploadFileToSupabaseSimple, checkMedicalRecordsBucket, testStorageConnection } from "../services/storageService";
import { analyzeMedicalRecord, summarizeAllRecords } from "../services/geminiService";
import StoragePolicyFix from "./StoragePolicyFix";

const PatientDashboard: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State management
  const [vitals, setVitals] = useState<Vitals>({
    bloodPressure: { value: "", unit: "mmHg", trend: "stable" },
    heartRate: { value: "", unit: "bpm", trend: "stable" },
    temperature: { value: "", unit: "°F", trend: "stable" },
  });

  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  const [aiSummary, setAiSummary] = useState(
    "Upload your first medical record to get an AI-powered health summary."
  );
  const [summaryNote, setSummaryNote] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [showPolicyFix, setShowPolicyFix] = useState(false);

  // Load medical records from database and setup storage
  useEffect(() => {
    const initializeApp = async () => {
      if (user?.id) {
        try {
          // Initialize storage
          await testStorageConnection();

          // Load existing medical records
          const records = await MedicalRecordsService.getMedicalRecordsByPatientId(user.id);
          setMedicalRecords(records);
        } catch (error) {
          console.error('Error initializing app:', error);
        }
      }
    };

    initializeApp();
  }, [user?.id]);

  // Convert auth user to app user format
  const appUser = {
    id: user?.id || profile?.id || "",
    name: profile?.name || user?.email || "User",
    email: user?.email || "",
    role: "patient" as const,
    avatarUrl:
      profile?.avatar_url ||
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.picture,
  };

  // Create patient object
  const patient: Patient = useMemo(
    () => ({
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
      role: "patient",
      dateOfBirth: profile?.date_of_birth || "1990-01-01",
      condition: profile?.condition || "General Health Monitoring",
      vitals,
      vitalsHistory: [
        {
          date: new Date().toISOString().split("T")[0],
          vitals,
        },
      ],
      medications,
      records: medicalRecords,
      doctors: [],
      chatMessages: [],
      subscriptionTier: profile?.subscription_tier as "FreeTrial" | "Paid" || "FreeTrial",
      urgentCredits: profile?.urgent_credits || 5,
      notes: summaryNote,
      avatarUrl: appUser.avatarUrl,
      trialEndsAt: profile?.trial_ends_at || new Date(Date.now() + 14 * 86400000).toISOString()
    }),
    [appUser, vitals, medications, medicalRecords, summaryNote, profile]
  );

  // Event handlers
  const handleVitalsChange = (vitalKey: keyof Vitals, newValue: string) => {
    setVitals((prev) => ({
      ...prev,
      [vitalKey]: { ...prev[vitalKey], value: newValue },
    }));
  };

  const handleMedicationAdd = (newMedication: Omit<Medication, "id">) => {
    const medication = {
      ...newMedication,
      id: Date.now().toString(),
    };
    setMedications((prev) => [...prev, medication]);
  };

  const handleMedicationChange = (updatedMedication: Medication) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === updatedMedication.id ? updatedMedication : med
      )
    );
  };

  const handleMedicationRemove = (medicationId: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== medicationId));
  };

  const handleRefreshSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const summary = await summarizeAllRecords(medicalRecords);
      setAiSummary(summary);
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setAiSummary('Unable to generate summary at this time. Please try again later.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleUpdateAvatar = (dataUrl: string) => {
    // Handle avatar update
    console.log("Avatar updated:", dataUrl);
  };

  const handleFileUpload = async (file: File, category: string) => {
    if (!user?.id) {
      alert('Please log in to upload files.');
      return;
    }

    setIsUploadLoading(true);
    try {
      // Upload file to Supabase storage
      let fileUrl: string;
      
      try {
        // Try simplified upload first (skips bucket existence check)
        fileUrl = await uploadFileToSupabaseSimple(file);
      } catch (simpleError) {
        // Fallback to full upload method
        fileUrl = await uploadFileToSupabase(file);
      }
      
      // Analyze the medical record with AI
      const analysisResult = await analyzeMedicalRecord(file);
      
      // Create the medical record in the database
      const newRecord = await MedicalRecordsService.createMedicalRecord({
        patientId: user.id,
        date: analysisResult.date,
        type: analysisResult.type,
        summary: analysisResult.summary,
        doctor: analysisResult.doctor,
        category: category,
        fileUrl: fileUrl,
      });

      // Update local state
      setMedicalRecords(prev => [newRecord, ...prev]);
      
      // Refresh AI summary with new record
      await handleRefreshSummary();
      
      alert('Medical record uploaded and analyzed successfully!');
    } catch (error) {
      console.error('Error in file upload process:', error);
      
      let errorMessage = 'Failed to upload and analyze the medical record.';
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
        
        // Check if it's an RLS policy error
        if (error.message.includes('row-level security policy') || error.message.includes('policy')) {
          setShowPolicyFix(true);
        }
      }
      
      alert(errorMessage + ' Please check the console for more details.');
    } finally {
      setIsUploadLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
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
      case "records":
        return (
          <Records
            records={patient.records}
            onRemoveRecord={async (recordId) => {
              try {
                await MedicalRecordsService.deleteMedicalRecord(recordId);
                setMedicalRecords((prev) =>
                  prev.filter((record) => record.id !== recordId)
                );
                // Refresh AI summary after removing record
                await handleRefreshSummary();
              } catch (error) {
                console.error('Error removing record:', error);
                alert('Failed to remove record. Please try again.');
              }
            }}
          />
        );
      case "upload":
        return (
          <div className="space-y-6">
            {showPolicyFix && <StoragePolicyFix />}
            <Upload
              onUpload={handleFileUpload}
              isLoading={isUploadLoading}
            />
          </div>
        );
      case "messages":
        return (
          <Messages
            currentUser={appUser}
            contacts={patient.doctors}
            messages={patient.chatMessages}
            onSendMessage={(message) => {
              console.log("Sending message:", message);
            }}
            onMarkMessagesAsRead={(contactId) => {
              console.log("Marking messages as read for:", contactId);
            }}
            preselectedContactId={null}
            clearPreselectedContact={() => {}}
            onNavigateToBilling={() => setActiveView("billing")}
          />
        );
      case "billing":
        return (
          <Billing
            patient={patient}
            onPurchaseCredits={(amount) => {
              console.log("Purchasing credits:", amount);
              // In a real app, this would handle payment processing
            }}
            onUpgradeSubscription={(tier) => {
              console.log("Upgrading subscription to:", tier);
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

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default PatientDashboard;
