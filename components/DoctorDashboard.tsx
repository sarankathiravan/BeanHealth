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
    <div className="space-y-8 animate-fadeIn">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Doctor's Dashboard</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Overview of your assigned patients.</p>
            </div>
            <button 
                onClick={onAddPatient}
                className="btn-primary flex items-center justify-center mt-4 md:mt-0"
            >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add New Patient
            </button>
       </div>

       {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card group hover-lift">
                <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-sky-400 to-indigo-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <UserIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Patients</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">{activePatientsCount}</p>
                    </div>
                </div>
            </div>
            <div className="card group hover-lift">
                <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <MessagesIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">New Messages</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">{newMessagesCount}</p>
                    </div>
                </div>
            </div>
            <div className="card group hover-lift">
                <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                        <AlertIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Urgent Cases</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">{urgentCasesCount}</p>
                    </div>
                </div>
            </div>
        </div>

      {/* Patient List */}
      <div className="card">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Patient Roster</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage and view your assigned patients</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Condition</th>
                <th scope="col" className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last BP</th>
                <th scope="col" className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Patient ID</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {patients.map((patient, index) => (
                <tr key={patient.id} className="hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 transition-all duration-200 group animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className={`h-12 w-12 ${getInitialsColor(patient.name, patient.email)} rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110`}>
                              <span className="text-white text-sm font-bold">
                                {getInitials(patient.name, patient.email)}
                              </span>
                            </div>
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{patient.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</div>
                        </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 text-sky-700 dark:text-sky-300">
                      {patient.condition}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{patient.vitals.bloodPressure.value}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{patient.vitals.bloodPressure.unit}</span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 dark:text-slate-400">{patient.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onSelectPatient(patient)} 
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      View Profile
                    </button>
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
