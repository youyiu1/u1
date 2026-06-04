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
  <div className="mb-10 flex flex-col justify-between gap-6 border-b border-hairline pb-8 md:mb-16 md:flex-row md:items-end">
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 48 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
          className="h-px bg-primary"
        />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{tag}</span>
      </div>

      <h2 className="text-4xl font-black leading-[0.9] tracking-tighter text-ink md:text-5xl lg:text-6xl">
        热门 <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent italic">{title}</span>
      </h2>
    </div>

    <SectionAction link={link} linkText={linkText} isButton={isButton} />
  </div>
);
