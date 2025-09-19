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
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-start group">
      <div className={`p-3 rounded-lg mr-4 ${iconBgColor}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        {isEditing ? (
            <input 
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-2/3 bg-slate-100 dark:bg-slate-700 text-2xl font-bold text-slate-800 dark:text-slate-100 p-1 rounded-md"
            />
        ) : (
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value} <span className="text-base font-normal text-slate-500 dark:text-slate-400">{unit}</span></p>
        )}
        {trend && <p className={`text-sm font-semibold ${trendColor}`}>{trendArrow} Stable</p>}
        {lastUpdatedFromRecord && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Updated from record
          </p>
        )}
      </div>
       {!isEditing && (
        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <EditIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </button>
       )}
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
    <div className="space-y-8">
      {/* Vitals Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <VitalCard 
          label="Blood Pressure" 
          value={patient.vitals.bloodPressure.value} 
          unit={patient.vitals.bloodPressure.unit} 
          trend={patient.vitals.bloodPressure.trend} 
          onSave={(newValue) => onVitalsChange('bloodPressure', newValue)}
          icon={<BloodPressureIcon className="h-6 w-6 text-red-600" />}
          iconBgColor="bg-red-100 dark:bg-red-900/50"
          lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.bloodPressure}
        />
        <VitalCard 
          label="Heart Rate" 
          value={patient.vitals.heartRate.value} 
          unit={patient.vitals.heartRate.unit} 
          trend={patient.vitals.heartRate.trend} 
          onSave={(newValue) => onVitalsChange('heartRate', newValue)}
          icon={<FeatureVitalsIcon className="h-6 w-6 text-sky-600" />}
          iconBgColor="bg-sky-100 dark:bg-sky-900/50"
          lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.heartRate}
        />
        <VitalCard 
          label="Temperature" 
          value={patient.vitals.temperature.value} 
          unit={patient.vitals.temperature.unit} 
          trend={patient.vitals.temperature.trend} 
          onSave={(newValue) => onVitalsChange('temperature', newValue)}
          icon={<TemperatureIcon className="h-6 w-6 text-orange-600" />}
          iconBgColor="bg-orange-100 dark:bg-orange-900/50"
          lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.temperature}
        />
      </div>

      {/* Health Summary Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center">
                <SparklesIcon className="mr-2 text-indigo-500"/>
                AI Health Summary
            </h3>
            <button 
              onClick={onRefreshSummary}
              disabled={isSummaryLoading}
              className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshIcon className={`h-4 w-4 mr-1 ${isSummaryLoading ? 'animate-spin' : ''}`} />
              {isSummaryLoading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
        <textarea
            value={aiSummary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="w-full h-28 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="AI summary will appear here..."
            aria-label="AI Health Summary"
        />

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center">
              <NotesIcon className="mr-2 h-5 w-5"/>
              My Notes
            </h4>
            <textarea
              value={summaryNote}
              onChange={(e) => onSummaryNoteChange(e.target.value)}
              className="w-full h-20 p-2 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="Add your thoughts or questions about the summary..."
              aria-label="Personal notes on AI summary"
            />
        </div>
      </div>
      
      {/* Medication Section */}
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
  );
};

export default Dashboard;