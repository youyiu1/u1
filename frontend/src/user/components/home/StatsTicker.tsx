import React from 'react';
import { Users, Zap, ShoppingBag, Sparkles } from 'lucide-react';

export const StatsTicker: React.FC = () => {
  const stats = [
    { label: 'Active Neighbors', value: '12,402', icon: <Users className="w-5 h-5" /> },
    { label: 'Service Categories', value: '48', icon: <Zap className="w-5 h-5" /> },
    { label: 'Market Deals', value: '3,105', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Satisfaction Rate', value: '99.2%', icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 border-b border-hairline">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-20">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              {stat.icon}
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <div className="text-4xl md:text-5xl font-black text-ink tracking-tighter tabular-nums leading-none">
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
