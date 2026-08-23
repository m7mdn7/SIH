import React, { useState } from 'react';
import { Camera, MapPin, Mic, Languages, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProblemCategory } from '../../types';

// Future API Integration Placeholder
const api = {
  submitReport: async (data: any) => new Promise(resolve => setTimeout(resolve, 1500)),
};

export const ReportProblemForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [locationStr, setLocationStr] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories: ProblemCategory[] = [
    'Disaster Management', 'Agriculture', 'Healthcare', 'Education', 'Infrastructure', 'Water Management'
  ];

  const handleGetLocation = () => {
    setLocationStr('Fetching GPS...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStr(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setLocationStr(`Error: ${error.message}`);
        }
      );
    } else {
      setLocationStr('GPS not supported by your browser');
    }
  };

  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Defaulting to english for mock
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual backend Report Submission API (Machine B/C)
      // Form data payload construct: { title, category, description, location: locationStr, files }
      await api.submitReport({ description, locationStr });
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      // Reset form
      setDescription('');
      setLocationStr('');
      setFiles([]);
    } catch (error) {
      console.error("Submit failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white border-l-4 border-green-600 rounded-none p-6 text-left shadow-sm mt-4">
        <div className="flex items-start">
          <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-gov-slate-900 uppercase tracking-tight">Problem Reported Successfully</h3>
            <p className="text-sm text-gov-slate-700 mt-1">Your report has been submitted to the AI analysis layer for categorization and government review.</p>
            <button onClick={() => setIsSuccess(false)} className="mt-4 px-4 py-2 bg-gov-slate-100 border border-gov-slate-300 text-gov-slate-800 rounded-none font-bold text-xs uppercase tracking-wider transition-colors hover:bg-gov-slate-200">
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none border border-gov-slate-300 overflow-hidden">
      <div className="border-b-2 border-gov-slate-200 bg-gov-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-gov-slate-900 uppercase tracking-tight">Report a New Problem</h2>
        <p className="text-sm text-gov-slate-700 font-medium">Provide detailed information, photos, and location to help authorities respond effectively.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gov-slate-900 mb-1 uppercase tracking-wider">Title</label>
              <input type="text" required placeholder="Brief summary of the issue" className="w-full px-2 py-1.5 border-2 border-gov-slate-300 rounded-none focus:ring-0 focus:border-gov-blue-800 text-sm bg-gov-slate-50 transition-colors" />
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-bold text-gov-slate-900 mb-1 uppercase tracking-wider">Category</label>
              <select required className="w-full px-2 py-1.5 border-2 border-gov-slate-300 rounded-none focus:ring-0 focus:border-gov-blue-800 text-sm bg-gov-slate-50 transition-colors">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gov-slate-900 uppercase tracking-wider">Description</label>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handleToggleVoice}
                  className={`text-[10px] font-bold uppercase tracking-widest flex items-center px-2 py-1 rounded-none border transition-colors ${isRecording ? 'bg-red-100 text-red-800 border-red-300 animate-pulse' : 'text-gov-slate-700 hover:text-gov-blue-900 bg-gov-slate-100 border-gov-slate-300'}`}
                >
                  <Mic className="w-3 h-3 mr-1" /> {isRecording ? 'Recording...' : 'Voice Input'}
                </button>
              </div>
            </div>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the problem in detail..." className="w-full px-2 py-1.5 border-2 border-gov-slate-300 rounded-none focus:ring-0 focus:border-gov-blue-800 text-sm bg-gov-slate-50 transition-colors"></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="border border-gov-slate-300 rounded-none p-4 bg-white">
            <h3 className="text-sm font-bold text-gov-slate-900 mb-3 flex items-center uppercase tracking-wider"><MapPin className="w-4 h-4 mr-2 text-gov-blue-800" /> Location</h3>
            <div className="space-y-3">
              <button type="button" onClick={handleGetLocation} className="w-full flex justify-center items-center px-4 py-2 border-2 border-gov-blue-800 text-sm font-bold rounded-none text-gov-blue-900 bg-white hover:bg-gov-slate-50 transition-colors uppercase tracking-wider">
                <MapPin className="w-4 h-4 mr-2" /> Auto-fetch GPS Location
              </button>
              <input type="text" value={locationStr} onChange={(e) => setLocationStr(e.target.value)} placeholder="Or enter address manually" className="w-full px-3 py-2 border border-gov-slate-300 rounded-none focus:ring-gov-blue-800 focus:border-gov-blue-800 text-sm bg-gov-slate-50" />
            </div>
          </div>

          {/* Media Upload */}
          <div className="border border-gov-slate-300 rounded-none p-3 bg-white">
            <h3 className="text-sm font-bold text-gov-slate-900 mb-3 flex items-center uppercase tracking-wider"><Camera className="w-4 h-4 mr-2 text-gov-blue-800" /> Photo/Video Evidence</h3>
            <div 
              className="border-2 border-dashed border-gov-slate-400 rounded-none p-4 flex flex-col items-center justify-center bg-gov-slate-50 hover:bg-gov-slate-100 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*,video/*,.pdf"
              />
              <Upload className="h-5 w-5 text-gov-blue-800 mb-2" />
              <p className="text-[11px] text-gov-slate-900 font-bold uppercase tracking-wider">Click to upload or drag & drop</p>
              <p className="text-[9px] text-gov-slate-500 mt-1 uppercase tracking-widest font-bold">MP4, JPG, PNG or PDF (max 50MB)</p>
              
              {files.length > 0 && (
                <div className="mt-4 w-full text-left">
                  <p className="text-xs font-semibold text-gov-slate-900 mb-1">Selected files:</p>
                  <ul className="text-xs text-gov-slate-600 space-y-1">
                    {files.map((file, idx) => (
                      <li key={idx} className="truncate">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start bg-red-50 p-4 rounded-none border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
          <p className="text-xs text-red-800 font-medium leading-relaxed">
            DECLARATION: By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. False reports are subject to penalty and may result in account suspension under IT Act guidelines.
          </p>
        </div>

        <div className="pt-4 flex justify-end border-t border-gov-slate-200">
          <button type="submit" disabled={isSubmitting} className="flex justify-center py-2 px-8 border border-transparent rounded-none shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-gov-blue-900 hover:bg-gov-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-900 disabled:opacity-50 transition-colors">
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
