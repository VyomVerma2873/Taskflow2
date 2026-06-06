import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} TaskFlow. Crafted with premium AI features.</p>
      </footer>
    </div>
  );
};

export default Layout;
