import React from 'react';
import { Meal, UserProfile, Exercise } from '../types';
import { Utensils } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomePage({ meals, exercises = [], profile }: { meals: Meal[], exercises?: Exercise[], profile: UserProfile }) {
  const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
  const caloriesBurned = exercises.reduce((sum, e) => sum + e.caloriesBurned, 0);
  const netCalories = Math.max(0, caloriesConsumed - caloriesBurned);
  
  const proteinConsumed = meals.reduce((sum, m) => sum + m.protein, 0);
  const carbsConsumed = meals.reduce((sum, m) => sum + m.carbs, 0);
  const fatConsumed = meals.reduce((sum, m) => sum + m.fat, 0);
  
  const remainingCalories = Math.max(0, profile.targetCalories - netCalories);
  
  // Custom Score Calculation (1-10)
  // based on how much he "should eat" using net calories
  const ratio = netCalories / profile.targetCalories;
  let scoreText = "";
  let score = 0;
  
  if (ratio < 0.2) {
    score = 10;
    scoreText = "You need to eat a lot more to reach your goal!";
  } else if (ratio < 0.5) {
    score = 8;
    scoreText = "You still have plenty of room to eat.";
  } else if (ratio < 0.8) {
    score = 5;
    scoreText = "On track, eat a moderate amount.";
  } else if (ratio <= 1.0) {
    score = 2;
    scoreText = "Almost at your limit, maybe a light snack.";
  } else {
    score = 1;
    scoreText = "You have hit or exceeded your goal! Time to hold off.";
  }

  return (
    <div className="p-4 sm:p-6 pb-20 sm:pb-6">
      <header className="mb-6 sm:mb-8 mt-4">
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <Utensils className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Today's Summary</h1>
        </div>
        <p className="text-neutral-500 text-sm">Track your progress and check your eating score.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-emerald-600/30"
      >
        <h2 className="text-emerald-100 font-medium mb-1 text-sm uppercase tracking-wider">Eating Score</h2>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-6xl font-black">{score}</span>
          <span className="text-xl text-emerald-200 mb-1 font-semibold">/ 10</span>
        </div>
        <p className="text-sm font-medium opacity-90">{scoreText}</p>
        <div className="w-full bg-black/20 h-2 rounded-full mt-5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(score / 10) * 100}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="bg-white h-full" 
          />
        </div>
        <p className="text-xs text-emerald-100/70 mt-2 text-right">Higher score = eat more</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <h3 className="text-neutral-500 text-xs sm:text-sm font-medium mb-1">Consumed</h3>
          <p className="text-lg sm:text-xl font-bold text-neutral-800">{caloriesConsumed} <span className="text-xs text-neutral-500 font-normal">kcal</span></p>
        </div>
        <div className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">🔥</div>
          <h3 className="text-neutral-500 text-xs sm:text-sm font-medium mb-1">Burned</h3>
          <p className="text-lg sm:text-xl font-bold text-rose-600">{caloriesBurned} <span className="text-xs text-rose-400 font-normal">kcal</span></p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2">
          <h3 className="text-neutral-500 text-xs sm:text-sm font-medium mb-1">Remaining</h3>
          <p className="text-lg sm:text-xl font-bold text-neutral-800">{remainingCalories} <span className="text-xs text-neutral-500 font-normal">kcal</span></p>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-neutral-800 mb-5">Macros Today</h3>
        <div className="space-y-5">
          <MacroBar label="Protein" amount={proteinConsumed} max={Math.round(profile.targetCalories * 0.3 / 4)} color="bg-orange-500" />
          <MacroBar label="Carbs" amount={carbsConsumed} max={Math.round(profile.targetCalories * 0.5 / 4)} color="bg-blue-500" />
          <MacroBar label="Fat" amount={fatConsumed} max={Math.round(profile.targetCalories * 0.2 / 9)} color="bg-purple-500" />
        </div>
      </div>
    </div>
  );
}

function MacroBar({ label, amount, max, color }: { label: string, amount: number, max: number, color: string }) {
  const percentage = Math.min(100, (amount / max) * 100) || 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-neutral-700">{label}</span>
        <span className="text-neutral-400 text-xs">{Math.round(amount)}g / {max}g</span>
      </div>
      <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1 }}
          className={`${color} h-full rounded-full`} 
        />
      </div>
    </div>
  );
}
