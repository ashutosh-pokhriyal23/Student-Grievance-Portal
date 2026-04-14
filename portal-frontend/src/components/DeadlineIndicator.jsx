import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

const DeadlineIndicator = ({ deadline, isEscalated }) => {
  const [timeLeft, setTimeLeft] = useState(isEscalated ? 'DEADLINE PASSED' : '');

  useEffect(() => {
    if (isEscalated) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setTimeLeft('DEADLINE PASSED');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m left`);
      else setTimeLeft(`${minutes}m left`);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, isEscalated]);

  return (
    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
      isEscalated 
        ? 'bg-red-50 text-red-600 border-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' 
        : 'bg-blue-50 text-blue-600 border-blue-100'
    }`}>
      {isEscalated ? <AlertTriangle size={12} /> : <Clock size={12} />}
      <span>{timeLeft}</span>
    </div>
  );
};

export default DeadlineIndicator;
