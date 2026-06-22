import React from 'react';

export const AUTH_INPUT_CLASS =
  'theme-input-surface w-full rounded-2xl border border-transparent px-4 py-3.5 text-[15px] text-ink outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/8';

export const AUTH_PRIMARY_ACTION_CLASS =
  'flex h-12 w-full transform-gpu items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-black text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-[transform,background-color,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_16px_32px_rgba(15,23,42,0.16)] active:translate-y-0 active:scale-[0.985] active:shadow-[0_8px_18px_rgba(15,23,42,0.14)] disabled:transform-none disabled:shadow-none disabled:opacity-70';

export function AuthPanelHeader({
  caption,
  title,
  description,
}: {
  caption: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 text-sm font-medium text-secondary">{caption}</div>
      <h1 className="mb-2 text-[30px] font-black tracking-[-0.03em] text-ink">{title}</h1>
      <p className="text-[14px] leading-7 text-muted">{description}</p>
    </div>
  );
}

export function AuthField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="ml-1 text-sm font-bold text-ink">{label}</label>
      {children}
    </div>
  );
}

export function AuthErrorBanner({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{message}</div>;
}
