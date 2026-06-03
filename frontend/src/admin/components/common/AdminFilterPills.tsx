import React from 'react';

interface FilterOption<T extends string> {
  value: T;
  label: string;
}

interface AdminFilterPillsProps<T extends string> {
  options: FilterOption<T>[];
  activeValue: T;
  onChange: (value: T) => void;
}

export default function AdminFilterPills<T extends string>({
  options,
  activeValue,
  onChange,
}: AdminFilterPillsProps<T>) {
  return (
    <>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border-none cursor-pointer ${
            activeValue === option.value ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </>
  );
}
