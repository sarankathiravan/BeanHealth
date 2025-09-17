import React from 'react';
import { MedicalRecord } from '../types';
import { DocumentIcon } from './icons/DocumentIcon';
import { EmptyRecordsIcon } from './icons/EmptyRecordsIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EyeIcon } from './icons/EyeIcon';
import { TagIcon } from './icons/TagIcon';

interface RecordsProps {
  records: MedicalRecord[];
  onRemoveRecord: (recordId: string) => void;
}

const Records: React.FC<RecordsProps> = ({ records, onRemoveRecord }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-16">
        <EmptyRecordsIcon className="mx-auto h-24 w-24 text-slate-400 dark:text-slate-500" />
        <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">No Records Found</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Upload your first medical record to get started.</p>
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
        case 'lab report': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
        case 'prescription': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
        case 'medical image': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        default: return 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200';
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Your Medical Records</h2>
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {records.map((record) => (
            <li key={record.id} className="p-4 sm:p-6 group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg mt-1 hidden sm:block">
                  <DocumentIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                    <div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(record.category)} mb-1`}>
                           <TagIcon className="h-3 w-3 mr-1"/>
                           {record.category}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{record.type}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0 transition-opacity sm:opacity-0 group-hover:sm:opacity-100">
                      {record.fileUrl && (
                        <a 
                          href={record.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-full text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                          aria-label={`Preview record from ${new Date(record.date).toLocaleDateString()}`}
                        >
                            <EyeIcon className="h-5 w-5" />
                        </a>
                      )}
                      <button 
                          onClick={() => handleRemoveClick(record.id)}
                          className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                          aria-label={`Remove record from ${new Date(record.date).toLocaleDateString()}`}
                      >
                          <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                    <span className="font-medium">Doctor:</span> {record.doctor}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{record.summary}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Records;