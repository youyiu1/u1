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
    'group flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary transition-all hover:text-ink';
  const highlightClassName =
    'group inline-flex h-8 items-center gap-1 rounded-full border border-ink bg-ink px-3.5 text-[9px] font-black text-white transition-all hover:opacity-90';
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
  <div className="mb-3 flex flex-col justify-between gap-2.5 border-b border-hairline pb-3 md:mb-4 md:flex-row md:items-end md:pb-3.5">
    <div className="max-w-md space-y-1">
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 18 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="h-px bg-primary"
        />
        <span className="text-[7px] font-black uppercase tracking-[0.16em] text-primary/90">{tag}</span>
      </div>

      <div className="space-y-0.5">
        <h2 className="text-[16px] font-black leading-none tracking-tight text-ink md:text-[18px]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-sm text-[10px] leading-4 text-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>

    <SectionAction link={link} linkText={linkText} isButton={isButton} highlightAction={highlightAction} />
  </div>
);
