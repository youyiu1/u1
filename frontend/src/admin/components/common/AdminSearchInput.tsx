import React from 'react';
import { Search } from 'lucide-react';

interface AdminSearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  containerClassName?: string;
  inputClassName?: string;
}

export default function AdminSearchInput({
  value,
  placeholder,
  onChange,
  containerClassName = 'relative max-w-md',
  inputClassName = 'w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl text-xs outline-none dark:text-white',
}: AdminSearchInputProps) {
  return (
    <div className={containerClassName}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </div>
  );
}
