import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';
import Recipes from './components/Recipes';
import ChatCoach from './components/ChatCoach';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import { ViewState, FoodLogEntry, ActivityData, MealType, User, UserStats, DietaryPreference, Allergen } from './types';

// --- Components Helpers ---
const InstallModal: React.FC<{ onClose: () => void, isIOS: boolean }> = ({ onClose, isIOS }) => (
  <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
    <div className="bg-white w-full max-w-sm m-4 rounded-3xl p-6 pointer-events-auto shadow-2xl transform transition-transform animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Como Instalar</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-2xl mb-6 border border-orange-100">
         <div className="flex items-start gap-3">
           <i className="fas fa-info-circle text-orange-500 mt-1"></i>
           <div>
             <p className="text-sm font-bold text-gray-800 mb-1">Sobre o APK</p>
             <p className="text-xs text-gray-600 leading-relaxed">
               Este é um App Web (PWA). Ele não precisa de um arquivo .APK para ser instalado. Ele é instalado diretamente pelo seu navegador e funciona igual a um app nativo.
             </p>
           </div>
         </div>
      </div>

      <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Passo a Passo:</h4>
      
      {isIOS ? (
        <ol className="space-y-4 text-sm text-gray-600">
          <li className="flex items-center gap-3">
             <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs shrink-0">1</span>
             <span>Toque no botão <strong className="text-blue-600">Compartilhar</strong> <i className="fas fa-share-square mx-1"></i> (seta para cima).</span>
          </li>
          <li className="flex items-center gap-3">
             <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs shrink-0">2</span>
             <span>Role o menu e toque em <strong className="text-gray-800">Adicionar à Tela de Início</strong> <i className="far fa-plus-square mx-1"></i>.</span>
          </li>
        </ol>
      ) : (
        <ol className="space-y-4 text-sm text-gray-600">
          <li className="flex items-center gap-3">
             <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs shrink-0">1</span>
             <span>Toque nos <strong className="text-gray-800">Três Pontinhos</strong> <i className="fas fa-ellipsis-v mx-1"></i> no canto superior do Chrome.</span>
          </li>
          <li className="flex items-center gap-3">
             <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs shrink-0">2</span>
             <span>Selecione <strong className="text-gray-800">Instalar aplicativo</strong> ou <strong className="text-gray-800">Adicionar à tela inicial</strong>.</span>
          </li>
        </ol>
      )}

      <button onClick={onClose} className="w-full mt-6 bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700">
        Entendi, vou fazer isso!
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // App State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.SCANNER);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [activityData, setActivityData] = useState<ActivityData>({
    steps: 0,
    activeCalories: 0,
    heartRate: 0,
    source: null,
    isConnected: false
  });

  // PWA Install State
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(true);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState('');

  // Load user from local storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fitscan_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // If user is logged in but has no stats, send to onboarding
        if (!parsedUser.stats) {
          setCurrentView(ViewState.ONBOARDING);
        } else {
          // If stats exist, stay on dashboard or scanner (default behavior logic)
        }
      } catch (e) {
        console.error("Error parsing saved user", e);
      }
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Standalone Mode (Already Installed)
    const isStand = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(isStand);
    if (isStand) setShowInstallButton(false);

  }, []);

  // PWA Install Event Listener
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      // Show the install prompt
      installPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
    } else {
      // If no automatic prompt available, show the help modal
      setShowInstallHelp(true);
    }
  };

  const saveUserToStorage = (userData: User) => {
    setUser(userData);
    localStorage.setItem('fitscan_user', JSON.stringify(userData));
  };

  const handleLogin = (loggedInUser: User) => {
    saveUserToStorage(loggedInUser);
    if (!loggedInUser.stats) {
      setCurrentView(ViewState.ONBOARDING);
    } else {
      setCurrentView(ViewState.SCANNER);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fitscan_user');
    setFoodLog([]); 
    setActivityData({ steps: 0, activeCalories: 0, heartRate: 0, source: null, isConnected: false });
  };

  const handleOnboardingComplete = (stats: UserStats, preferences: DietaryPreference[], allergies: Allergen[]) => {
    if (user) {
      const updatedUser: User = { 
        ...user, 
        stats,
        preferences,
        allergies
      };
      saveUserToStorage(updatedUser);
      setCurrentView(ViewState.DASHBOARD);
    }
  };

  const handleLogFood = (food: FoodLogEntry) => {
    setFoodLog(prev => [food, ...prev]);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleStartEditName = () => {
    setTempName(user?.name || '');
    setIsEditingProfile(true);
  };

  const handleSaveName = () => {
    if (user && tempName.trim()) {
      const updatedUser = { ...user, name: tempName };
      saveUserToStorage(updatedUser);
      setIsEditingProfile(false);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    }
  };

  const toggleDeviceConnection = (device: 'Fitbit' | 'Apple Health' | 'Garmin') => {
    if (activityData.isConnected && activityData.source === device) {
      // Disconnect
      setActivityData({
        steps: 0,
        activeCalories: 0,
        heartRate: 0,
        source: null,
        isConnected: false
      });
    } else {
      // Simulate Connection and Data Import
      setActivityData({
        steps: 8432,
        activeCalories: 450,
        heartRate: 72,
        source: device,
        isConnected: true
      });
    }
  };

  // --- Calorie Calculation Logic (Mifflin-St Jeor) ---
  const calculateDailyGoal = (stats?: UserStats): number => {
    if (!stats) return 2000; // Default fallback

    // BMR Calculation
    let bmr = (10 * stats.currentWeight) + (6.25 * stats.height) - (5 * stats.age);
    if (stats.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // TDEE (Total Daily Energy Expenditure) - Assuming Sedentary base (1.2)
    const tdee = bmr * 1.2;

    // Adjust for Goal
    let goalCalories = tdee;
    if (stats.targetWeight < stats.currentWeight) {
      goalCalories -= 500; // Deficit for weight loss
    } else if (stats.targetWeight > stats.currentWeight) {
      goalCalories += 300; // Surplus for gain
    }

    return Math.round(goalCalories);
  };

  const dailyCalorieGoal = calculateDailyGoal(user?.stats);

  const renderView = () => {
    switch (currentView) {
      case ViewState.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} initialData={user?.stats} />;
      
      case ViewState.SCANNER: 
        return <Scanner onLogFood={handleLogFood} user={user} />;
      
      case ViewState.DASHBOARD: 
        return <Dashboard foodLog={foodLog} activityData={activityData} userStats={user?.stats} dailyGoal={dailyCalorieGoal} />;
      
      case ViewState.RECIPES: 
        return <Recipes />;
      
      case ViewState.CHAT: 
        return <ChatCoach />;
      
      case ViewState.PROFILE: return (
        <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen animate-fade-in-up">
           <header className="flex items-center gap-4 mb-8 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-500 shadow-md shrink-0">
                 <img src={user?.photoUrl || "https://picsum.photos/100/100"} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                 {isEditingProfile ? (
                   <div className="flex items-center gap-2">
                     <input 
                       type="text" 
                       value={tempName}
                       onChange={(e) => setTempName(e.target.value)}
                       onKeyDown={handleEditKeyDown}
                       className="w-full border border-gray-300 rounded-lg px-2 py-1 text-lg font-bold text-gray-800 focus:ring-2 focus:ring-brand-500 outline-none"
                       autoFocus
                     />
                     <button 
                      onClick={handleSaveName} 
                      className="bg-brand-500 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md hover:bg-brand-600 transition-colors"
                      title="Salvar Nome"
                     >
                       <i className="fas fa-check"></i>
                     </button>
                   </div>
                 ) : (
                   <div className="flex items-center gap-2">
                     <h2 className="text-2xl font-bold text-gray-800 truncate">{user?.name}</h2>
                     <button onClick={handleStartEditName} className="text-gray-400 hover:text-brand-500 transition-colors">
                       <i className="fas fa-pencil-alt text-sm"></i>
                     </button>
                   </div>
                 )}
                 <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                 <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200">
                    <i className="fas fa-check-circle mr-1"></i> MEMBRO
                 </span>
              </div>
           </header>

            {/* Install App Button */}
            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 shadow-lg transition-colors mb-6 flex items-center justify-center gap-2"
              >
                <i className="fas fa-download"></i> Instalar App
              </button>
            )}

            {/* Stats Summary / Edit Trigger */}
            {user?.stats && (
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                 <div className="flex gap-4">
                    <div className="text-center">
                       <p className="text-xs text-gray-400 font-bold uppercase">Peso</p>
                       <p className="font-bold text-gray-800">{user.stats.currentWeight}kg</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                       <p className="text-xs text-gray-400 font-bold uppercase">Meta</p>
                       <p className="font-bold text-brand-600">{user.stats.targetWeight}kg</p>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="text-center">
                       <p className="text-xs text-gray-400 font-bold uppercase">Altura</p>
                       <p className="font-bold text-gray-800">{user.stats.height}cm</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setCurrentView(ViewState.ONBOARDING)}
                   className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-brand-50 hover:text-brand-500 transition-colors"
                 >
                   <i className="fas fa-sliders-h text-xs"></i>
                 </button>
              </div>
            )}

            {/* Preferences Summary */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Minhas Preferências</h3>
              <div className="flex flex-wrap gap-2">
                 {(user?.preferences?.length || 0) > 0 ? (
                    user?.preferences?.map(p => (
                      <span key={p} className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-md border border-brand-100">{p}</span>
                    ))
                 ) : (
                   <span className="text-xs text-gray-400 italic">Sem preferências definidas.</span>
                 )}
              </div>
              
              <h3 className="text-sm font-bold text-gray-800 mt-4 mb-3">Alergias</h3>
              <div className="flex flex-wrap gap-2">
                 {(user?.allergies?.length || 0) > 0 ? (
                    user?.allergies?.map(a => (
                      <span key={a} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md border border-red-100">{a}</span>
                    ))
                 ) : (
                   <span className="text-xs text-gray-400 italic">Nenhuma alergia.</span>
                 )}
              </div>
            </div>

           <h2 className="text-xl font-bold text-gray-800 mb-6">Integrações</h2>

           {/* Wearable Integrations */}
           <div className="space-y-3 mb-8">
              {[
                { name: 'Apple Health', icon: 'fa-apple', color: 'text-gray-900' },
                { name: 'Fitbit', icon: 'fa-watch-fitness', color: 'text-teal-500' }, 
                { name: 'Garmin', icon: 'fa-running', color: 'text-blue-600' }
              ].map((device) => {
                const isConnected = activityData.isConnected && activityData.source === device.name;
                return (
                  <button 
                    key={device.name}
                    onClick={() => toggleDeviceConnection(device.name as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isConnected 
                      ? 'bg-brand-50 border-brand-200 shadow-inner' 
                      : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-white' : 'bg-gray-50'}`}>
                         <i className={`fab ${device.icon} ${device.name === 'Garmin' || device.name === 'Fitbit' ? 'fas' : ''} text-xl ${device.color}`}></i>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-800">{device.name}</p>
                        <p className="text-xs text-gray-500">{isConnected ? 'Sincronizado' : 'Toque para conectar'}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isConnected ? 'bg-brand-500' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isConnected ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                );
              })}
           </div>

           <button 
             onClick={handleLogout}
             className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors mb-4"
           >
             <i className="fas fa-sign-out-alt mr-2"></i> Sair da Conta
           </button>
        </div>
      );
      default: return <Scanner onLogFood={handleLogFood} user={user} />;
    }
  };

  // If not logged in, show Auth Screen
  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className={currentView === ViewState.CHAT ? '' : 'pb-safe'}>
        {/* Global Install Banner - Only shows if not installed and user is on Dashboard/Scanner */}
        {!isStandalone && showInstallButton && user && (currentView === ViewState.DASHBOARD || currentView === ViewState.SCANNER) && (
          <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center shadow-md animate-fade-in-down sticky top-0 z-50">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                 <i className="fas fa-arrow-down text-sm"></i>
               </div>
               <div className="text-sm">
                 <p className="font-bold">Instale o App</p>
                 <p className="text-xs text-gray-400">Acesso rápido e offline.</p>
               </div>
             </div>
             <button 
               onClick={handleInstallClick} 
               className="bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
             >
               Instalar
             </button>
          </div>
        )}

        {renderView()}
      </main>
      
      {(currentView !== ViewState.PROFILE && currentView !== ViewState.ONBOARDING) && (
        <Navbar currentView={currentView} onChangeView={setCurrentView} />
      )}

      {showInstallHelp && (
        <InstallModal onClose={() => setShowInstallHelp(false)} isIOS={isIOS} />
      )}
    </div>
  );
};

export default App;