import React, { createContext, useContext, useEffect, useState } from 'react'
import { Patient, Doctor, ChatMessage, Vitals, Medication, MedicalRecord } from '../types'
import { VitalsService, MedicationService, MedicalRecordService } from '../services/dataService'
import { ChatService } from '../services/chatService'
import { UserService } from '../services/authService'
import { useAuth } from './AuthContext'

interface DataContextType {
  // Patient data
  currentPatient: Patient | null
  patients: Patient[]
  doctors: Doctor[]
  
  // Loading states
  loading: boolean
  
  // Patient data methods
  refreshPatientData: () => Promise<void>
  updateVitals: (vitalType: keyof Vitals, value: string) => Promise<void>
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>
  updateMedication: (medication: Medication) => Promise<void>
  removeMedication: (medicationId: string) => Promise<void>
  addMedicalRecord: (record: Omit<MedicalRecord, 'id'>) => Promise<void>
  removeMedicalRecord: (recordId: string) => Promise<void>
  
  // Chat methods
  messages: ChatMessage[]
  sendMessage: (recipientId: string, text: string, isUrgent?: boolean) => Promise<void>
  markMessageAsRead: (messageId: string) => Promise<void>
  loadConversation: (otherUserId: string) => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth()
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  // Load initial data when user logs in
  useEffect(() => {
    if (user && profile) {
      loadInitialData()
    } else {
      // Clear data when user logs out
      setCurrentPatient(null)
      setPatients([])
      setDoctors([])
      setMessages([])
    }
  }, [user, profile])

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (user) {
      const subscription = ChatService.subscribeToMessages(user.id, (newMessage) => {
        setMessages(prev => [...prev, newMessage])
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const loadInitialData = async () => {
    if (!profile) return

    setLoading(true)
    try {
      if (profile.role === 'patient') {
        await loadPatientData(profile.id)
      } else if (profile.role === 'doctor') {
        await loadDoctorData(profile.id)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPatientData = async (patientId: string) => {
    try {
      // Load patient vitals, medications, and records
      const [vitalsHistory, medications, records, allMessages] = await Promise.all([
        VitalsService.getPatientVitals(patientId),
        MedicationService.getPatientMedications(patientId),
        MedicalRecordService.getPatientRecords(patientId),
        ChatService.getAllConversations(patientId)
      ])

      // Get latest vitals
      const latestVitals = await VitalsService.getLatestVitals(patientId)

      // Get patient's doctors from relationships
      // Note: This would need to be implemented in the UserService
      const patientDoctors: Doctor[] = [] // TODO: Implement doctor relationships

      const patient: Patient = {
        ...profile!,
        role: 'patient',
        dateOfBirth: profile!.date_of_birth || '',
        condition: profile!.condition || '',
        vitals: latestVitals || {
          bloodPressure: { value: '', unit: 'mmHg', trend: 'stable' },
          heartRate: { value: '', unit: 'bpm', trend: 'stable' },
          temperature: { value: '', unit: '°F', trend: 'stable' }
        },
        vitalsHistory,
        medications,
        records,
        doctors: patientDoctors,
        chatMessages: allMessages,
        subscriptionTier: (profile!.subscription_tier as 'FreeTrial' | 'Paid') || 'FreeTrial',
        urgentCredits: profile!.urgent_credits || 0,
        notes: profile!.notes || ''
      }

      setCurrentPatient(patient)
      setMessages(allMessages)
    } catch (error) {
      console.error('Error loading patient data:', error)
    }
  }

  const loadDoctorData = async (doctorId: string) => {
    try {
      // Load doctor's patients
      const doctorPatients = await UserService.getPatientsByDoctorId(doctorId)
      setPatients(doctorPatients)

      // Load all conversations for the doctor
      const allMessages = await ChatService.getAllConversations(doctorId)
      setMessages(allMessages)
    } catch (error) {
      console.error('Error loading doctor data:', error)
    }
  }

  const refreshPatientData = async () => {
    if (profile && profile.role === 'patient') {
      await loadPatientData(profile.id)
    }
  }

  const updateVitals = async (vitalType: keyof Vitals, value: string) => {
    if (!currentPatient) return

    try {
      await VitalsService.updateVital(currentPatient.id, vitalType, value)
      await refreshPatientData()
    } catch (error) {
      console.error('Error updating vitals:', error)
      throw error
    }
  }

  const addMedication = async (medication: Omit<Medication, 'id'>) => {
    if (!currentPatient) return

    try {
      await MedicationService.addMedication(currentPatient.id, medication)
      await refreshPatientData()
    } catch (error) {
      console.error('Error adding medication:', error)
      throw error
    }
  }

  const updateMedication = async (medication: Medication) => {
    try {
      await MedicationService.updateMedication(medication.id, medication)
      await refreshPatientData()
    } catch (error) {
      console.error('Error updating medication:', error)
      throw error
    }
  }

  const removeMedication = async (medicationId: string) => {
    try {
      await MedicationService.removeMedication(medicationId)
      await refreshPatientData()
    } catch (error) {
      console.error('Error removing medication:', error)
      throw error
    }
  }

  const addMedicalRecord = async (record: Omit<MedicalRecord, 'id'>) => {
    if (!currentPatient) return

    try {
      await MedicalRecordService.addMedicalRecord(currentPatient.id, record)
      await refreshPatientData()
    } catch (error) {
      console.error('Error adding medical record:', error)
      throw error
    }
  }

  const removeMedicalRecord = async (recordId: string) => {
    try {
      await MedicalRecordService.removeMedicalRecord(recordId)
      await refreshPatientData()
    } catch (error) {
      console.error('Error removing medical record:', error)
      throw error
    }
  }

  const sendMessage = async (recipientId: string, text: string, isUrgent: boolean = false) => {
    if (!user) return

    try {
      const newMessage = await ChatService.sendMessage(user.id, recipientId, text, isUrgent)
      setMessages(prev => [...prev, newMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      await ChatService.markMessageAsRead(messageId)
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      )
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  const loadConversation = async (otherUserId: string) => {
    if (!user) return

    try {
      const conversation = await ChatService.getConversation(user.id, otherUserId)
      setMessages(conversation)
    } catch (error) {
      console.error('Error loading conversation:', error)
      throw error
    }
  }

  const value = {
    currentPatient,
    patients,
    doctors,
    loading,
    refreshPatientData,
    updateVitals,
    addMedication,
    updateMedication,
    removeMedication,
    addMedicalRecord,
    removeMedicalRecord,
    messages,
    sendMessage,
    markMessageAsRead,
    loadConversation,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}