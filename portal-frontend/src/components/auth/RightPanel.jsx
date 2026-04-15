import React from 'react';

export default function RightPanel() {
  return (
    <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#F8FAFC] to-blue-50/30 items-center justify-center overflow-hidden border-l border-gray-100">
      {/* Light Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-lg text-center px-8">
        {/* Modern floating SaaS placeholder graphic */}
        <div className="w-64 h-64 mx-auto mb-12 relative animate-[float_6s_ease-in-out_infinite]">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-100 rounded-full blur-2xl opacity-60 mix-blend-multiply" />
          <div className="w-full h-full bg-white border border-gray-100/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex items-center justify-center backdrop-blur-xl">
             <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse shadow-xl shadow-blue-500/20">
                <div className="w-16 h-16 bg-white rounded-full shadow-inner" />
             </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Resolve Campus Issues <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Rapidly</span>
        </h2>
        <p className="text-gray-500 text-lg font-medium leading-relaxed">
          Connect with trusted administration teams efficiently in a modern, streamlined grievance system.
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
