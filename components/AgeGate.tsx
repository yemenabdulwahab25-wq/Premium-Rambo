
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AgeGateProps {
  onVerify: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onVerify }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-6 z-[100]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Premium Rambo</h1>
        <p className="text-slate-500 mb-8 italic">Exotic Pickup Experience</p>
        
        <h2 className="text-xl font-semibold mb-6">Are you 21 or older?</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onVerify}
            className="bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            YES, I AM 21+
          </button>
          <button 
            onClick={() => window.location.href = "https://www.google.com"}
            className="bg-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-300 transition-colors"
          >
            NO
          </button>
        </div>
        
        <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest">
          Adults 21+ only • ID required at pickup
        </p>
      </div>
    </div>
  );
};

export default AgeGate;
