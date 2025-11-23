import React, { useState, useRef } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { FoodAnalysis, HealthStatus, FoodLogEntry, MealType, User } from '../types';

interface ScannerProps {
  onLogFood: (food: FoodLogEntry) => void;
  user: User | null;
}

// Helper to generate a simple hash from the image string for caching keys
const generateImageHash = (str: string): string => {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

const CACHE_KEY = 'fitscan_food_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const Scanner: React.FC<ScannerProps> = ({ onLogFood, user }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.LUNCH);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setAnalysis(null); // Reset previous analysis
        setIsFavorite(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setLoading(true);
    
    try {
      const base64Data = image.split(',')[1];
      const imageHash = generateImageHash(base64Data);
      // Create a composite key that includes user allergies to invalidate cache if allergies change
      const userHash = user ? (user.allergies || []).join('') + (user.preferences || []).join('') : 'guest';
      const compositeKey = `${imageHash}_${userHash}`;

      // 1. Check Cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const cacheMap = JSON.parse(cachedData);
        const entry = cacheMap[compositeKey];
        
        // If entry exists and is not expired (less than CACHE_DURATION old)
        if (entry && (Date.now() - entry.timestamp < CACHE_DURATION)) {
          console.log("Using cached analysis result");
          setAnalysis(entry.data);
          setLoading(false);
          return;
        }
      }

      // 2. Call API if not cached
      const result = await analyzeFoodImage(base64Data, user);
      setAnalysis(result);

      // 3. Save to Cache
      const currentCache = cachedData ? JSON.parse(cachedData) : {};
      
      const newCache = {
        ...currentCache,
        [compositeKey]: {
          timestamp: Date.now(),
          data: result
        }
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));

    } catch (error) {
      alert("Não foi possível analisar o alimento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLog = () => {
    if (!analysis) return;
    
    const entry: FoodLogEntry = {
      ...analysis,
      id: Date.now().toString(),
      timestamp: Date.now(),
      mealType: selectedMealType
    };
    
    onLogFood(entry);
  };

  const resetScanner = () => {
    setImage(null);
    setAnalysis(null);
    setIsFavorite(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, this would save to a persistent list
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Scanner Inteligente</h2>

      {!image ? (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
          <div className="bg-white p-6 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-barcode text-3xl text-brand-500"></i>
          </div>
          <p className="text-gray-600 font-bold">Escanear Alimento</p>
          <p className="text-gray-400 text-xs mt-2 text-center px-8">Identificamos calorias, ingredientes e alergênicos automaticamente.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
            capture="environment"
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-[4/3]">
            <img src={image} alt="Scanned Food" className="w-full h-full object-cover" />
            <button 
              onClick={resetScanner}
              className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-full text-white shadow-sm hover:bg-black/70"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {!analysis && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all ${
                loading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg active:scale-95'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-magic fa-spin"></i> Processando IA...
                </span>
              ) : 'Analisar Agora'}
            </button>
          )}
        </div>
      )}

      {analysis && (
        <div className="mt-6 animate-fade-in-up space-y-4">
          
          {/* CRITICAL ALERT */}
          {analysis.allergyWarning && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
               <i className="fas fa-exclamation-triangle text-red-500 mt-1"></i>
               <div>
                 <h3 className="font-bold text-red-800 uppercase text-xs">Atenção: Alergênico Detectado</h3>
                 <p className="text-red-700 text-sm font-semibold">{analysis.allergyWarning}</p>
               </div>
            </div>
          )}

          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 relative">
            <button 
              onClick={toggleFavorite}
              className={`absolute top-6 right-6 text-xl transition-colors ${isFavorite ? 'text-red-500' : 'text-gray-300'}`}
            >
              <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
            </button>

            <div className="flex gap-4 items-center mb-6">
               {/* Health Score Gauge */}
               <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={226} 
                      strokeDashoffset={226 - (226 * analysis.healthScore) / 100} 
                      className={`${getScoreColor(analysis.healthScore)} transition-all duration-1000 ease-out`} 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-xl font-bold ${getScoreColor(analysis.healthScore)}`}>{analysis.healthScore}</span>
                    <span className="text-[8px] uppercase text-gray-400 font-bold">Score</span>
                  </div>
               </div>
               
               <div>
                  <h3 className="text-xl font-bold text-gray-800 capitalize leading-tight">{analysis.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{analysis.calories} kcal <span className="text-gray-300">|</span> 100g</p>
               </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              {analysis.description}
            </p>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2 mb-6">
               {[
                 { label: 'Prot', val: analysis.protein, color: 'bg-green-100 text-green-700' },
                 { label: 'Carb', val: analysis.carbs, color: 'bg-orange-100 text-orange-700' },
                 { label: 'Gord', val: analysis.fat, color: 'bg-red-100 text-red-700' },
                 { label: 'Açúcar', val: analysis.sugar, color: 'bg-purple-100 text-purple-700' },
               ].map((m, i) => (
                 <div key={i} className={`rounded-xl p-2 text-center ${m.color}`}>
                    <span className="block text-[10px] uppercase font-bold opacity-70">{m.label}</span>
                    <span className="font-bold text-sm">{m.val}</span>
                 </div>
               ))}
            </div>

            {/* Ingredients Analysis */}
            <div className="space-y-3 mb-6">
              {analysis.beneficialIngredients.length > 0 && (
                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                     <i className="fas fa-check-circle text-green-500"></i> Pontos Fortes
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.beneficialIngredients.map((ing, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium border border-green-100">
                          {ing}
                        </span>
                      ))}
                   </div>
                </div>
              )}
              
              {analysis.harmfulIngredients.length > 0 && (
                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                     <i className="fas fa-exclamation-circle text-red-500"></i> Pontos de Atenção
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {analysis.harmfulIngredients.map((ing, idx) => (
                        <span key={idx} className="bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-medium border border-red-100">
                          {ing}
                        </span>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Alternatives */}
            {analysis.alternatives.length > 0 && analysis.healthScore < 70 && (
               <div className="mb-6">
                 <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Alternativas Melhores</h4>
                 <ul className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    {analysis.alternatives.map((alt, idx) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-center gap-2 mb-1 last:mb-0">
                        <i className="fas fa-arrow-right text-xs"></i> {alt}
                      </li>
                    ))}
                 </ul>
               </div>
            )}

            {/* Logging Section */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
                {Object.values(MealType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedMealType === type
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleSaveToLog}
                className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold shadow-md hover:bg-brand-600 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus-circle"></i> Adicionar ao Diário
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;