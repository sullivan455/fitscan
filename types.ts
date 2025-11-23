export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  RECIPES = 'RECIPES',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  ONBOARDING = 'ONBOARDING'
}

export enum HealthStatus {
  HEALTHY = 'Saudável',
  MODERATE = 'Moderado',
  AVOID = 'Evitar'
}

export enum MealType {
  BREAKFAST = 'Café da Manhã',
  LUNCH = 'Almoço',
  DINNER = 'Jantar',
  SNACK = 'Lanche'
}

export type DietaryPreference = 'Vegetariano' | 'Vegano' | 'Sem Glúten' | 'Sem Lactose' | 'Low Carb' | 'Keto' | 'Sem Açúcar';
export type Allergen = 'Amendoim' | 'Leite' | 'Ovo' | 'Trigo' | 'Soja' | 'Mariscos' | 'Castanhas' | 'Peixe';

export interface UserStats {
  age: number;
  height: number; // cm
  currentWeight: number; // kg
  targetWeight: number; // kg
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  stats?: UserStats;
  preferences?: DietaryPreference[];
  allergies?: Allergen[];
}

export interface FoodAnalysis {
  name: string;
  status: HealthStatus;
  healthScore: number; // 0 to 100
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  description: string;
  alternatives: string[];
  // New Fields
  harmfulIngredients: string[];
  beneficialIngredients: string[];
  allergyWarning?: string; // If user is allergic
}

export interface FoodLogEntry extends FoodAnalysis {
  id: string;
  timestamp: number;
  mealType: MealType;
}

export interface ActivityData {
  steps: number;
  activeCalories: number;
  heartRate: number;
  source: 'Fitbit' | 'Apple Health' | 'Garmin' | null;
  isConnected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  calories: number;
  time: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string; // Placeholder
}