import React, { useState } from 'react';
import { User, UserStats, DietaryPreference, Allergen } from '../types';

interface OnboardingProps {
  onComplete: (stats: UserStats, preferences: DietaryPreference[], allergies: Allergen[]) => void;
  initialData?: UserStats;
}

const DIETARY_OPTIONS: DietaryPreference[] = [
  'Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose', 'Low Carb', 'Keto', 'Sem Açúcar'
];

const ALLERGY_OPTIONS: Allergen[] = [
  'Amendoim', 'Leite', 'Ovo', 'Trigo', 'Soja', 'Mariscos', 'Castanhas', 'Peixe'
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserStats>(initialData || {
    gender: 'male',
    age: 25,
    height: 170,
    currentWeight: 70,
    targetWeight: 65,
    activityLevel: 'sedentary'
  });
  const [preferences, setPreferences] = useState<DietaryPreference[]>([]);
  const [allergies, setAllergies] = useState<Allergen[]>([]);

  const handleChange = (field: keyof UserStats, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePreference = (pref: DietaryPreference) => {
    setPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const toggleAllergy = (allergy: Allergen) => {
    setAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(formData, preferences, allergies);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-12 animate-fade-in-up">
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center">
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
          <div 
            className="bg-brand-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Vamos personalizar.</h2>
        <p className="text-gray-500 mb-8">
          {step === 1 && "Precisamos de alguns dados para calcular seu metabolismo."}
          {step === 2 && "Quais são suas medidas atuais?"}
          {step === 3 && "Qual é o seu objetivo de peso?"}
          {step === 4 && "Você tem alguma restrição alimentar?"}
        </p>

        {/* Step 1: Gender & Age */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Gênero Biológico</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleChange('gender', 'male')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.gender === 'male' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <i className="fas fa-mars text-2xl"></i>
                  <span className="font-bold">Masculino</span>
                </button>
                <button
                  onClick={() => handleChange('gender', 'female')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.gender === 'female' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-100 text-gray-400'
                  }`}
                >
                  <i className="fas fa-venus text-2xl"></i>
                  <span className="font-bold">Feminino</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Idade</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                className="w-full bg-gray-50 border-gray-200 rounded-xl p-4 text-xl font-bold text-center focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Height & Current Weight */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Altura (cm)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange('height', parseInt(e.target.value))}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl p-4 text-xl font-bold text-center focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Peso Atual (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.currentWeight}
                  onChange={(e) => handleChange('currentWeight', parseFloat(e.target.value))}
                  className="w-full bg-gray-50 border-gray-200 rounded-xl p-4 text-xl font-bold text-center focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">kg</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Target Weight & Activity */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Meta de Peso (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value))}
                  className="w-full bg-brand-50 border-brand-200 rounded-xl p-4 text-xl font-bold text-brand-700 text-center focus:ring-2 focus:ring-brand-500 outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 font-bold">kg</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {formData.targetWeight < formData.currentWeight 
                  ? "Objetivo: Perder Peso" 
                  : formData.targetWeight > formData.currentWeight 
                    ? "Objetivo: Ganhar Massa" 
                    : "Objetivo: Manter Peso"}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
               <p><i className="fas fa-info-circle mr-1"></i> Calcularemos suas calorias diárias baseadas no seu Metabolismo Basal (TMB).</p>
            </div>
          </div>
        )}

        {/* Step 4: Preferences & Allergies */}
        {step === 4 && (
          <div className="space-y-6 overflow-y-auto max-h-[60vh] pb-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Preferências / Dieta</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => togglePreference(opt)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                      preferences.includes(opt)
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Alergias / Intolerâncias</label>
              <p className="text-xs text-gray-400 mb-2">Avisaremos se encontrarmos estes ingredientes.</p>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleAllergy(opt)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                      allergies.includes(opt)
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          className="mt-10 w-full bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-brand-500 transition-all active:scale-95"
        >
          {step === 4 ? 'Finalizar e Calcular' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;