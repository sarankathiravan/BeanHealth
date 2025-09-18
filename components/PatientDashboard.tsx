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
import { uploadFileToSupabase, uploadFileToSupabaseSimple, checkMedicalRecordsBucket, testStorageConnection, deleteFileFromSupabase } from "../services/storageService";
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
          
          // Generate initial AI summary if records exist
          if (records.length > 0) {
            setIsSummaryLoading(true);
            try {
              const summary = await summarizeAllRecords(records);
              setAiSummary(summary);
            } catch (error) {
              console.error('Error generating initial AI summary:', error);
            } finally {
              setIsSummaryLoading(false);
            }
          }
        } catch (error) {
          console.error('Error initializing app:', error);
        }
      }
    };

    initializeApp();
  }, [user?.id]);

  // Auto-refresh AI summary when records change (debounced)
  useEffect(() => {
    if (medicalRecords.length === 0) {
      setAiSummary("Upload your first medical record to get an AI-powered health summary.");
      return;
    }

    // Debounce the summary generation to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      if (!isSummaryLoading) {
        setIsSummaryLoading(true);
        try {
          const summary = await summarizeAllRecords(medicalRecords);
          setAiSummary(summary);
        } catch (error) {
          console.error('Error auto-refreshing AI summary:', error);
        } finally {
          setIsSummaryLoading(false);
        }
      }
    }, 1000); // Wait 1 second after records change

    return () => clearTimeout(timeoutId);
  }, [medicalRecords.length]); // Only trigger when the number of records changes

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
    if (isSummaryLoading) {
      console.log('Summary generation already in progress, skipping...');
      return;
    }
    
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
    console.log('Starting optimized file upload process...');
    
    try {
      // Start file upload and AI analysis in parallel for faster processing
      const uploadPromise = (async () => {
        try {
          // Try simplified upload first (skips bucket existence check)
          return await uploadFileToSupabaseSimple(file);
        } catch (simpleError) {
          console.log('Simplified upload failed, trying full upload method...');
          // Fallback to full upload method
          return await uploadFileToSupabase(file);
        }
      })();
      
      const analysisPromise = analyzeMedicalRecord(file);
      
      // Wait for both operations to complete
      console.log('Running upload and analysis in parallel...');
      const [fileUrl, analysisResult] = await Promise.all([uploadPromise, analysisPromise]);
      
      console.log('Upload and analysis completed, creating database record...');
      
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

      // Update local state with the new record
      const updatedRecords = [newRecord, ...medicalRecords];
      setMedicalRecords(updatedRecords);
      
      // Generate AI summary with the updated records immediately
      console.log('Generating AI summary for updated records...');
      setIsSummaryLoading(true);
      
      try {
        const summary = await summarizeAllRecords(updatedRecords);
        setAiSummary(summary);
      } catch (summaryError) {
        console.error('Error generating AI summary:', summaryError);
        // Don't fail the entire upload if summary generation fails
        setAiSummary('Record uploaded successfully. Summary will be updated shortly.');
      } finally {
        setIsSummaryLoading(false);
      }
      
      // Switch to records view to show the new record
      setActiveView("records");
      
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
                // Delete the record and get the file URL
                const fileUrl = await MedicalRecordsService.deleteMedicalRecord(recordId);
                
                // Delete the file from storage if it exists
                if (fileUrl) {
                  const storageDeleted = await deleteFileFromSupabase(fileUrl);
                  if (!storageDeleted) {
                    console.warn('Record deleted from database but file may still exist in storage');
                  }
                }
                
                // Update local state
                setMedicalRecords((prev) =>
                  prev.filter((record) => record.id !== recordId)
                );
                
                // Refresh AI summary after removing record (only if there are remaining records)
                const remainingRecords = medicalRecords.filter((record) => record.id !== recordId);
                if (remainingRecords.length > 0) {
                  // Use the remaining records directly to avoid state delay
                  const summary = await summarizeAllRecords(remainingRecords);
                  setAiSummary(summary);
                } else {
                  setAiSummary("Upload your first medical record to get an AI-powered health summary.");
                }
                
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
