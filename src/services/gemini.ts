import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface FoodNutrition {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
}

export async function analyzeFoodImage(base64Image: string, mimeType: string): Promise<FoodNutrition> {
  const promptString = `
    Analyze this image of food. Identify the food item(s) present, with a strong knowledge of global cuisine and particularly Indian food (e.g., various curries, breads, sweets, street foods).
    Provide a realistic estimation of the nutritional content for the portion shown in the image.
    If multiple items are shown, provide the aggregate nutrition for the entire meal shown.
  `;

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image.replace(/^data:image\/\w+;base64,/, ""), // ensure no prefix
      },
    };
    const textPart = {
      text: promptString,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: {
              type: Type.STRING,
              description: "Name of the dish/meal",
            },
            calories: {
              type: Type.NUMBER,
              description: "Total estimated calories",
            },
            protein: {
              type: Type.NUMBER,
              description: "Estimated protein in grams",
            },
            carbs: {
              type: Type.NUMBER,
              description: "Estimated carbohydrates in grams",
            },
            fat: {
              type: Type.NUMBER,
              description: "Estimated fat in grams",
            },
            description: {
              type: Type.STRING,
              description: "A brief description of what you identified and how you estimated the nutrition.",
            },
          },
          required: ["foodName", "calories", "protein", "carbs", "fat", "description"],
        },
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as FoodNutrition;
    }
    throw new Error('No response text received');
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze food image. Please try again.');
  }
}

export interface BodyConditionAnalysis {
  condition: string;
  recommendedCalories: number;
}

export async function analyzeBodyCondition(
  name: string, 
  age: number, 
  weight: number, 
  weightUnit: string, 
  height: number, 
  heightUnit: string, 
  bmi: number
): Promise<BodyConditionAnalysis> {
  const promptString = `
    You are a professional nutritionist. Evaluate the body condition for a person with the following details:
    Name: ${name}
    Age: ${age} years
    Weight: ${weight} ${weightUnit}
    Height: ${height} ${heightUnit}
    BMI: ${bmi.toFixed(1)}

    Provide a brief, encouraging assessment of their body condition and suggest a realistic daily calorie target to either maintain a healthy weight or reach a healthy weight gradually.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptString,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            condition: {
              type: Type.STRING,
              description: "Brief assessment of body condition (e.g., Underweight, Normal weight, Overweight) and an encouraging personalized message.",
            },
            recommendedCalories: {
              type: Type.NUMBER,
              description: "Daily suggested calorie target",
            },
          },
          required: ["condition", "recommendedCalories"],
        },
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as BodyConditionAnalysis;
    }
    throw new Error('No response text received');
  } catch (error) {
    console.error('Error analyzing body condition:', error);
    throw new Error('Failed to analyze body condition. Please try setting it manually.');
  }
}

export interface ExerciseEstimate {
  activityName: string;
  caloriesBurned: number;
}

export interface WorkoutPlanExercise {
  activityName: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export async function extractAndEstimateWorkoutPlan(
  base64Data: string,
  mimeType: string,
  dayQuery: string,
  weight: number,
  weightUnit: string
): Promise<WorkoutPlanExercise[]> {
  const promptString = `
    Analyze this workout plan document. 
    Find the exercises scheduled for: ${dayQuery}. (If it's by day of week like "Monday" or relative like "Day 1", try to match it. If not found, just return a typical workout from the plan).
    For each exercise found, provide:
    1. The cleaned up activity name
    2. Estimated duration in minutes (guess based on sets/reps if not specified)
    3. Estimated calories burned for a person weighing ${weight} ${weightUnit}.
  `;

  try {
    const filePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data.replace(/^data:(.*);base64,/, ""),
      },
    };
    const textPart = { text: promptString };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [filePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              activityName: { type: Type.STRING, description: "Name of the exercise" },
              durationMinutes: { type: Type.NUMBER, description: "Estimated duration in minutes" },
              caloriesBurned: { type: Type.NUMBER, description: "Estimated calories burned" },
            },
            required: ["activityName", "durationMinutes", "caloriesBurned"],
          }
        },
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as WorkoutPlanExercise[];
    }
    throw new Error('No response text received');
  } catch (error) {
    console.error('Error extracting workout plan:', error);
    throw new Error('Failed to extract workout plan.');
  }
}


export async function estimateExerciseCalories(activity: string, durationMinutes: number, weight: number, weightUnit: string): Promise<ExerciseEstimate> {
  const promptString = `
    Estimate the calories burned for the following exercise:
    Activity: ${activity}
    Duration: ${durationMinutes} minutes
    User Weight: ${weight} ${weightUnit}

    Provide the recognized activity name and a realistic estimate of calories burned.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptString,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activityName: {
              type: Type.STRING,
              description: "Cleaned up standard name of the activity",
            },
            caloriesBurned: {
              type: Type.NUMBER,
              description: "Estimated calories burned",
            },
          },
          required: ["activityName", "caloriesBurned"],
        },
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as ExerciseEstimate;
    }
    throw new Error('No response text received');
  } catch (error) {
    console.error('Error estimating exercise calories:', error);
    throw new Error('Failed to estimate exercise calories.');
  }
}
