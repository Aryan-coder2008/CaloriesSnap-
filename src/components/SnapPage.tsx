import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle2, Info } from 'lucide-react';
import { analyzeFoodImage, BaseFoodNutrition } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Meal } from '../types';

export default function SnapPage({ onAddMeal }: { onAddMeal: (meal: Meal) => void }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<BaseFoodNutrition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number | ''>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImageSrc(dataUrl);
        handleAnalyze(dataUrl, file.type);
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
      reader.readAsDataURL(file);
    }
    // reset input so same file can be selected again
    e.target.value = '';
  };

  const handleAnalyze = async (dataUrl: string, mimeType: string) => {
    setIsAnalyzing(true);
    setNutritionData(null);
    setQuantity('');
    setError(null);
    try {
      const result = await analyzeFoodImage(dataUrl, mimeType);
      setNutritionData(result);
      setQuantity(result.unitAmount); // Default to the analyzed unit amount
    } catch (err: any) {
      setError(err.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setNutritionData(null);
    setQuantity('');
    setError(null);
  };

  const handleSaveMeal = () => {
    if (nutritionData && quantity !== '') {
      const multiplier = Number(quantity) / nutritionData.unitAmount;
      const newMeal: Meal = {
        foodName: nutritionData.foodName,
        calories: Math.round(nutritionData.caloriesPerUnitAmount * multiplier),
        protein: Math.round(nutritionData.proteinPerUnitAmount * multiplier),
        carbs: Math.round(nutritionData.carbsPerUnitAmount * multiplier),
        fat: Math.round(nutritionData.fatPerUnitAmount * multiplier),
        description: nutritionData.description,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        image: imageSrc || undefined
      };
      onAddMeal(newMeal);
      reset();
    }
  };

  const getCalculatedValue = (val: number) => {
    if (!nutritionData || quantity === '') return 0;
    const multiplier = Number(quantity) / nutritionData.unitAmount;
    return Math.round(val * multiplier);
  };

  return (
    <div className="p-4 sm:p-6 min-h-full flex flex-col pt-8">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-start gap-3"
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!imageSrc ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-6"
          >
            <div className="w-24 h-24 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 text-neutral-800">Log a Meal</h2>
              <p className="text-neutral-500 max-w-xs mx-auto mb-8">
                Snap a photo or upload an image to identify the food and track your calorie intake.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-2xl font-medium transition-colors shadow-lg shadow-primary-600/30"
              >
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex justify-center items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 px-6 py-4 rounded-2xl font-medium transition-colors shadow-sm"
              >
                <Upload className="w-5 h-5" />
                Upload Photo
              </button>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                ref={nativeCameraInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col pb-32 sm:pb-24"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-neutral-200 bg-neutral-100 aspect-video sm:aspect-square shrink-0 mb-6 w-full max-w-sm mx-auto">
              <img src={imageSrc} alt="Food analysis" className="w-full h-full object-cover" />
              <button 
                onClick={reset}
                className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center text-neutral-500 py-8">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
                  <p className="font-medium animate-pulse">Analyzing nutritional data...</p>
                </div>
              ) : nutritionData ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-xl font-bold leading-tight text-neutral-800">{nutritionData.foodName}</h2>
                    <CheckCircle2 className="w-6 h-6 text-primary-500 shrink-0" />
                  </div>
                  
                  <p className="text-neutral-500 text-sm mb-6 pb-6 border-b border-neutral-100">
                    {nutritionData.description}
                  </p>
                  
                  <div className="flex flex-col gap-4 mb-6 pt-2">
                    <div className="bg-primary-50/50 rounded-2xl p-4 border border-primary-100">
                      <label className="text-sm font-bold text-neutral-800 mb-3 flex flex-col">
                        <span className="flex items-center gap-1.5">
                          Confirm Quantity
                          <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ml-auto">Required</span>
                        </span>
                        <span className="text-xs text-neutral-500 font-normal mt-1">Adjust the amount below to match your actual portion size.</span>
                      </label>
                      <div className="flex bg-white rounded-xl border-2 border-primary-200 focus-within:border-primary-500 overflow-hidden transition-colors shadow-sm">
                        <input 
                          type="number" 
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                          className="w-full bg-transparent px-4 py-3 text-xl font-black text-neutral-800 outline-none"
                          placeholder={`e.g., ${nutritionData.unitAmount}`}
                        />
                        <div className="bg-neutral-50 border-l border-neutral-200 px-5 py-3 flex items-center justify-center font-bold text-neutral-600 shrink-0 min-w-[5rem]">
                          {nutritionData.unitName}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5 ml-1">
                        <Info className="w-4 h-4 text-primary-500" />
                        Base estimate: {nutritionData.caloriesPerUnitAmount} kcal per {nutritionData.unitAmount} {nutritionData.unitName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-primary-50 rounded-2xl p-4 mb-4">
                    <span className="font-semibold text-primary-800">Total Calories</span>
                    <span className="text-2xl font-black text-primary-600">
                      {getCalculatedValue(nutritionData.caloriesPerUnitAmount)} <span className="text-sm font-medium">kcal</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-neutral-50 rounded-2xl p-3 flex flex-col items-center text-center">
                      <span className="text-lg font-bold text-neutral-700">{getCalculatedValue(nutritionData.proteinPerUnitAmount)}g</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Protein</span>
                    </div>
                    <div className="bg-neutral-50 rounded-2xl p-3 flex flex-col items-center text-center">
                      <span className="text-lg font-bold text-neutral-700">{getCalculatedValue(nutritionData.carbsPerUnitAmount)}g</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Carbs</span>
                    </div>
                    <div className="bg-neutral-50 rounded-2xl p-3 flex flex-col items-center text-center">
                      <span className="text-lg font-bold text-neutral-700">{getCalculatedValue(nutritionData.fatPerUnitAmount)}g</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Fat</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={reset}
                      className="flex-1 px-4 py-3.5 rounded-xl font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                      Retake
                    </button>
                    <button 
                      onClick={handleSaveMeal}
                      disabled={quantity === '' || Number(quantity) <= 0}
                      className="flex-[2] px-4 py-3.5 rounded-xl font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Save to Diary
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400 py-8">
                  <Info className="w-10 h-10 mb-4" />
                  <p>Analysis failed. Please try again.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
