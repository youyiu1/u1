import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  tag: string;
  link: string;
  linkText: string;
  isButton?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  tag, 
  link, 
  linkText, 
  isButton 
}) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16 border-b border-hairline pb-8">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="h-[1px] bg-primary" 
        />
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{tag}</span>
      </div>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink tracking-tighter uppercase leading-[0.9]">
        热门 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light italic">{title}</span>
      </h2>
    </div>
    {isButton ? (
      <button className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-ink transition-all">
        {linkText} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    ) : (
      <Link to={link} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-ink transition-all">
        {linkText} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Link>
    )}
  </div>
);
