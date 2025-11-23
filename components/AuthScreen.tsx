import React, { useState } from 'react';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  // Default to false (Register) so users see the Name input immediately
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Email/Password API delay
    setTimeout(() => {
      const mockUser: User = {
        id: 'user-' + Date.now(),
        // If registering, use the input name. If logging in, simulate a fetched name.
        name: isLogin ? 'Usuário Retornado' : name, 
        email: email,
        photoUrl: `https://ui-avatars.com/api/?name=${isLogin ? 'User' : name}&background=22c55e&color=fff`
      };
      
      onLogin(mockUser);
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Simulate Google OAuth Redirect/Popup delay
    setTimeout(() => {
      const googleUser: User = {
        id: 'google-' + Date.now(),
        name: 'Alex Pereira',
        email: 'alex.pereira@gmail.com',
        // Generic avatar usually returned by Google
        photoUrl: 'https://lh3.googleusercontent.com/a/default-user=s100' 
      };
      
      onLogin(googleUser);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12 lg:px-8 animate-fade-in-up">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="w-20 h-20 bg-brand-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 mb-6">
           <i className="fas fa-camera text-4xl text-white"></i>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Escaneie. Descubra. <br/>Emagreça com inteligência.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name Input - Always visible if not logging in */}
            {!isLogin && (
              <div className="animate-fade-in-up">
                <label htmlFor="name" className="block text-sm font-bold leading-6 text-gray-900">
                  Nome Completo
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    placeholder="Ex: Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 bg-gray-50 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Seu Gmail ou Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="exemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 bg-gray-50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Senha
                </label>
                {isLogin && (
                  <div className="text-sm">
                    <a href="#" className="font-semibold text-brand-600 hover:text-brand-500">
                      Esqueceu a senha?
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 bg-gray-50 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-xl bg-brand-600 px-3 py-4 text-sm font-bold leading-6 text-white shadow-lg hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-circle-notch fa-spin"></i> Processando...
                  </span>
                ) : (
                  isLogin ? 'Entrar' : 'Criar Conta'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-900">Ou continue com</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent disabled:opacity-50 transition-colors"
              >
                <i className="fab fa-google text-red-500 text-lg"></i>
                <span className="text-sm font-semibold">Google</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent disabled:opacity-50 transition-colors"
              >
                <i className="fab fa-apple text-black text-lg"></i>
                <span className="text-sm font-semibold">Apple</span>
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold leading-6 text-brand-600 hover:text-brand-500 transition-colors"
            >
              {isLogin ? 'Cadastre-se grátis' : 'Entrar agora'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;