import React, { useState } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Target, BrainCircuit, Pencil } from 'lucide-react';
import { analyzeBodyCondition } from '../services/gemini';

export default function OnboardingPage({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [height, setHeight] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [bmi, setBmi] = useState<number>(0);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ condition: string, recommendedCalories: number } | null>(null);
  const [manualCalories, setManualCalories] = useState('2000');
  const [error, setError] = useState<string | null>(null);

  const handleNextStep1 = () => {
    if (!name.trim() || !age) {
      setError("Please enter your name and age.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!weight || !height) {
      setError("Please enter your weight and height.");
      return;
    }
    
    // Calculate BMI
    let heightInMeters = 0;
    if (heightUnit === 'cm') {
      heightInMeters = parseFloat(height) / 100;
    } else {
      // rough conversion assuming ft.inches format like 5.9 for 5'9"
      const parts = height.split('.');
      const ft = parseInt(parts[0]) || 0;
      const inch = parseInt(parts[1]) || 0;
      heightInMeters = ((ft * 12) + inch) * 0.0254;
    }

    let weightInKg = parseFloat(weight);
    if (weightUnit === 'lbs') {
      weightInKg = weightInKg * 0.453592;
    }

    if (heightInMeters > 0 && weightInKg > 0) {
      const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
      setBmi(calculatedBmi);
      setError(null);
      setStep(3);
    } else {
      setError("Please enter valid positive numbers.");
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStep(4);
    try {
      const res = await analyzeBodyCondition(
        name, 
        parseInt(age), 
        parseFloat(weight), 
        weightUnit, 
        parseFloat(height), 
        heightUnit, 
        bmi
      );
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please choose manual entry.');
      setStep(3); // go back
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManual = () => {
    setStep(5);
  };

  const handleCompleteAnalysis = () => {
    if (!analysis) return;
    completeOnboarding(analysis.recommendedCalories);
  };

  const handleCompleteManual = () => {
    const cals = parseInt(manualCalories);
    if (cals < 500 || cals > 10000) {
      setError("Please enter a realistic calorie target.");
      return;
    }
    completeOnboarding(cals);
  };

  const completeOnboarding = (targetCals: number) => {
    onComplete({
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      weightUnit,
      height: parseFloat(height),
      heightUnit,
      bmi,
      targetCalories: targetCals,
      isOnboarded: true
    });
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col p-6 sm:p-8">
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-3xl font-extrabold text-neutral-900 mb-2 mt-4">Welcome! 👋</h1>
              <p className="text-neutral-500 mb-8">Let's get to know you to personalize your CalorieSnap experience.</p>
              
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">What is your name?</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Age</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={e => setAge(e.target.value)}
                    placeholder="E.g. 25"
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="mt-auto pt-8">
                <button 
                  onClick={handleNextStep1}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-colors"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-neutral-900 mb-2 mt-4">Body Metrics</h1>
              <p className="text-neutral-500 mb-8">We need these to accurately calculate your BMI and goal.</p>
              
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-neutral-700">Weight</label>
                    <div className="flex bg-neutral-100 rounded-lg p-0.5">
                      <button onClick={() => setWeightUnit('kg')} className={`px-3 py-1 text-xs font-bold rounded-md ${weightUnit === 'kg' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>KG</button>
                      <button onClick={() => setWeightUnit('lbs')} className={`px-3 py-1 text-xs font-bold rounded-md ${weightUnit === 'lbs' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>LBS</button>
                    </div>
                  </div>
                  <input 
                    type="number" 
                    value={weight} 
                    onChange={e => setWeight(e.target.value)}
                    placeholder={`E.g. ${weightUnit === 'kg' ? '70' : '150'}`}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-neutral-700">Height</label>
                    <div className="flex bg-neutral-100 rounded-lg p-0.5">
                      <button onClick={() => setHeightUnit('cm')} className={`px-3 py-1 text-xs font-bold rounded-md ${heightUnit === 'cm' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>CM</button>
                      <button onClick={() => setHeightUnit('ft')} className={`px-3 py-1 text-xs font-bold rounded-md ${heightUnit === 'ft' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>FT.IN</button>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={height} 
                    onChange={e => setHeight(e.target.value)}
                    placeholder={`E.g. ${heightUnit === 'cm' ? '175' : '5.9'}`}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="mt-auto pt-8 flex gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleNextStep2}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-colors"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-neutral-900 mb-2 mt-4">Your BMI is <span className="text-emerald-600">{bmi.toFixed(1)}</span></h1>
              <p className="text-neutral-500 mb-8">How would you like to set your daily calorie goal?</p>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="space-y-4">
                <button 
                  onClick={handleAnalyze}
                  className="w-full text-left p-5 border-2 border-emerald-100 hover:border-emerald-500 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">AI Analysis & Suggestion</h3>
                      <p className="text-sm text-neutral-500 mt-1">Research my condition and recommend optimal calories.</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={handleManual}
                  className="w-full text-left p-5 border-2 border-neutral-100 hover:border-neutral-300 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 group-hover:scale-110 transition-transform">
                      <Pencil className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">Set Manually</h3>
                      <p className="text-sm text-neutral-500 mt-1">I already know my daily calorie target.</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="mt-auto pt-8 text-center pt-8">
                <button onClick={() => setStep(2)} className="text-sm font-medium text-neutral-400 hover:text-neutral-600">
                  Go Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center items-center text-center py-6"
            >
              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                  <h2 className="text-xl font-bold text-neutral-800 mb-2">Analyzing your metrics...</h2>
                  <p className="text-neutral-500">Researching optimal calories based on your body condition.</p>
                </div>
              ) : analysis ? (
                <div className="w-full">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Plan is Ready</h2>
                  
                  <div className="bg-neutral-50 rounded-2xl p-6 text-left mb-6 border border-neutral-100 shadow-inner">
                    <p className="text-sm text-neutral-700 leading-relaxed mb-4">
                      {analysis.condition}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <span className="font-semibold text-neutral-600">Daily Target:</span>
                      <span className="text-2xl font-black text-emerald-600">{analysis.recommendedCalories} <span className="text-sm font-medium">kcal</span></span>
                    </div>
                  </div>

                  <button 
                    onClick={handleCompleteAnalysis}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-colors"
                  >
                    Accept & Start Tracking
                  </button>
                  <button onClick={() => setStep(3)} className="mt-4 text-sm font-medium text-neutral-400 hover:text-neutral-600">
                    Go Back
                  </button>
                </div>
              ) : null}
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-neutral-900 mb-2 mt-4">Set Your Target</h1>
              <p className="text-neutral-500 mb-8">Enter the daily calorie limit you want to hit.</p>

               {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="relative mb-8">
                <input 
                  type="number" 
                  value={manualCalories} 
                  onChange={e => setManualCalories(e.target.value)}
                  className="w-full border-2 border-emerald-200 rounded-2xl px-6 py-6 bg-emerald-50 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-4xl font-black text-center text-emerald-900"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">
                  kcal
                </div>
              </div>

              <div className="mt-auto pt-8 flex gap-3">
                <button 
                  onClick={() => setStep(3)}
                  className="px-6 py-4 rounded-xl font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleCompleteManual}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-colors"
                >
                  Start Tracking <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
