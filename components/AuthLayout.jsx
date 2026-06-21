import React from 'react';

export default function AuthLayout({ children, title }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030d1a] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#39FF6B] to-[#00BFFF] bg-clip-text text-transparent">
            TiliGo
          </h1>
          {title && <p className="text-gray-400 mt-2">{title}</p>}
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
