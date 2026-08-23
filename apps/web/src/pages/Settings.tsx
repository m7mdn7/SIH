import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, User, Bell, Shield, Globe, KeyRound } from 'lucide-react';

// Future API Integration Placeholder
const api = {
  updateSettings: async (data: any) => new Promise(resolve => setTimeout(resolve, 500)),
  changePassword: async (data: any) => new Promise(resolve => setTimeout(resolve, 800)),
};

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Replace with actual backend call
      await api.updateSettings({ userId: user?.id /* ...form data */ });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Replace with actual backend password change endpoint
      await api.changePassword({ userId: user?.id /* ...passwords */ });
      alert('Password updated successfully!');
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Failed to change password', error);
      alert('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gov-slate-900">Settings</h1>
        <p className="text-gov-slate-700 mt-1">Manage your account preferences and portal settings.</p>
      </div>

      <div className="bg-white rounded-none border border-gov-slate-300 overflow-hidden">
        <form onSubmit={handleSave}>
          {/* Profile Section */}
          <div className="p-6 border-b border-gov-slate-200">
            <h2 className="text-lg font-semibold text-gov-slate-900 flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-gov-blue-700" />
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">Full Name</label>
                <input type="text" defaultValue={user.name} className="w-full px-3 py-2 border border-gov-slate-200 rounded-md focus:ring-gov-blue-500 focus:border-gov-blue-500 text-sm bg-gov-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">Role</label>
                <input type="text" disabled defaultValue={user.role} className="w-full px-3 py-2 border border-gov-slate-200 rounded-md text-sm bg-gov-slate-100 text-gov-slate-500 cursor-not-allowed" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">Email Address</label>
                <input type="email" defaultValue={`${user.name.toLowerCase().replace(' ', '.')}@example.com`} className="w-full px-3 py-2 border border-gov-slate-200 rounded-md focus:ring-gov-blue-500 focus:border-gov-blue-500 text-sm bg-gov-slate-50" />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="p-6 border-b border-gov-slate-200">
            <h2 className="text-lg font-semibold text-gov-slate-900 flex items-center mb-4">
              <Globe className="w-5 h-5 mr-2 text-gov-blue-700" />
              Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">Language</label>
                <select className="w-full px-3 py-2 border border-gov-slate-200 rounded-md focus:ring-gov-blue-500 focus:border-gov-blue-500 text-sm bg-gov-slate-50">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Bengali</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input 
                  type="checkbox" 
                  id="notifications" 
                  defaultChecked 
                  onChange={(e) => {
                    if (e.target.checked) {
                      alert("Email notifications enabled.");
                    } else {
                      alert("Email notifications disabled.");
                    }
                  }}
                  className="h-4 w-4 text-gov-blue-700 focus:ring-gov-blue-500 border-gov-slate-300 rounded" 
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gov-slate-900 flex items-center">
                  <Bell className="w-4 h-4 mr-1 text-gov-slate-500" /> Enable email notifications
                </label>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="p-6 border-b border-gov-slate-200 bg-gov-slate-50">
            <h2 className="text-lg font-semibold text-gov-slate-900 flex items-center mb-4">
              <Shield className="w-5 h-5 mr-2 text-gov-blue-700" />
              Security
            </h2>
            <p className="text-sm text-gov-slate-700 mb-4">Update your password or configure two-factor authentication.</p>
            <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="px-4 py-2 border-2 border-gov-slate-300 text-sm font-bold rounded-none text-gov-slate-800 bg-white hover:bg-gov-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-500 uppercase tracking-wider">
              Change Password
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gov-slate-100 flex justify-end border-t border-gov-slate-200">
            <button type="submit" className="flex justify-center items-center py-2 px-6 border border-transparent rounded-none text-sm font-bold uppercase tracking-wider text-white bg-gov-blue-800 hover:bg-gov-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-blue-500 transition-colors">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gov-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gov-slate-100 flex justify-between items-center bg-gov-slate-50">
              <h3 className="font-semibold text-gov-slate-900 flex items-center"><KeyRound className="w-4 h-4 mr-2 text-gov-blue-700" /> Change Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gov-slate-400 hover:text-gov-slate-700">&times;</button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">Current Password</label>
                <input type="password" required className="w-full px-3 py-2 border border-gov-slate-200 rounded-md focus:ring-gov-blue-500 focus:border-gov-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">New Password</label>
                <input type="password" required className="w-full px-3 py-2 border border-gov-slate-200 rounded-md focus:ring-gov-blue-500 focus:border-gov-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gov-slate-900 mb-1">Confirm New Password</label>
                <input type="password" required className="w-full px-3 py-2 border border-gov-slate-200 rounded-md focus:ring-gov-blue-500 focus:border-gov-blue-500 text-sm" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 border border-gov-slate-300 rounded-md text-sm font-medium text-gov-slate-700 hover:bg-gov-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gov-blue-700 hover:bg-gov-blue-900 disabled:opacity-50">
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
