import React, { useState } from 'react';
import { MedicalRecord } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { EmptyRecordsIcon } from './icons/EmptyRecordsIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { TagIcon } from './icons/TagIcon';
import RichSummaryDisplay from './RichSummaryDisplay';

interface RecordsProps {
  records: MedicalRecord[];
  onRemoveRecord: (recordId: string) => void;
}

const Records: React.FC<RecordsProps> = ({ records, onRemoveRecord }) => {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  const toggleRecord = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };
  if (records.length === 0) {
    return (
      <div className="card text-center py-20 animate-fadeIn">
        <div className="bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 p-8 rounded-3xl inline-block mb-6">
          <EmptyRecordsIcon className="h-32 w-32 text-sky-600 dark:text-sky-400" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">No Records Found</h3>
        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-md mx-auto">Upload your first medical record to get started with AI-powered health insights.</p>
      </div>
    );
  }

  const handleRemoveClick = (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      onRemoveRecord(recordId);
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category.toLowerCase()) {
        case 'lab report': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg';
        case 'prescription': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg';
        case 'medical image': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg';
        default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg';
    }
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent mb-6">Your Medical Records</h2>
      <div className="space-y-4">
        {records.map((record, index) => {
          const isExpanded = expandedRecords.has(record.id);
          return (
            <div key={record.id} className="card group hover-lift animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start space-x-4 p-6">
                <div className="bg-gradient-to-br from-sky-400 to-indigo-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 hidden sm:block">
                  <DocumentIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3">
                    <div className="flex-1">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${getCategoryColor(record.category)} mb-2`}>
                        <TagIcon className="h-3.5 w-3.5 mr-1.5"/>
                        {record.category}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{record.type}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-3 sm:mt-0 transition-all duration-200 sm:opacity-0 sm:translate-x-4 group-hover:sm:opacity-100 group-hover:sm:translate-x-0">
                      {record.fileUrl && (
                        <a 
                          href={record.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:shadow-lg hover:scale-110 transition-all duration-200"
                          aria-label={`Preview record from ${new Date(record.date).toLocaleDateString()}`}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleRemoveClick(record.id)}
                        className="p-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:scale-110 transition-all duration-200"
                        aria-label={`Remove record from ${new Date(record.date).toLocaleDateString()}`}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Doctor:</span> {record.doctor}
                      </p>
                      <button
                        onClick={() => toggleRecord(record.id)}
                        className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <span>Show Less</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Show Details</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 animate-fade-in">
                        <RichSummaryDisplay summary={record.summary} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Records;