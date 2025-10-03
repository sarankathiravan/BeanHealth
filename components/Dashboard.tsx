import React, { useState, useRef, useEffect } from 'react';
import { Patient, Vitals, Medication } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import MedicationCard from './MedicationCard';
import MedicationTimeline from './MedicationTimeline';
import { RefreshIcon } from './icons/RefreshIcon';
import { NotesIcon } from './icons/NotesIcon';
import { EditIcon } from './icons/EditIcon';
import { BloodPressureIcon } from './icons/BloodPressureIcon';
import { TemperatureIcon } from './icons/TemperatureIcon';
import { FeatureVitalsIcon } from './icons/FeatureVitalsIcon';

interface DashboardProps {
  patient: Patient;
  aiSummary: string;
  onRefreshSummary: () => void;
  isSummaryLoading: boolean;
  onSummaryChange: (newSummary: string) => void;
  summaryNote: string;
  onSummaryNoteChange: (newNote: string) => void;
  onVitalsChange: (vitalKey: keyof Vitals, newValue: string) => Promise<void>;
  onMedicationChange: (medication: Medication) => void;
  onMedicationRemove: (medicationId: string) => void;
  onMedicationAdd: (medication: Omit<Medication, 'id'>) => void;
  vitalsLastUpdatedFromRecord?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    glucose?: string;
  };
}

const VitalCard: React.FC<{
  icon: React.ReactNode;
  iconBgColor: string;
  label: string;
  value: string;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  onSave: (newValue: string) => void;
  lastUpdatedFromRecord?: string; // Date when this vital was last updated from a medical record
}> = ({ icon, iconBgColor, label, value, unit, trend, onSave, lastUpdatedFromRecord }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const trendArrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendColor = trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-blue-500' : 'text-slate-500';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    if (currentValue.trim() !== '') {
        onSave(currentValue);
    } else {
        setCurrentValue(value); // Reset if empty
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSave();
    } else if (e.key === 'Escape') {
        setCurrentValue(value);
        setIsEditing(false);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-sky-500/5 to-indigo-600/5 rounded-2xl transition-opacity duration-300"></div>
      <div className="relative flex items-start">
        <div className={`p-4 rounded-xl mr-4 ${iconBgColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">{label}</p>
          {isEditing ? (
              <input 
                  ref={inputRef}
                  type="text"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-3xl font-bold text-slate-900 dark:text-slate-100 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
          ) : (
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                <span className="ml-2 text-lg font-medium text-slate-500 dark:text-slate-400">{unit}</span>
              </div>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${trendColor === 'text-red-500' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : trendColor === 'text-blue-500' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'}`}>
                {trendArrow} Stable
              </span>
            </div>
          )}
          {lastUpdatedFromRecord && (
            <div className="mt-3 inline-flex items-center px-3 py-1 bg-sky-50 dark:bg-sky-900/20 rounded-full">
              <svg className="w-3 h-3 mr-1.5 text-sky-600 dark:text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">Auto-updated</span>
            </div>
          )}
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:scale-110 active:scale-95 transition-all duration-200"
          >
              <EditIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ 
    patient, 
    aiSummary, 
    onRefreshSummary, 
    isSummaryLoading, 
    onSummaryChange, 
    summaryNote, 
    onSummaryNoteChange,
    onVitalsChange,
    onMedicationAdd,
    onMedicationChange,
    onMedicationRemove,
    vitalsLastUpdatedFromRecord
}) => {
  return (
    <div className="space-y-8 p-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-600 rounded-3xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Your Health Dashboard</h2>
          <p className="text-sky-50 text-lg">Track your vitals, medications, and health insights all in one place</p>
        </div>
      </div>
      
      {/* Vitals Section */}
      <div>
        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mb-6">Health Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <VitalCard 
            label="Blood Pressure" 
            value={patient.vitals.bloodPressure.value} 
            unit={patient.vitals.bloodPressure.unit} 
            trend={patient.vitals.bloodPressure.trend} 
            onSave={(newValue) => onVitalsChange('bloodPressure', newValue)}
            icon={<BloodPressureIcon className="h-7 w-7 text-red-600" />}
            iconBgColor="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50"
            lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.bloodPressure}
          />
          <VitalCard 
            label="Heart Rate" 
            value={patient.vitals.heartRate.value} 
            unit={patient.vitals.heartRate.unit} 
            trend={patient.vitals.heartRate.trend} 
            onSave={(newValue) => onVitalsChange('heartRate', newValue)}
            icon={<FeatureVitalsIcon className="h-7 w-7 text-sky-600" />}
            iconBgColor="bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/50 dark:to-sky-800/50"
            lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.heartRate}
          />
          <VitalCard 
            label="Temperature" 
            value={patient.vitals.temperature.value} 
            unit={patient.vitals.temperature.unit} 
            trend={patient.vitals.temperature.trend} 
            onSave={(newValue) => onVitalsChange('temperature', newValue)}
            icon={<TemperatureIcon className="h-7 w-7 text-orange-600" />}
            iconBgColor="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50"
            lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.temperature}
          />
        </div>
      </div>

      {/* Health Summary Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3 shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white"/>
                </div>
                AI Health Summary
            </h3>
            <button 
              onClick={onRefreshSummary}
              disabled={isSummaryLoading}
              className="flex items-center px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              <RefreshIcon className={`h-4 w-4 mr-2 ${isSummaryLoading ? 'animate-spin' : ''}`} />
              {isSummaryLoading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
        <textarea
            value={aiSummary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="w-full h-32 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="AI summary will appear here..."
            aria-label="AI Health Summary"
        />

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-lg font-display font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center">
              <NotesIcon className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400"/>
              My Notes
            </h4>
            <textarea
              value={summaryNote}
              onChange={(e) => onSummaryNoteChange(e.target.value)}
              className="w-full h-24 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
              placeholder="Add your thoughts or questions about the summary..."
              aria-label="Personal notes on AI summary"
            />
        </div>
      </div>
      
      {/* Medication Section */}
      <div>
        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mb-6">Medications</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MedicationCard 
              medications={patient.medications} 
              onAdd={onMedicationAdd}
              onChange={onMedicationChange}
              onRemove={onMedicationRemove}
          />
          <MedicationTimeline medications={patient.medications} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;