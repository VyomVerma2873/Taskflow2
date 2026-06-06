import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Sparkles, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-600/20">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            TaskFlow
          </span>
          <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ml-1">
            <Sparkles className="h-3 w-3 animate-pulse" />
            AI Powered
          </div>
        </div>

        {/* User Actions */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-4">
            
            {/* User Profile Card */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full">
              <div className="h-6 w-6 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner uppercase">
                {user.username.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-slate-300">
                {user.username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-lg transition-all duration-300 active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>

          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
