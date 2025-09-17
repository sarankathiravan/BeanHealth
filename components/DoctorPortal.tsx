import React, { useState } from 'react';
import { Patient, Vitals, Medication, MedicalRecord, DoctorPortalView, ChatMessage, User } from '../types';
import DoctorDashboard from './DoctorDashboard';
import PatientProfileForDoctor from './PatientProfileForDoctor';
import Messages from './Messages';

interface DoctorPortalProps {
    activeView: DoctorPortalView;
    currentUser: User;
    patients: Patient[];
    onAddPatient: () => void;
    handlers: {
        onVitalsChange: (patientId: string, vitalKey: keyof Vitals, newValue: string) => void;
        onMedicationChange: (patientId: string, medication: Medication) => void;
        onMedicationRemove: (patientId: string, medicationId: string) => void;
        onMedicationAdd: (patientId: string, medication: Omit<Medication, 'id'>) => void;
        onRemoveRecord: (patientId: string, recordId: string) => void;
        onRefreshSummary: (patientId: string, records: MedicalRecord[]) => void;
        onSummaryChange: (patientId: string, newSummary: string) => void;
        onSummaryNoteChange: (patientId: string, newNote: string) => void;
        onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp' | 'isRead'>) => void;
        onMarkMessagesAsRead: (patientId: string) => void;
        onPatientNotesChange: (patientId: string, newNotes: string) => void;
    };
    aiSummaries: Record<string, string>;
    summaryNotes: Record<string, string>;
    isSummaryLoading: Record<string, boolean>;
}

const DoctorPortal: React.FC<DoctorPortalProps> = (props) => {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient);
    };

    const handleBackToDashboard = () => {
        setSelectedPatient(null);
    };

    if (selectedPatient) {
        return (
            <PatientProfileForDoctor 
                patient={selectedPatient}
                onBack={handleBackToDashboard}
                {...props}
            />
        );
    }

    switch(props.activeView) {
        case 'dashboard':
            return (
                <DoctorDashboard 
                    patients={props.patients}
                    onSelectPatient={handleSelectPatient}
                    onAddPatient={props.onAddPatient}
                />
            );
        case 'messages':
            const allMessages = props.patients.flatMap(p => p.chatMessages);
            return (
                <Messages 
                    currentUser={props.currentUser}
                    contacts={props.patients}
                    messages={allMessages}
                    onSendMessage={props.handlers.onSendMessage}
                    onMarkMessagesAsRead={(patientId) => props.handlers.onMarkMessagesAsRead(patientId)}
                    preselectedContactId={null}
                    clearPreselectedContact={() => {}}
                    // FIX: Added the missing 'onNavigateToBilling' prop to satisfy the Messages component's interface. A no-op function is sufficient as this feature is not used by doctors.
                    onNavigateToBilling={() => {}}
                />
            )
        default:
            return null;
    }
};

export default DoctorPortal;