import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, Target, Info, User, LogOut } from 'lucide-react';

export default function ProfilePage({ profile, setProfile }: { profile: UserProfile, setProfile: (p: UserProfile) => void }) {
  const [targetCalories, setTargetCalories] = useState(profile.targetCalories.toString());

  const handleSave = () => {
    const val = parseInt(targetCalories, 10);
    if (!isNaN(val) && val > 500 && val < 10000) {
      setProfile({ ...profile, targetCalories: val });
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your profile and setup again?")) {
      setProfile({ targetCalories: 2000, isOnboarded: false });
    }
  };

  return (
    <div className="p-6">
      <header className="mb-8 mt-4">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">Your Profile</h1>
        <p className="text-neutral-500 text-sm">Manage your goals and settings</p>
      </header>
      
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm mb-6 flex items-center gap-4">
         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-8 h-8" />
         </div>
         <div className="flex-1">
            <h2 className="text-xl font-bold text-neutral-800">{profile.name || 'User'}</h2>
            <div className="text-sm text-neutral-500 flex gap-2 mt-1">
               {profile.age && <span>{profile.age} yrs</span>}
               {profile.weight && <span>• {profile.weight}{profile.weightUnit}</span>}
               {profile.bmi && <span>• BMI: {profile.bmi.toFixed(1)}</span>}
            </div>
         </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-800">Daily Target</h2>
            <p className="text-xs text-neutral-500">How many calories do you aim for?</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Target Calories</label>
            <div className="relative">
              <input 
                type="number" 
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                onBlur={handleSave}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-lg"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-sm">
                kcal
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 text-blue-800 rounded-xl p-4 flex gap-3 text-sm">
            <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
            <p>
              Your Eating Score is calculated based on this daily target. An average adult needs about 2000-2500 calories a day.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-800">App Information</h2>
          </div>
        </div>
        
        <ul className="text-sm text-neutral-600 space-y-3 pt-2">
          <li className="flex justify-between border-b border-neutral-50 pb-3">
            <span>Version</span>
            <span className="font-medium text-neutral-900">1.0.0</span>
          </li>
          <li className="flex justify-between border-b border-neutral-50 pb-3">
            <span>Storage</span>
            <span className="font-medium text-neutral-900">Local Device</span>
          </li>
          <li className="flex justify-between pb-1">
            <span>Powered by</span>
            <span className="font-medium text-neutral-900">Gemini AI</span>
          </li>
        </ul>
      </div>

      <button 
        onClick={handleReset}
        className="w-full text-red-500 font-medium p-4 border border-red-100 rounded-2xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5"/>
        Reset Profile Data
      </button>
    </div>
  );
}
