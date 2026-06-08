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

function SectionAction({ link, linkText, isButton }: Pick<SectionHeaderProps, 'link' | 'linkText' | 'isButton'>) {
  const className =
    'group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary transition-all hover:text-ink';

  if (isButton) {
    return (
      <button className={className}>
        {linkText}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </button>
    );
  }

  return (
    <Link to={link} className={className}>
      {linkText}
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, tag, link, linkText, isButton }) => (
  <div className="mb-8 flex flex-col justify-between gap-5 border-b border-stone-200 pb-6 md:mb-12 md:flex-row md:items-end">
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 40 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="h-px bg-primary"
        />
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">{tag}</span>
      </div>

      <h2 className="text-3xl font-black leading-none tracking-tight text-ink md:text-4xl">
        {title}
      </h2>
    </div>

    <SectionAction link={link} linkText={linkText} isButton={isButton} />
  </div>
);
