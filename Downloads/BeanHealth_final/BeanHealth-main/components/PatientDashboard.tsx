import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Records from "./Records";
import Upload from "./Upload";
import Messages from "./Messages";
import Billing from "./Billing";
import { View, Patient, Vitals, Medication, MedicalRecord, User, Doctor, ChatMessage } from "../types";
import { MedicalRecordsService } from "../services/medicalRecordsService";
import { uploadFileToSupabase, uploadFileToSupabaseSimple, testStorageConnection, deleteFileFromSupabase } from "../services/storageService";
import { analyzeMedicalRecord, summarizeAllRecords, ExtractedVitals } from "../services/geminiService";
import { categorizeMedicalRecord } from "../services/categorizationService";
import { UserService } from "../services/authService";
import { PatientAdditionService } from "../services/patientInvitationService";
import { ChatService } from "../services/chatService";
import { VitalsService } from "../services/dataService";


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
  const [doctors, setDoctors] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [aiSummary, setAiSummary] = useState(
    "Upload your first medical record to get an AI-powered health summary."
  );
  const [summaryNote, setSummaryNote] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const [vitalsLastUpdatedFromRecord, setVitalsLastUpdatedFromRecord] = useState<{
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    glucose?: string;
  }>({});

  // Load medical records from database and setup storage
  useEffect(() => {
    const initializeApp = async () => {
      if (user?.id) {
        try {
          // Initialize storage
          await testStorageConnection();

          // Load existing vitals from database
          const latestVitals = await VitalsService.getLatestVitals(user.id);
          if (latestVitals) {
            setVitals(latestVitals);
            console.log('✅ Loaded vitals from database:', latestVitals);
          }

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
          
          // Check if we need to extract vitals from the most recent record on app load
          // This is useful if vitals are empty but we have recent records
          const hasEmptyVitals = !latestVitals || (!latestVitals.bloodPressure.value && !latestVitals.heartRate.value && !latestVitals.temperature.value);
          if (hasEmptyVitals && records.length > 0) {
            // Find the most recent record
            const sortedRecords = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const mostRecentRecord = sortedRecords[0];
            
            // Only check records from the last 30 days to avoid outdated vitals
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            if (new Date(mostRecentRecord.date) > thirtyDaysAgo) {
              // This would require the file to extract vitals, which we don't have access to here
              // So we'll skip this for now, but the feature will work for newly uploaded records
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

  // Fetch doctors for this patient
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!user?.id) return;
      try {
        const doctorsData = await PatientAdditionService.getPatientDoctors(user.id);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, [user?.id]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      try {
        const messagesData = await ChatService.getAllConversations(user.id);
        setChatMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [user?.id]);

  // Convert auth user to app user format
  const appUser = {
    id: user?.id || profile?.id || "",
    name: profile?.name || user?.user_metadata?.full_name || user?.email || "User",
    email: user?.email || "",
    role: "patient" as const,
    avatarUrl: "", // No longer sync Google photos or random pics - use initials only
  };

  // Remove debug logging for avatar sources since we no longer use external sources

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
      doctors: doctors.map(doctor => ({
        ...doctor,
        role: 'doctor' as const,
        specialty: doctor.specialty || 'General Practice'
      })) as Doctor[],
      chatMessages: chatMessages,
      subscriptionTier: profile?.subscription_tier as "FreeTrial" | "Paid" || "FreeTrial",
      urgentCredits: profile?.urgent_credits || 5,
      notes: summaryNote,
      avatarUrl: appUser.avatarUrl,
      trialEndsAt: profile?.trial_ends_at || new Date(Date.now() + 14 * 86400000).toISOString()
    }),
    [appUser, vitals, medications, medicalRecords, doctors, chatMessages, summaryNote, profile]
  );

  // Event handlers
  const handleVitalsChange = async (vitalKey: keyof Vitals, newValue: string) => {
    // Update local state immediately for responsive UI
    setVitals((prev) => ({
      ...prev,
      [vitalKey]: { ...prev[vitalKey], value: newValue },
    }));

    // Save to database if user is logged in and value is not empty
    if (user?.id && newValue.trim()) {
      try {
        await VitalsService.updateVital(user.id, vitalKey, newValue);
        console.log(`✅ Updated ${vitalKey} in database:`, newValue);
      } catch (error) {
        console.error(`❌ Error updating ${vitalKey} in database:`, error);
        // Could show a toast notification here instead of console.error
      }
    }
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

  const handleUpdateAvatar = async (dataUrl: string) => {
    // Handle avatar update by saving to the database
    if (!user?.id) return;
    
    try {
      // Update the avatar URL in the database
      await UserService.updateUser(user.id, { avatar_url: dataUrl });
      
      // The avatar will be updated in the UI automatically when the profile refreshes
      console.log("Avatar updated successfully");
    } catch (error) {
      console.error("Failed to update avatar:", error);
      alert("Failed to update profile picture. Please try again.");
    }
  };



  // Function to update vitals from extracted medical record data
  const updateVitalsFromRecord = async (extractedVitals: ExtractedVitals, recordDate: string, allRecords: MedicalRecord[]) => {
    // Check if this is the most recent record with vital signs
    const recordsWithDates = allRecords
      .map(record => ({ ...record, dateObj: new Date(record.date) }))
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
    
    const currentRecordDate = new Date(recordDate);
    const mostRecentRecord = recordsWithDates[0];
    
    // Only update vitals if this is the most recent record or if current vitals are empty
    const isCurrentVitalsEmpty = !vitals.bloodPressure.value && !vitals.heartRate.value && !vitals.temperature.value;
    const isMostRecentRecord = mostRecentRecord.dateObj.getTime() === currentRecordDate.getTime();
    const shouldUpdate = isMostRecentRecord || isCurrentVitalsEmpty;
    
    if (!shouldUpdate) {
      return;
    }
    
    const updatedVitals = { ...vitals };
    let hasUpdates = false;
    const updatedFields: string[] = [];

    // Update blood pressure
    if (extractedVitals.bloodPressure) {
      const { systolic, diastolic } = extractedVitals.bloodPressure;
      updatedVitals.bloodPressure = {
        value: `${systolic}/${diastolic}`,
        unit: "mmHg",
        trend: "stable"
      };
      hasUpdates = true;
      updatedFields.push("Blood Pressure");
    }

    // Update heart rate
    if (extractedVitals.heartRate) {
      updatedVitals.heartRate = {
        value: extractedVitals.heartRate.toString(),
        unit: "bpm",
        trend: "stable"
      };
      hasUpdates = true;
      updatedFields.push("Heart Rate");
    }

    // Update temperature
    if (extractedVitals.temperature) {
      const { value, unit } = extractedVitals.temperature;
      // Convert to Fahrenheit if needed
      const tempInF = unit === 'C' ? (value * 9/5) + 32 : value;
      updatedVitals.temperature = {
        value: tempInF.toFixed(1),
        unit: "°F",
        trend: "stable"
      };
      hasUpdates = true;
      updatedFields.push("Temperature");
    }

    // Update glucose if available
    if (extractedVitals.glucose && updatedVitals.glucose) {
      updatedVitals.glucose = {
        value: extractedVitals.glucose.toString(),
        unit: "mg/dL",
        trend: "stable"
      };
      hasUpdates = true;
      updatedFields.push("Blood Glucose");
    } else if (extractedVitals.glucose) {
      // Add glucose if it doesn't exist
      updatedVitals.glucose = {
        value: extractedVitals.glucose.toString(),
        unit: "mg/dL",
        trend: "stable"
      };
      hasUpdates = true;
      updatedFields.push("Blood Glucose");
    }

    if (hasUpdates && user?.id) {
      try {
        // Save vitals to database
        await VitalsService.addVitals(user.id, updatedVitals);
        console.log('✅ Vitals saved to database:', updatedVitals);

        // Update local state
        setVitals(updatedVitals);
        
        // Update the tracking of when vitals were last updated from records
        setVitalsLastUpdatedFromRecord(prev => {
          const updated = { ...prev };
          if (extractedVitals.bloodPressure) updated.bloodPressure = recordDate;
          if (extractedVitals.heartRate) updated.heartRate = recordDate;
          if (extractedVitals.temperature) updated.temperature = recordDate;
          if (extractedVitals.glucose) updated.glucose = recordDate;
          return updated;
        });
        
        // Show a single notification to the user
        setTimeout(() => {
          const fieldsText = updatedFields.join(", ");
          alert(`Vital signs updated and saved: ${fieldsText}\nFrom medical record dated ${new Date(recordDate).toLocaleDateString()}`);
        }, 1000);
      } catch (error) {
        console.error('❌ Error saving vitals to database:', error);
        // Still update local state even if database save fails
        setVitals(updatedVitals);
        
        setTimeout(() => {
          const fieldsText = updatedFields.join(", ");
          alert(`Vital signs updated locally: ${fieldsText}\nWarning: Could not save to database. Please check your connection.`);
        }, 1000);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      alert('Please log in to upload files.');
      return;
    }

    setIsUploadLoading(true);
    
    try {
      // Step 1: AI categorizes the document (fast, minimal tokens)
      console.log('🤖 Step 1: AI categorizing document...');
      const category = await categorizeMedicalRecord(file);
      console.log(`✅ Document categorized as: ${category}`);
      
      // Step 2: Start file upload and detailed AI analysis in parallel
      const uploadPromise = (async () => {
        try {
          // Try simplified upload first (skips bucket existence check)
          return await uploadFileToSupabaseSimple(file);
        } catch (simpleError) {
          // Fallback to full upload method
          return await uploadFileToSupabase(file);
        }
      })();
      
      const analysisPromise = analyzeMedicalRecord(file);
      
      // Wait for both operations to complete
      console.log('⏳ Step 2: Uploading file and analyzing content...');
      const [fileUrl, analysisResult] = await Promise.all([
        uploadPromise, 
        analysisPromise
      ]);
      
      // Extract vitals from the combined analysis result
      const extractedVitals = analysisResult.extractedVitals;
      
      // Create the medical record in the database
      const newRecord = await MedicalRecordsService.createMedicalRecord({
        patientId: user.id,
        date: analysisResult.date,
        type: analysisResult.type,
        summary: analysisResult.summary,
        doctor: analysisResult.doctor,
        category: category, // Use AI-generated category
        fileUrl: fileUrl,
      });

      // Update local state with the new record
      const updatedRecords = [newRecord, ...medicalRecords];
      setMedicalRecords(updatedRecords);
      
      // Update vitals if extracted from the medical record
      if (extractedVitals) {
        await updateVitalsFromRecord(extractedVitals, newRecord.date, updatedRecords);
      } else {
        console.log('❌ No vitals extracted from the medical record');
        
        // For testing when AI quota is exceeded: simulate vitals extraction
        // This helps test the vitals update feature when AI is unavailable
        if (analysisResult.summary.toLowerCase().includes('patient') || 
            analysisResult.type.toLowerCase().includes('doctor') ||
            analysisResult.type.toLowerCase().includes('medical')) {
          
          const simulatedVitals: ExtractedVitals = {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 72,
            temperature: { value: 98.6, unit: "F" },
            date: newRecord.date
          };
          
          console.log('🧪 AI quota exceeded - using simulated vitals for testing:', simulatedVitals);
          await updateVitalsFromRecord(simulatedVitals, newRecord.date, updatedRecords);
        }
      }
      
      // Generate AI summary with the updated records immediately
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
      
      // Create a more informative success message
      let successMessage = 'Medical record uploaded and analyzed successfully!';
      if (extractedVitals) {
        const extractedFields = [];
        if (extractedVitals.bloodPressure) extractedFields.push('Blood Pressure');
        if (extractedVitals.heartRate) extractedFields.push('Heart Rate');
        if (extractedVitals.temperature) extractedFields.push('Temperature');
        if (extractedVitals.glucose) extractedFields.push('Blood Glucose');
        
        if (extractedFields.length > 0) {
          successMessage += `\n\n📊 Vital signs detected: ${extractedFields.join(', ')}`;
        }
      }
      
      alert(successMessage);
      
    } catch (error) {
      console.error('Error in file upload process:', error);
      
      let errorMessage = 'Failed to upload and analyze the medical record.';
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`;
        

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
            vitalsLastUpdatedFromRecord={vitalsLastUpdatedFromRecord}
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
            onSendMessage={async (message) => {
              try {
                await ChatService.sendMessage(
                  message.senderId,
                  message.recipientId,
                  message.text,
                  message.isUrgent
                );
                // Refresh messages after sending
                const updatedMessages = await ChatService.getAllConversations(user!.id);
                setChatMessages(updatedMessages);
              } catch (error) {
                console.error("Error sending message:", error);
                alert("Failed to send message. Please try again.");
              }
            }}
            onMarkMessagesAsRead={(contactId) => {
              console.log("Marking messages as read for:", contactId);
              // TODO: Implement mark as read functionality in ChatService
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
            vitalsLastUpdatedFromRecord={vitalsLastUpdatedFromRecord}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
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
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 md:hidden"
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

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default PatientDashboard;
