import { FoodNutrition } from './services/gemini';

export interface Meal extends FoodNutrition {
  id: string;
  timestamp: number;
  image?: string;
}

export interface Exercise {
  id: string;
  timestamp: number;
  activityName: string;
  caloriesBurned: number;
  durationMinutes: number;
}

export interface UserProfile {
  targetCalories: number;
  name?: string;
  age?: number;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  height?: number; // internally stored as cm
  heightUnit?: 'cm' | 'ft';
  bmi?: number;
  isOnboarded?: boolean;
  themeColor?: string;
  workoutPlanData?: string;
  workoutPlanMimeType?: string;
  darkMode?: boolean;
  appRating?: number;
}
