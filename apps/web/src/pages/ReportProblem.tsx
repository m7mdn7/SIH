import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Camera, MapPin, Upload } from 'lucide-react';

export function ReportProblem() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <Card>
          <CardContent className="pt-10 pb-12">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Submitted Successfully</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Your report has been received and is currently being analyzed by our AI system for categorization and immediate routing to the appropriate university and government department.
            </p>
            <Button onClick={() => setSubmitted(false)}>Report Another Issue</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Report a Community Problem</h2>
        <p className="text-slate-600 mt-1">Provide details about the issue to help us connect it with the right experts.</p>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="e.g., Heavy rainfall has flooded village..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea rows={4} className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Describe the problem in detail..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Disaster Management</option>
                  <option>Agriculture</option>
                  <option>Healthcare</option>
                  <option>Water Management</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Affected Population</label>
                <input type="number" className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., 500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GPS Location</label>
                <div className="flex gap-2">
                  <input type="text" className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 bg-slate-50 cursor-not-allowed" value="23.6331, 85.5149" readOnly />
                  <button className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-200">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                 <select className="w-full rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Photo Evidence</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <Camera className="w-8 h-8 mb-2 text-slate-400" />
                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                <span className="text-xs mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={() => setSubmitted(true)} className="w-full md:w-auto px-8">Submit Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
