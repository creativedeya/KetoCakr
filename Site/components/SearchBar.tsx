'use client';
import { useState, useEffect } from 'react';

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      style={{
        width: '100%',
        padding: '14px 20px',
        fontSize: 14,
        fontFamily: 'var(--font-manrope), sans-serif',
        background: 'var(--surface-card)',
        border: '1px solid var(--cream-3)',
        color: 'var(--text-1)',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  );
}
