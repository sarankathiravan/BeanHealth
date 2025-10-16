import React, { useState, useRef, useEffect } from 'react';
import { Patient, Vitals, Medication } from '../types';
import MedicationCard from './MedicationCard';
import MedicationTimeline from './MedicationTimeline';
import { EditIcon } from './icons/EditIcon';
import { BloodPressureIcon } from './icons/BloodPressureIcon';
import { TemperatureIcon } from './icons/TemperatureIcon';
import { FeatureVitalsIcon } from './icons/FeatureVitalsIcon';

interface DashboardProps {
  patient: Patient;
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
  aiSummary?: string;
  onRefreshSummary?: () => Promise<void>;
  isSummaryLoading?: boolean;
  onSummaryChange?: (summary: string) => void;
  summaryNote?: string;
  onSummaryNoteChange?: (note: string) => void;
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
    <div className="group relative bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-7 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/60 dark:border-gray-700/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-rose-50 dark:bg-transparent rounded-xl sm:rounded-2xl transition-opacity duration-300"></div>
      <div className="relative flex items-start">
        <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl mr-3 sm:mr-4 ${iconBgColor} shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 sm:mb-2.5 tracking-wide uppercase truncate">{label}</p>
          {isEditing ? (
              <input 
                  ref={inputRef}
                  type="text"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-900"
              />
          ) : (
              <div className="flex items-baseline flex-wrap">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                <span className="ml-1.5 sm:ml-2.5 text-sm sm:text-base lg:text-lg font-medium text-gray-500 dark:text-gray-400">{unit}</span>
              </div>
          )}
          {trend && (
            <div className="flex items-center mt-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${trendColor === 'text-red-500' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20' : trendColor === 'text-blue-500' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400'}`}>
                {trendArrow} Stable
              </span>
            </div>
          )}
          {lastUpdatedFromRecord && (
            <div className="mt-4 inline-flex items-center px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 rounded-full ring-1 ring-inset ring-sky-600/10 dark:ring-sky-400/10">
              <svg className="w-3.5 h-3.5 mr-1.5 text-sky-600 dark:text-sky-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">Auto-updated</span>
            </div>
          )}
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
    onVitalsChange,
    onMedicationAdd,
    onMedicationChange,
    onMedicationRemove,
    vitalsLastUpdatedFromRecord
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-[1600px] mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 tracking-tight">Your Health Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">Track your vitals, medications, and health insights all in one place</p>
        </div>
      </div>
      
      {/* Vitals Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
          <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 dark:text-gray-100 tracking-tight">Health Vitals</h3>
          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last updated today</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <VitalCard 
            label="Blood Pressure" 
            value={patient.vitals.bloodPressure.value} 
            unit={patient.vitals.bloodPressure.unit} 
            trend={patient.vitals.bloodPressure.trend} 
            onSave={(newValue) => onVitalsChange('bloodPressure', newValue)}
            icon={<BloodPressureIcon className="h-7 w-7 text-red-600 dark:text-red-400" />}
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.bloodPressure}
          />
          <VitalCard 
            label="Heart Rate" 
            value={patient.vitals.heartRate.value} 
            unit={patient.vitals.heartRate.unit} 
            trend={patient.vitals.heartRate.trend} 
            onSave={(newValue) => onVitalsChange('heartRate', newValue)}
            icon={<FeatureVitalsIcon className="h-7 w-7 text-sky-600 dark:text-sky-400" />}
            iconBgColor="bg-sky-100 dark:bg-sky-900/30"
            lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.heartRate}
          />
          <VitalCard 
            label="Temperature" 
            value={patient.vitals.temperature.value} 
            unit={patient.vitals.temperature.unit} 
            trend={patient.vitals.temperature.trend} 
            onSave={(newValue) => onVitalsChange('temperature', newValue)}
            icon={<TemperatureIcon className="h-7 w-7 text-orange-600 dark:text-orange-400" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            lastUpdatedFromRecord={vitalsLastUpdatedFromRecord?.temperature}
          />
        </div>
      </div>
      
      {/* Medication Section */}
      <div>
        <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 tracking-tight">Medications</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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