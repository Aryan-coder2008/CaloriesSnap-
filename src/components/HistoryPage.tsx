import React, { useState } from 'react';
import { Meal, Exercise } from '../types';
import { Clock, Trash2, Pencil, Check, X, Dumbbell, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

type HistoryItem = 
  | { type: 'meal'; data: Meal; timestamp: number }
  | { type: 'exercise'; data: Exercise; timestamp: number };

export default function HistoryPage({ 
  meals, 
  setMeals, 
  exercises = [], 
  setExercises 
}: { 
  meals: Meal[], 
  setMeals: (m: Meal[]) => void,
  exercises?: Exercise[],
  setExercises?: (e: Exercise[]) => void
}) {
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Meal | null>(null);

  const removeMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const removeExercise = (id: string) => {
    if (setExercises) {
      setExercises(exercises.filter(e => e.id !== id));
    }
  };

  const startEditing = (meal: Meal) => {
    setEditingMealId(meal.id);
    setEditForm({ ...meal });
  };

  const cancelEditing = () => {
    setEditingMealId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      setMeals(meals.map(m => m.id === editForm.id ? editForm : m));
      setEditingMealId(null);
      setEditForm(null);
    }
  };

  const allItems: HistoryItem[] = [
    ...meals.map(m => ({ type: 'meal' as const, data: m, timestamp: m.timestamp })),
    ...exercises.map(e => ({ type: 'exercise' as const, data: e, timestamp: e.timestamp }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  // grouping by date
  const groupedItems = allItems.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="p-6">
      <header className="mb-6 mt-4">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">Diary</h1>
        <p className="text-neutral-500 text-sm">Your past meals and workouts</p>
      </header>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white rounded-3xl border border-neutral-100 border-dashed">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-medium text-neutral-700 mb-2">No activity tracked yet</h2>
          <p className="text-neutral-400 text-sm">Use the Snap or Activity tabs to add items.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([date, items]) => {
            const dailyMeals = items.filter(i => i.type === 'meal').map(i => i.data as Meal);
            const dailyEx = items.filter(i => i.type === 'exercise').map(i => i.data as Exercise);
            
            const dailyCalsConsumed = dailyMeals.reduce((sum, m) => sum + m.calories, 0);
            const dailyCalsBurned = dailyEx.reduce((sum, e) => sum + e.caloriesBurned, 0);
            const netCals = Math.max(0, dailyCalsConsumed - dailyCalsBurned);
            
            return (
              <div key={date}>
                <div className="flex justify-between items-end mb-4 border-b border-neutral-200 pb-2">
                  <h2 className="font-bold text-neutral-800">{date}</h2>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-800">{netCals} net kcal</span>
                    <div className="text-[10px] text-neutral-500 font-medium space-x-2 mt-0.5">
                      <span className="text-emerald-600">+{dailyCalsConsumed}</span>
                      {dailyCalsBurned > 0 && <span className="text-rose-500">-{dailyCalsBurned}</span>}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => {
                    if (item.type === 'meal') {
                      const meal = item.data as Meal;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={`meal-${meal.id}`} 
                          className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-4"
                        >
                          {meal.image ? (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-neutral-100 hidden sm:block relative">
                              <div className="absolute top-1 left-1 bg-white/80 p-1 rounded-md backdrop-blur-sm text-emerald-600">
                                <Utensils className="w-3 h-3" />
                              </div>
                              <img src={meal.image} alt={meal.foodName} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-neutral-100 hidden sm:flex items-center justify-center text-neutral-300 relative">
                              <div className="absolute top-2 left-2 text-emerald-600">
                                <Utensils className="w-4 h-4" />
                              </div>
                              <Clock className="w-6 h-6" />
                            </div>
                          )}
                          
                          {editingMealId === meal.id && editForm ? (
                            <div className="flex-1 flex flex-col gap-2">
                              <input 
                                type="text" 
                                value={editForm.foodName} 
                                onChange={(e) => setEditForm({...editForm, foodName: e.target.value})}
                                className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm bg-neutral-50 mb-1"
                                placeholder="Food Name"
                              />
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <label className="text-xs text-neutral-500">Calories</label>
                                  <input 
                                    type="number" 
                                    value={editForm.calories} 
                                    onChange={(e) => setEditForm({...editForm, calories: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-neutral-200 rounded-lg px-2 py-1 bg-neutral-50"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-500">Protein (g)</label>
                                  <input 
                                    type="number" 
                                    value={editForm.protein} 
                                    onChange={(e) => setEditForm({...editForm, protein: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-neutral-200 rounded-lg px-2 py-1 bg-neutral-50"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-500">Carbs (g)</label>
                                  <input 
                                    type="number" 
                                    value={editForm.carbs} 
                                    onChange={(e) => setEditForm({...editForm, carbs: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-neutral-200 rounded-lg px-2 py-1 bg-neutral-50"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-neutral-500">Fat (g)</label>
                                  <input 
                                    type="number" 
                                    value={editForm.fat} 
                                    onChange={(e) => setEditForm({...editForm, fat: parseFloat(e.target.value) || 0})}
                                    className="w-full border border-neutral-200 rounded-lg px-2 py-1 bg-neutral-50"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-2">
                                <button onClick={cancelEditing} className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                                <button onClick={saveEdit} className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  {meal.image ? (
                                    <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-neutral-100 sm:hidden float-left mr-3 mb-1">
                                      <img src={meal.image} alt={meal.foodName} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 shrink-0 rounded-lg bg-neutral-100 sm:hidden float-left mr-3 mb-1 flex items-center justify-center text-neutral-300">
                                      <Utensils className="w-4 h-4" />
                                    </div>
                                  )}
                                  <h3 className="font-semibold text-neutral-800 break-words flex-1" title={meal.foodName}>{meal.foodName}</h3>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button 
                                      onClick={() => startEditing(meal)}
                                      className="text-neutral-300 hover:text-blue-500 transition-colors p-1"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => removeMeal(meal.id)}
                                      className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-emerald-600 font-bold text-sm clear-left sm:clear-none">+{meal.calories} kcal</p>
                              </div>
                              
                              <div className="flex gap-3 text-xs text-neutral-500 font-medium mt-2 sm:mt-0">
                                <span>P: {meal.protein}g</span>
                                <span>C: {meal.carbs}g</span>
                                <span>F: {meal.fat}g</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    } else {
                      const ex = item.data as Exercise;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={`ex-${ex.id}`} 
                          className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 flex flex-col sm:flex-row gap-4"
                        >
                           <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-rose-50 hidden sm:flex flex-col items-center justify-center text-rose-500">
                              <Dumbbell className="w-8 h-8 mb-1" />
                              <span className="text-[10px] font-bold uppercase">{ex.durationMinutes} min</span>
                           </div>
                           
                           <div className="flex-1 flex flex-col justify-between overflow-hidden">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <div className="w-12 h-12 shrink-0 rounded-lg bg-rose-50 sm:hidden float-left mr-3 mb-1 flex items-center justify-center text-rose-500">
                                    <Dumbbell className="w-6 h-6" />
                                  </div>
                                  <h3 className="font-semibold text-neutral-800 break-words flex-1">{ex.activityName}</h3>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button 
                                      onClick={() => removeExercise(ex.id)}
                                      className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-rose-600 font-bold text-sm clear-left sm:clear-none">-{ex.caloriesBurned} kcal</p>
                              </div>
                              <div className="flex gap-3 text-xs text-neutral-500 font-medium mt-2 sm:mt-0">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {ex.durationMinutes} minutes</span>
                              </div>
                           </div>
                        </motion.div>
                      )
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
