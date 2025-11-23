import React from 'react';
import { ViewState } from '../types';

interface NavbarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { id: ViewState.DASHBOARD, icon: 'fa-chart-pie', label: 'Progresso' },
    { id: ViewState.RECIPES, icon: 'fa-utensils', label: 'Receitas' },
    { id: ViewState.SCANNER, icon: 'fa-camera', label: 'Scan', isPrimary: true },
    { id: ViewState.CHAT, icon: 'fa-comments', label: 'Coach IA' },
    { id: ViewState.PROFILE, icon: 'fa-user', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 pb-safe">
      <div className="flex justify-around items-end h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full pb-2 transition-colors duration-200 ${
              item.isPrimary ? '-mt-6' : ''
            }`}
          >
            {item.isPrimary ? (
              <div className="bg-brand-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform active:scale-95 transition-transform border-4 border-white">
                <i className={`fas ${item.icon} text-2xl`}></i>
              </div>
            ) : (
              <>
                <i className={`fas ${item.icon} text-lg mb-1 ${
                  currentView === item.id ? 'text-brand-600' : 'text-gray-400'
                }`}></i>
                <span className={`text-[10px] font-medium ${
                  currentView === item.id ? 'text-brand-600' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;