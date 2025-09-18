import React from 'react';

interface StorageSetupAlertProps {
  message: string;
  onDismiss?: () => void;
}

const StorageSetupAlert: React.FC<StorageSetupAlertProps> = ({ message, onDismiss }) => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Storage Setup Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>{message}</p>
            <div className="mt-3">
              <p className="font-medium">To fix this:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Go to your Supabase Dashboard</li>
                <li>Navigate to Storage → Buckets</li>
                <li>Create a bucket named "medical-records"</li>
                <li>Set it to <strong>public</strong></li>
                <li>Set file size limit to 10MB</li>
                <li>Add allowed MIME types: image/*, application/pdf</li>
              </ol>
              <p className="mt-2">
                <a 
                  href="./STORAGE_SETUP.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-800 dark:text-yellow-200 underline hover:text-yellow-900 dark:hover:text-yellow-100"
                >
                  View detailed setup guide →
                </a>
              </p>
            </div>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className="inline-flex bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageSetupAlert;