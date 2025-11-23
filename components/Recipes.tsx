import React, { useState } from 'react';
import { generateRecipe } from '../services/geminiService';
import { Recipe } from '../types';

const Recipes: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [goal, setGoal] = useState('Emagrecer');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setRecipe(null);
    try {
      const result = await generateRecipe(ingredients, goal);
      setRecipe({ ...result, id: Date.now().toString() });
    } catch (e) {
      alert("Erro ao gerar receita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen">
       <h2 className="text-2xl font-bold text-gray-800 mb-6">Receitas Inteligentes</h2>

       <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
         <label className="block text-sm font-bold text-gray-700 mb-2">O que tem na sua geladeira?</label>
         <input 
            type="text" 
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ex: Frango, batata doce, brócolis"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all mb-4"
         />

         <label className="block text-sm font-bold text-gray-700 mb-2">Seu objetivo:</label>
         <div className="flex gap-2 mb-6">
            {['Emagrecer', 'Ganhar Massa', 'Manter'].map((g) => (
                <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                        goal === g 
                        ? 'bg-brand-100 text-brand-700 border border-brand-200' 
                        : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                    }`}
                >
                    {g}
                </button>
            ))}
         </div>

         <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-brand-600 active:scale-95 transition-all disabled:opacity-50"
         >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Gerar Receita IA'}
         </button>
       </div>

       {recipe && (
         <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 animate-fade-in-up">
            <div className="h-40 bg-gray-200 relative">
                 {/* Placeholder Image */}
                <img src={`https://picsum.photos/400/200?random=${recipe.id}`} className="w-full h-full object-cover" alt="Recipe" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                    <i className="fas fa-clock mr-1 text-brand-500"></i> {recipe.time}
                </div>
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 w-3/4">{recipe.title}</h3>
                    <div className="text-right">
                         <span className="block font-bold text-brand-600">{recipe.calories}</span>
                         <span className="text-[10px] text-gray-400 uppercase">kcal</span>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Ingredientes</h4>
                    <ul className="grid grid-cols-2 gap-2">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span> {ing}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Modo de Preparo</h4>
                    <ol className="space-y-4">
                        {recipe.instructions.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-600">
                                <span className="flex-shrink-0 w-6 h-6 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                <span className="pt-0.5">{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default Recipes;