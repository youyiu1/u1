import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  tag: string;
  link: string;
  linkText: string;
  description?: string;
  isButton?: boolean;
  highlightAction?: boolean;
}

function SectionAction({
  link,
  linkText,
  isButton,
  highlightAction,
}: Pick<SectionHeaderProps, 'link' | 'linkText' | 'isButton' | 'highlightAction'>) {
  const defaultClassName =
    'group flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.14em] text-primary transition-all hover:text-ink';
  const highlightClassName =
    'group inline-flex h-8 items-center gap-1 rounded-full border border-stone-900 bg-stone-900 px-3 text-[9px] font-black text-white transition-all hover:bg-stone-800';
  const className = highlightAction ? highlightClassName : defaultClassName;

  if (isButton) {
    return (
      <button className={className}>
        {linkText}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </button>
    );
  }

  return (
    <Link to={link} className={className}>
      {linkText}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  tag,
  link,
  linkText,
  description,
  isButton,
  highlightAction,
}) => (
  <div className="mb-3 flex min-h-[82px] flex-col justify-between gap-2.5 rounded-[18px] border border-stone-200 bg-stone-50/80 px-3.5 py-3 md:mb-4 md:flex-row md:items-end md:px-4">
    <div className="max-w-sm space-y-1">
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 18 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="h-px bg-primary"
        />
        <span className="text-[7px] font-black uppercase tracking-[0.16em] text-primary">{tag}</span>
      </div>

      <div className="space-y-0.5">
        <h2 className="text-[15px] font-black leading-none tracking-tight text-ink md:text-[18px]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-xs text-[9px] leading-3.5 text-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>

    <SectionAction link={link} linkText={linkText} isButton={isButton} highlightAction={highlightAction} />
  </div>
);
