import { useState } from 'react';

/**
 * Custom hook for managing page size per table/feature independently.
 * Usage:
 *   usePageSize('categories', 10) -> stores in localStorage 'pos_page_size_categories'
 *   usePageSize(10) -> fallback to 'pos_page_size_default'
 */
export function usePageSize(keyOrDefault = 'default', defaultSize = 10) {
  const key = typeof keyOrDefault === 'number' ? 'default' : keyOrDefault;
  const initialDefault = typeof keyOrDefault === 'number' ? keyOrDefault : defaultSize;
  const storageKey = `pos_page_size_${key}`;

  const [pageSize, setPageSizeState] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : initialDefault;
  });

  const setPageSize = (size) => {
    setPageSizeState(size);
    localStorage.setItem(storageKey, size.toString());
  };

  return [pageSize, setPageSize];
}
