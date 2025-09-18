import React, { useState } from 'react';

const StoragePolicyFix: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlCommand = `-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on medical-records" ON storage.objects;

-- Create the new policy
CREATE POLICY "Allow all operations on medical-records" 
ON storage.objects FOR ALL 
USING (bucket_id = 'medical-records');`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Storage Policy Error Detected
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>You're getting a "row-level security policy" error. This means storage policies need to be set up.</p>
            
            <div className="mt-4">
              <p className="font-medium mb-2">Quick Fix - Run this SQL command:</p>
              
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre>{sqlCommand}</pre>
              </div>
              
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700"
                >
                  {copied ? 'Copied!' : 'Copy SQL'}
                </button>
                
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:hover:bg-red-700"
                >
                  Open Supabase Dashboard →
                </a>
              </div>
              
              <div className="mt-3 text-xs">
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Copy the SQL command above</li>
                  <li>Go to your Supabase Dashboard → SQL Editor</li>
                  <li>Paste and run the command</li>
                  <li>Come back and try uploading again</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoragePolicyFix;