import React from 'react';

export const AUTH_INPUT_CLASS =
  'w-full rounded-2xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-[15px] text-ink outline-none transition-all placeholder:text-slate-400 focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/8';

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
