import React, { useState, useRef } from "react";
import { DocumentUploadIcon } from "./icons/DocumentUploadIcon";
import { TagIcon } from "./icons/TagIcon";
import { CameraIcon } from "./icons/CameraIcon";
import CameraCapture from "./CameraCapture";

interface UploadProps {
  onUpload: (file: File, category: string) => void;
  isLoading: boolean;
}

const Upload: React.FC<UploadProps> = ({ onUpload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
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
    const finalCategory = category === "Other" ? customCategory : category;
    if (!selectedFile || !finalCategory.trim()) {
      alert("Please select a file and a category.");
      return;
    }
    onUpload(selectedFile, finalCategory);
  };

  const handlePhotoTaken = (file: File) => {
    setSelectedFile(file);
    setIsCameraOpen(false);
  };

  const isSubmitDisabled =
    !selectedFile ||
    !category ||
    (category === "Other" && !customCategory.trim()) ||
    isLoading;

  return (
    <>
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="card">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-sky-400 to-indigo-500 p-6 rounded-3xl shadow-xl inline-block mb-4">
              <DocumentUploadIcon className="h-20 w-20 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Upload New Medical Record
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Select a file and categorize it for AI-powered analysis.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-bold mr-3">1</span>
                Provide a file
              </label>
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
                  className={`flex-1 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                    selectedFile
                      ? "border-sky-500 dark:border-sky-400 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/30 dark:to-indigo-900/30 shadow-lg scale-105"
                      : "border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-md hover:scale-105"
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <DocumentUploadIcon className="h-10 w-10 text-sky-600 dark:text-sky-400 mx-auto" />
                      <p className="font-bold text-sky-700 dark:text-sky-400 text-lg">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <DocumentUploadIcon className="h-12 w-12 text-slate-400 mx-auto" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Drag & drop or click to select
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">PDF or Image files</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center justify-center gap-3 sm:w-auto w-full p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:shadow-md hover:scale-105 transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-3 rounded-xl group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                    <CameraIcon className="h-7 w-7 text-white" />
                  </div>
                  <span className="font-bold">Use Camera</span>
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="animate-slideUp">
                <label
                  htmlFor="category"
                  className="block text-lg font-bold text-slate-800 dark:text-slate-100 mb-4"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-sm font-bold mr-3">2</span>
                  Categorize the record
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-xl shadow-lg">
                    <TagIcon className="h-6 w-6 text-white" />
                  </div>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base font-medium text-slate-900 dark:text-slate-100 transition-all duration-200"
                  >
                    <option value="" disabled>
                      Select a category...
                    </option>
                    <option value="Lab Report">🧪 Lab Report</option>
                    <option value="Prescription">💊 Prescription</option>
                    <option value="Medical Image">🩻 Medical Image</option>
                    <option value="Other">📋 Other (Please specify)</option>
                  </select>
                </div>

                {category === "Other" && (
                  <div className="mt-4 animate-slideUp pl-12">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category name"
                      className="block w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-base text-slate-900 dark:text-slate-100 transition-all duration-200"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="btn-primary w-full flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? "Processing & Analyzing..." : "Submit Record"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <CameraCapture
            onPhotoTaken={handlePhotoTaken}
            onClose={() => setIsCameraOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Upload;
