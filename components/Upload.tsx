import React, { useState, useRef } from 'react';
import { DocumentUploadIcon } from './icons/DocumentUploadIcon';
import { TagIcon } from './icons/TagIcon';
import { CameraIcon } from './icons/CameraIcon';
import CameraCapture from './CameraCapture';

interface UploadProps {
  onUpload: (file: File, category: string) => void;
  isLoading: boolean;
}

const Upload: React.FC<UploadProps> = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files?.[0] || null);
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files?.[0] || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = category === 'Other' ? customCategory : category;
    if (!selectedFile || !finalCategory.trim()) {
      alert('Please select a file and a category.');
      return;
    }
    onUpload(selectedFile, finalCategory);
  };

  const handlePhotoTaken = (file: File) => {
    setSelectedFile(file);
    setIsCameraOpen(false);
  };

  const isSubmitDisabled = !selectedFile || !category || (category === 'Other' && !customCategory.trim()) || isLoading;

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <DocumentUploadIcon className="h-16 w-16 text-indigo-600 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Upload New Medical Record</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Select a file and categorize it for analysis.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Step 1: Provide a file</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf,image/*"
                    className="hidden"
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`flex-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${selectedFile ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-slate-700' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400'}`}
                >
                  {selectedFile ? (
                    <p className="font-semibold text-indigo-700 dark:text-indigo-400">{selectedFile.name}</p>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">Drag & drop or click to select</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center justify-center gap-2 sm:w-auto w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <CameraIcon className="h-6 w-6" />
                  <span className="font-medium">Use Camera</span>
                </button>
              </div>
            </div>
            
            {selectedFile && (
              <div className="animate-fade-in">
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Step 2: Categorize the record</label>
                <div className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-slate-400 dark:text-slate-500"/>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Medical Image">Medical Image</option>
                    <option value="Other">Other (Please specify)</option>
                  </select>
                </div>

                {category === 'Other' && (
                  <div className="mt-2 animate-fade-in pl-7">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category name"
                      className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Analyzing Record...' : 'Submit Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {isCameraOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <CameraCapture onPhotoTaken={handlePhotoTaken} onClose={() => setIsCameraOpen(false)} />
          </div>
      )}
    </>
  );
};

export default Upload;