import React from 'react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../../constants';

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <div className="sticky top-[80px] z-40 bg-[#FCFCFC]/80 backdrop-blur-3xl border-b border-hairline py-4">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center gap-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
                activeCategory === cat.id 
                  ? 'bg-ink text-white shadow-xl shadow-ink/10' 
                  : 'text-secondary opacity-40 hover:opacity-100 hover:bg-surface-soft'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
