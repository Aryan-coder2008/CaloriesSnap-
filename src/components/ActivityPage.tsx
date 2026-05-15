import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Plus, X, Activity as ActivityIcon, Upload, Calendar, FileText } from 'lucide-react';
import { UserProfile, Exercise } from '../types';
import { estimateExerciseCalories, extractAndEstimateWorkoutPlan } from '../services/gemini';

export default function ActivityPage({
  profile,
  onUpdateProfile,
  onAddExercises,
}: {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onAddExercises: (exs: Exercise[]) => void;
}) {
  const [isAddingMode, setIsAddingMode] = useState<'manual' | 'upload' | null>(null);
  const [activity, setActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [dayQuery, setDayQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const processPlanStr = async (base64Str: string, mimeType: string) => {
    const weight = profile.weight || 70;
    const weightUnit = profile.weightUnit || 'kg';
    
    const planExercises = await extractAndEstimateWorkoutPlan(
      base64Str,
      mimeType,
      dayQuery,
      weight,
      weightUnit
    );

    if (planExercises.length === 0) {
      throw new Error('Could not find any exercises for that day in the document.');
    }

    const newExercises: Exercise[] = planExercises.map((pe, idx) => ({
      id: Date.now().toString() + idx,
      timestamp: Date.now(),
      activityName: pe.activityName,
      caloriesBurned: pe.caloriesBurned,
      durationMinutes: pe.durationMinutes,
    }));

    onAddExercises(newExercises);
    setIsAddingMode(null);
    setSelectedFile(null);
    setDayQuery('');
  };

  const handleUploadEstimate = async () => {
    if (!selectedFile && !profile.workoutPlanData) {
      setError('Please select a file first.');
      return;
    }
    if (!dayQuery.trim()) {
      setError('Please enter the day you want to extract.');
      return;
    }

    setError(null);
    setIsEstimating(true);

    try {
      if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64String = reader.result as string;
            
            // Save to profile
            onUpdateProfile({
              ...profile,
              workoutPlanData: base64String,
              workoutPlanMimeType: selectedFile.type
            });

            await processPlanStr(base64String, selectedFile.type);
          } catch (err: any) {
            setError(err.message || 'Failed to extract exercises from file.');
            setIsEstimating(false);
          }
        };
        reader.onerror = () => {
          setError('Failed to read file.');
          setIsEstimating(false);
        }
        reader.readAsDataURL(selectedFile);
      } else if (profile.workoutPlanData && profile.workoutPlanMimeType) {
        // Use saved plan
        await processPlanStr(profile.workoutPlanData, profile.workoutPlanMimeType);
      }
    } catch (err: any) {
      setError(err.message || 'Processing failed.');
      setIsEstimating(false);
    }
  };

  const handleEstimate = async () => {
    if (!activity.trim() || !duration) {
      setError('Please enter activity and duration.');
      return;
    }
    const mins = parseInt(duration);
    if (isNaN(mins) || mins <= 0) {
      setError('Please enter a valid duration.');
      return;
    }
    
    setError(null);
    setIsEstimating(true);
    
    try {
      const weight = profile.weight || 70;
      const weightUnit = profile.weightUnit || 'kg';
      const estimate = await estimateExerciseCalories(activity, mins, weight, weightUnit);
      
      const newExercise: Exercise = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        activityName: estimate.activityName,
        caloriesBurned: estimate.caloriesBurned,
        durationMinutes: mins,
      };
      
      onAddExercises([newExercise]);
      setIsAddingMode(null);
      setActivity('');
      setDuration('');
    } catch (err: any) {
      setError(err.message || 'Failed to estimate calories.');
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col pt-8 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Activity</h1>
        <p className="text-neutral-500 font-medium mt-1">Track your workouts & exercises.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        {isAddingMode === null ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm flex flex-col gap-4"
          >
            <button
              onClick={() => setIsAddingMode('manual')}
              className="w-full h-48 bg-white border-2 border-dashed border-primary-200 rounded-3xl flex flex-col items-center justify-center text-primary-600 hover:bg-primary-50 hover:border-primary-400 transition-all group shadow-sm"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-8 h-8" />
              </div>
              <span className="font-bold text-lg text-neutral-800">Add Manually</span>
              <span className="text-xs text-neutral-500 mt-1 font-medium">Log single workout</span>
            </button>
            <button
              onClick={() => setIsAddingMode('upload')}
              className="w-full h-48 bg-white border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all group shadow-sm"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <span className="font-bold text-lg text-neutral-800">Upload Plan</span>
              <span className="text-xs text-neutral-500 mt-1 font-medium">Extract from PDF or Image</span>
            </button>
          </motion.div>
        ) : isAddingMode === 'manual' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 relative"
          >
            <button 
              onClick={() => setIsAddingMode(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-neutral-800 mb-6">Log Workout</h2>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">What did you do?</label>
                <input 
                  type="text" 
                  value={activity} 
                  onChange={e => setActivity(e.target.value)}
                  placeholder="e.g. Running, Weightlifting, Yoga"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Duration (minutes)</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                />
              </div>
              
              <button 
                onClick={handleEstimate}
                disabled={isEstimating}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                {isEstimating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Estimating...
                  </>
                ) : (
                  <>
                    <ActivityIcon className="w-5 h-5" />
                    Estimate & Save
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 relative max-h-full overflow-y-auto"
          >
            <button 
              onClick={() => setIsAddingMode(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-neutral-800 mb-6">Extract Schedule</h2>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            
            <div className="space-y-4">
              {profile.workoutPlanData ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2">
                   <div className="flex items-center gap-2 text-blue-700">
                     <FileText className="w-5 h-5" />
                     <span className="font-semibold text-sm">Saved Plan Available</span>
                   </div>
                   <p className="text-xs text-blue-600/80">We will extract today's plan from your saved document. Alternatively, select a new file below to overwrite.</p>
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  {profile.workoutPlanData ? "Upload New File (Optional)" : "Upload File (PDF/Image)"}
                </label>
                <input 
                  type="file" 
                  accept="application/pdf, image/*"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Which day's plan?</label>
                <input 
                  type="text" 
                  value={dayQuery} 
                  onChange={e => setDayQuery(e.target.value)}
                  placeholder="e.g. Monday, Day 1, Leg Day"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              
              <button 
                onClick={handleUploadEstimate}
                disabled={isEstimating}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition-colors"
              >
                {isEstimating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Extracting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Extract & Save
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
