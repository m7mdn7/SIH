import React, { useState } from 'react';
import { Camera, MapPin, Mic, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProblemCategory } from '../../types';
import { createProblem } from '../../services/api';

export const ReportProblemForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProblemCategory>('Infrastructure');
  const [severity, setSeverity] = useState('High');
  const [locationStr, setLocationStr] = useState('North Mandi Market, New Delhi');
  const [lat, setLat] = useState(28.7041);
  const [lng, setLng] = useState(77.1025);
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
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
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
    recognition.lang = 'en-US';
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
    if (!title || !description) return;
    setIsSubmitting(true);
    try {
      await createProblem({
        title,
        description,
        category,
        severity,
        location: {
          lat,
          lng,
          address: locationStr
        }
      });
      setIsSuccess(true);
      setTitle('');
      setDescription('');
      setLocationStr('North Mandi Market, New Delhi');
      setFiles([]);
    } catch (error) {
      console.error("Submit failed", error);
      alert('Failed to submit report. Please verify backend API is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white border-l-4 border-green-600 rounded-none p-6 text-left shadow-md mt-4">
        <div className="flex items-start">
          <CheckCircle2 className="h-6 w-6 text-green-600 mr-3 shrink-0" />
          <div>
            <h3 className="text-lg font-black text-gov-slate-900 uppercase tracking-tight">Problem Reported Successfully</h3>
            <p className="text-sm text-gov-slate-700 mt-1 font-medium">Your report has been saved to the backend and queued for AI analysis.</p>
            <button onClick={() => setIsSuccess(false)} className="mt-4 px-4 py-2 bg-gov-blue-900 text-white rounded-none font-bold text-xs uppercase tracking-wider transition-colors hover:bg-gov-blue-800 shadow">
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none border-2 border-gov-slate-300 shadow-sm overflow-hidden">
      <div className="border-b-2 border-gov-slate-200 bg-gov-slate-100 px-6 py-4">
        <h2 className="text-lg font-black text-gov-slate-900 uppercase tracking-tight">Report a New Problem</h2>
        <p className="text-sm text-gov-slate-700 font-bold">Provide detailed information, location, and evidence to help authorities respond effectively.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-gov-slate-900 mb-1 uppercase tracking-wider">Problem Title</label>
              <input 
                type="text" 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Tomato spoilage at mandi yard due to heat" 
                className="w-full px-3 py-2 border-2 border-gov-slate-300 rounded-none focus:ring-0 focus:border-gov-blue-800 text-sm font-semibold bg-white text-gov-slate-900 transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gov-slate-900 mb-1 uppercase tracking-wider">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                className="w-full px-3 py-2 border-2 border-gov-slate-300 rounded-none focus:ring-0 focus:border-gov-blue-800 text-sm font-semibold bg-white text-gov-slate-900 transition-colors"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-black text-gov-slate-900 uppercase tracking-wider">Detailed Description</label>
              <button 
                type="button" 
                onClick={handleToggleVoice}
                className={`text-[10px] font-bold uppercase tracking-widest flex items-center px-2 py-1 rounded-none border transition-colors ${isRecording ? 'bg-red-600 text-white border-red-700 animate-pulse' : 'text-gov-slate-700 hover:text-white bg-gov-slate-200 hover:bg-gov-blue-900 border-gov-slate-300'}`}
              >
                <Mic className="w-3 h-3 mr-1" /> {isRecording ? 'Recording...' : 'Voice Input'}
              </button>
            </div>
            <textarea 
              required 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4} 
              placeholder="Describe the societal issue in detail..." 
              className="w-full px-3 py-2 border-2 border-gov-slate-300 rounded-none focus:ring-0 focus:border-gov-blue-800 text-sm font-medium bg-white text-gov-slate-900 transition-colors"
            ></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="border-2 border-gov-slate-300 rounded-none p-4 bg-gov-slate-50">
            <h3 className="text-sm font-black text-gov-slate-900 mb-3 flex items-center uppercase tracking-wider">
              <MapPin className="w-4 h-4 mr-2 text-gov-blue-800" /> Location Details
            </h3>
            <div className="space-y-3">
              <button 
                type="button" 
                onClick={handleGetLocation} 
                className="w-full flex justify-center items-center px-4 py-2 border-2 border-gov-blue-800 text-xs font-black rounded-none text-white bg-gov-blue-900 hover:bg-gov-blue-800 transition-colors uppercase tracking-wider shadow"
              >
                <MapPin className="w-4 h-4 mr-2" /> Auto-fetch GPS Location
              </button>
              <input 
                type="text" 
                value={locationStr} 
                onChange={(e) => setLocationStr(e.target.value)} 
                placeholder="Or enter location address manually" 
                className="w-full px-3 py-2 border-2 border-gov-slate-300 rounded-none focus:ring-gov-blue-800 focus:border-gov-blue-800 text-sm font-semibold bg-white text-gov-slate-900" 
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="border-2 border-gov-slate-300 rounded-none p-4 bg-gov-slate-50">
            <h3 className="text-sm font-black text-gov-slate-900 mb-3 flex items-center uppercase tracking-wider">
              <Camera className="w-4 h-4 mr-2 text-gov-blue-800" /> Photo/Video Evidence
            </h3>
            <div 
              className="border-2 border-dashed border-gov-slate-400 rounded-none p-4 flex flex-col items-center justify-center bg-white hover:bg-gov-slate-100 transition-colors cursor-pointer"
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
              <Upload className="h-6 w-6 text-gov-blue-800 mb-2" />
              <p className="text-xs text-gov-slate-900 font-bold uppercase tracking-wider">Click to upload or drag & drop</p>
              <p className="text-[10px] text-gov-slate-500 mt-1 uppercase tracking-widest font-bold">MP4, JPG, PNG or PDF (max 50MB)</p>
              
              {files.length > 0 && (
                <div className="mt-3 w-full text-left bg-gov-blue-50 p-2 border border-gov-blue-200">
                  <p className="text-xs font-bold text-gov-slate-900 mb-1">Selected files:</p>
                  <ul className="text-xs text-gov-slate-700 space-y-1">
                    {files.map((file, idx) => (
                      <li key={idx} className="truncate font-mono">{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start bg-red-50 p-4 rounded-none border-2 border-red-300">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
          <p className="text-xs text-red-900 font-bold leading-relaxed">
            DECLARATION: By submitting this report, you confirm that the information provided is accurate. Reports are analyzed by SIIP AI and forwarded to nodal authorities.
          </p>
        </div>

        <div className="pt-4 flex justify-end border-t border-gov-slate-200">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex justify-center py-3 px-8 border border-transparent rounded-none shadow-md text-sm font-black uppercase tracking-wider text-white bg-gov-blue-900 hover:bg-gov-blue-800 focus:outline-none disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
