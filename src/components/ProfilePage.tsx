import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, Target, Info, User, LogOut, Palette, Edit2, Check, X, Star, Mail } from 'lucide-react';

const COLORS = [
  { name: 'Emerald', value: 'emerald', bgClass: 'bg-[#10b981]', hex: '#10b981' },
  { name: 'Blue', value: 'blue', bgClass: 'bg-[#3b82f6]', hex: '#3b82f6' },
  { name: 'Purple', value: 'purple', bgClass: 'bg-[#a855f7]', hex: '#a855f7' },
  { name: 'Rose', value: 'rose', bgClass: 'bg-[#f43f5e]', hex: '#f43f5e' },
  { name: 'Amber', value: 'amber', bgClass: 'bg-[#f59e0b]', hex: '#f59e0b' },
  { name: 'Slate', value: 'slate', bgClass: 'bg-[#64748b]', hex: '#64748b' },
];

export default function ProfilePage({ profile, setProfile }: { profile: UserProfile, setProfile: (p: UserProfile) => void }) {
  const [targetCalories, setTargetCalories] = useState(profile.targetCalories.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name || '',
    weight: profile.weight?.toString() || '',
    height: profile.height?.toString() || '',
  });

  const handleSave = () => {
    const val = parseInt(targetCalories, 10);
    if (!isNaN(val) && val > 500 && val < 10000) {
      setProfile({ ...profile, targetCalories: val });
    }
  };

  const handleSaveProfile = () => {
    const w = parseFloat(editForm.weight);
    const h = parseFloat(editForm.height);
    let newBmi = profile.bmi;
    
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      let weightKg = profile.weightUnit === 'lbs' ? w * 0.453592 : w;
      let heightM = profile.heightUnit === 'ft' ? h * 0.3048 : h / 100;
      newBmi = weightKg / (heightM * heightM);
    }
  
    setProfile({
      ...profile,
      name: editForm.name,
      weight: isNaN(w) ? undefined : w,
      height: isNaN(h) ? undefined : h,
      bmi: newBmi
    });
    setIsEditing(false);
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
      
      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm mb-6 relative">
        {!isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
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
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-neutral-800">Edit Details</h3>
              <div className="flex gap-2">
                 <button onClick={() => setIsEditing(false)} className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors">
                   <X className="w-4 h-4" />
                 </button>
                 <button onClick={handleSaveProfile} className="p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors">
                   <Check className="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Weight ({profile.weightUnit || 'kg'})</label>
                <input type="number" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Height ({profile.heightUnit || 'cm'})</label>
                <input type="number" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50" />
              </div>
            </div>
          </div>
        )}
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
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-lg"
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
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-800">Theme Color</h2>
            <p className="text-xs text-neutral-500">Personalize your app</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {COLORS.map(color => (
            <button
              key={color.value}
              onClick={() => setProfile({ ...profile, themeColor: color.value })}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${profile.themeColor === color.value || (!profile.themeColor && color.value === 'emerald') ? 'ring-4 ring-offset-2 ring-neutral-300' : 'hover:scale-110 shadow-sm'}`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {(profile.themeColor === color.value || (!profile.themeColor && color.value === 'emerald')) && (
                <Check className="w-6 h-6 text-white drop-shadow-md" />
              )}
            </button>
          ))}
          
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm hover:scale-110 transition-transform cursor-pointer border-2 border-dashed border-neutral-300 flex items-center justify-center bg-neutral-50" title="Custom Color">
            <input 
              type="color" 
              className="absolute inset-[-10px] w-20 h-20 opacity-0 cursor-pointer"
              value={(() => {
                if (profile.themeColor?.startsWith('#')) return profile.themeColor;
                const active = COLORS.find(c => c.value === (profile.themeColor || 'emerald'));
                return active ? active.hex : '#10b981';
              })()}
              onChange={(e) => setProfile({ ...profile, themeColor: e.target.value })}
            />
            {profile.themeColor?.startsWith('#') && (
               <div className="w-full h-full" style={{ backgroundColor: profile.themeColor }}>
                 <Check className="w-6 h-6 text-white drop-shadow-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
               </div>
            )}
            {!profile.themeColor?.startsWith('#') && (
              <Palette className="w-5 h-5 text-neutral-400" />
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-800">Dark Mode</h3>
            <p className="text-xs text-neutral-500">Toggle dark appearance</p>
          </div>
          <button 
            onClick={() => setProfile({ ...profile, darkMode: !profile.darkMode })}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${profile.darkMode ? 'bg-primary-500' : 'bg-neutral-200'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white transition-transform ${profile.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-800">App Information</h2>
          </div>
        </div>
        
        <ul className="text-sm text-neutral-600 space-y-3 pt-2">
          <li className="flex justify-between border-b border-neutral-50 pb-3">
            <span>Version</span>
            <span className="font-medium text-neutral-900">1.1.0</span>
          </li>
          <li className="flex justify-between border-b border-neutral-50 pb-3">
            <span>Storage</span>
            <span className="font-medium text-neutral-900">Local Device</span>
          </li>
          <li className="flex justify-between border-b border-neutral-50 pb-3">
            <span>Made by</span>
            <span className="font-medium text-neutral-900">Aryan choudhari</span>
          </li>
          <li className="flex flex-col gap-2 border-b border-neutral-50 pb-4">
            <span className="flex items-center gap-2 text-neutral-800 font-medium">
              <Mail className="w-4 h-4" /> Feedback
            </span>
            <a 
              href="mailto:aryanchoudhari2025@gmail.com?subject=NutriSnap%20Feedback" 
              className="text-primary-600 font-medium hover:underline flex items-center gap-1"
            >
              aryanchoudhari2025@gmail.com
            </a>
          </li>
          <li className="flex flex-col gap-2 pt-1">
            <span className="flex items-center gap-2 text-neutral-800 font-medium">
              Rate this App
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setProfile({ ...profile, appRating: star })}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${profile.appRating && profile.appRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} 
                  />
                </button>
              ))}
            </div>
            {profile.appRating && (
              <span className="text-xs text-neutral-500 mt-1">Thanks for your rating!</span>
            )}
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
