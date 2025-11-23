import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { FoodLogEntry, ActivityData, MealType, UserStats } from '../types';

interface DashboardProps {
  foodLog: FoodLogEntry[];
  activityData: ActivityData;
  userStats?: UserStats;
  dailyGoal: number;
}

const Dashboard: React.FC<DashboardProps> = ({ foodLog, activityData, userStats, dailyGoal }) => {
  // Calculations
  const totalConsumed = foodLog.reduce((acc, item) => acc + item.calories, 0);
  const totalTarget = dailyGoal + activityData.activeCalories;
  const remaining = totalTarget - totalConsumed;
  const progressPercentage = Math.min((totalConsumed / totalTarget) * 100, 100);

  // Group by meal for display
  const mealsGrouped = foodLog.reduce((acc, item) => {
    if (!acc[item.mealType]) acc[item.mealType] = [];
    acc[item.mealType].push(item);
    return acc;
  }, {} as Record<MealType, FoodLogEntry[]>);

  // Parse macros (rough approximation removing 'g')
  const totalProt = foodLog.reduce((acc, item) => acc + parseFloat(item.protein) || 0, 0);
  const totalCarb = foodLog.reduce((acc, item) => acc + parseFloat(item.carbs) || 0, 0);
  const totalFat = foodLog.reduce((acc, item) => acc + parseFloat(item.fat) || 0, 0);
  
  // Safe defaults for macros if empty
  const totalMacro = totalProt + totalCarb + totalFat || 1; 
  
  const macroData = [
    { name: 'Prot', value: Math.round((totalProt / totalMacro) * 100) || 30, color: '#22c55e' },
    { name: 'Carb', value: Math.round((totalCarb / totalMacro) * 100) || 45, color: '#facc15' },
    { name: 'Gord', value: Math.round((totalFat / totalMacro) * 100) || 25, color: '#f87171' },
  ];

  const weightDiff = userStats ? userStats.currentWeight - userStats.targetWeight : 0;
  const isWeightLoss = weightDiff > 0;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto animate-fade-in-up">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá! 👋</h1>
          <p className="text-gray-500 text-sm">
            {remaining > 0 ? `${Math.round(remaining)} kcal restantes hoje.` : 'Meta diária atingida!'}
          </p>
        </div>
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
             <img src="https://picsum.photos/100/100" alt="Avatar" />
          </div>
          {activityData.isConnected && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-500 border-2 border-white rounded-full flex items-center justify-center">
              <i className="fas fa-link text-[8px] text-white"></i>
            </div>
          )}
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Calorie Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 col-span-2">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center gap-2 text-orange-500">
               <i className="fas fa-fire"></i>
               <span className="text-xs font-bold uppercase">Calorias (Hoje)</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">{totalConsumed} / {totalTarget}</span>
          </div>
          
          <div className="flex justify-between items-end mb-3">
             <p className="text-4xl font-bold text-gray-800">{Math.round(remaining)}</p>
             <div className="text-right pb-1">
               <p className="text-xs text-gray-400">restantes</p>
             </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          {activityData.isConnected ? (
             <p className="text-[10px] text-green-600 mt-2 flex items-center gap-1">
               <i className="fas fa-plus-circle"></i> Meta aumentada em {activityData.activeCalories} kcal por atividade.
             </p>
          ) : (
             <p className="text-[10px] text-gray-400 mt-2">Baseado no seu metabolismo: {dailyGoal} kcal</p>
          )}
        </div>

        {/* Weight Card */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-brand-600 relative z-10">
             <i className="fas fa-weight-scale"></i>
             <span className="text-xs font-bold uppercase">Peso</span>
          </div>
          {userStats ? (
            <>
              <p className="text-3xl font-bold text-gray-800 relative z-10">{userStats.currentWeight} <span className="text-sm font-normal text-gray-400">kg</span></p>
              <div className="mt-2 relative z-10">
                <p className="text-xs text-gray-500">Meta: <span className="font-bold">{userStats.targetWeight}kg</span></p>
                <div className="flex items-center gap-1 mt-1">
                   {isWeightLoss ? (
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">Faltam {Math.abs(weightDiff).toFixed(1)}kg</span>
                   ) : (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Ganhar {Math.abs(weightDiff).toFixed(1)}kg</span>
                   )}
                </div>
              </div>
            </>
          ) : (
             <p className="text-sm text-gray-400">Sem dados</p>
          )}
        </div>

        {/* Activity Card (Dynamic) */}
        <div className={`p-5 rounded-3xl shadow-sm border transition-colors ${activityData.isConnected ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
           <div className={`flex items-center gap-2 mb-2 ${activityData.isConnected ? 'text-blue-300' : 'text-blue-500'}`}>
             <i className={`fas ${activityData.isConnected ? 'fa-bolt' : 'fa-shoe-prints'}`}></i>
             <span className="text-xs font-bold uppercase">{activityData.isConnected ? 'Atividade' : 'Passos'}</span>
          </div>
          {activityData.isConnected ? (
            <>
               <p className="text-3xl font-bold text-white">{activityData.steps}</p>
               <p className="text-xs text-gray-400 mt-1">passos ({activityData.activeCalories} kcal)</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-gray-800">Desconectado</p>
              <p className="text-[10px] text-gray-400 mt-1">Vá em Perfil para conectar.</p>
            </>
          )}
        </div>
      </div>

      {/* Daily Food Log */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Diário Alimentar</h3>
            <span className="text-xs font-bold bg-brand-100 text-brand-700 px-2 py-1 rounded-lg">{foodLog.length} itens</span>
        </div>
        
        {foodLog.length === 0 ? (
           <div className="p-8 text-center">
               <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                  <i className="fas fa-utensils"></i>
               </div>
               <p className="text-gray-500 text-sm">Nenhuma refeição registrada hoje.</p>
               <p className="text-xs text-gray-400 mt-1">Use o Scanner para adicionar.</p>
           </div>
        ) : (
          <div className="p-2">
             {Object.entries(mealsGrouped).map(([type, items]) => (
                <div key={type} className="mb-2 last:mb-0">
                   <h4 className="text-xs font-bold text-gray-400 uppercase ml-3 mt-2 mb-1">{type}</h4>
                   {(items as FoodLogEntry[]).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                              <div className={`w-2 h-10 rounded-full ${item.status === 'Saudável' ? 'bg-green-400' : item.status === 'Moderado' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                              <div>
                                 <p className="font-bold text-gray-800 text-sm capitalize">{item.name}</p>
                                 <p className="text-xs text-gray-400">{item.protein} P • {item.carbs} C • {item.fat} G</p>
                              </div>
                          </div>
                          <span className="font-bold text-gray-700 text-sm">{item.calories} kcal</span>
                      </div>
                   ))}
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Macros Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
         <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Macros (Estimados)</h3>
            <p className="text-gray-400 text-sm mb-4">Baseado no seu diário</p>
            <div className="space-y-2">
                {macroData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                        <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                        <span className="text-xs text-gray-400">{entry.value}%</span>
                    </div>
                ))}
            </div>
         </div>
         <div className="w-32 h-32 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={macroData}
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {macroData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                        ))}
                    </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <i className="fas fa-apple-alt text-gray-300"></i>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
