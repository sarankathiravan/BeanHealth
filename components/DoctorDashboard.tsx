import React from 'react';
import { Patient, Vitals, Medication, MedicalRecord } from '../types';
import { getInitials, getInitialsColor } from '../utils/avatarUtils';
import { UserIcon } from './icons/UserIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { MessagesIcon } from './icons/MessagesIcon';
import { AlertIcon } from './icons/AlertIcon';

interface DoctorDashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ patients, onSelectPatient, onAddPatient }) => {
  // --- Calculate stats ---
  const activePatientsCount = patients.length;

  const patientIds = new Set(patients.map(p => p.id));
  const allMessages = patients.flatMap(p => p.chatMessages);
  
  // Count unread messages sent by patients
  const newMessagesCount = allMessages.filter(msg => patientIds.has(msg.senderId) && !msg.isRead).length;

  // Count patients who have sent an unread urgent message
  const urgentCasesCount = patients.filter(patient =>
      patient.chatMessages.some(msg => patientIds.has(msg.senderId) && msg.isUrgent && !msg.isRead)
  ).length;

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Doctor's Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400">Overview of your assigned patients.</p>
            </div>
            <button 
                onClick={onAddPatient}
                className="flex items-center justify-center mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add New Patient
            </button>
       </div>

       {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                    <UserIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active Patients</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{activePatientsCount}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
                <div className="bg-sky-100 dark:bg-sky-900/50 p-3 rounded-full">
                    <MessagesIcon className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">New Messages</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{newMessagesCount}</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex items-center space-x-4">
                <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full">
                    <AlertIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Urgent Cases</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{urgentCasesCount}</p>
                </div>
            </div>
        </div>

      {/* Patient List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="p-4 sm:p-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Patient Roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Condition</th>
                <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Last BP</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Patient ID</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {patients.map(patient => (
                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 ${getInitialsColor(patient.name, patient.email)} rounded-full flex items-center justify-center`}>
                              <span className="text-white text-sm font-medium">
                                {getInitials(patient.name, patient.email)}
                              </span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{patient.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{patient.condition}</td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{patient.vitals.bloodPressure.value} {patient.vitals.bloodPressure.unit}</td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-slate-400">{patient.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onSelectPatient(patient)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
