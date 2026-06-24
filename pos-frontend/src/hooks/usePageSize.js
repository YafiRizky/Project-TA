import { useState } from 'react';

export function usePageSize(defaultSize = 10) {
  const [pageSize, setPageSizeState] = useState(() => {
    const saved = localStorage.getItem('pos_page_size');
    return saved ? parseInt(saved, 10) : defaultSize;
  });

  const setPageSize = (size) => {
    setPageSizeState(size);
    localStorage.setItem('pos_page_size', size.toString());
  };

  return [pageSize, setPageSize];
}
