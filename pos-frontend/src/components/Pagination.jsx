import React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  if (currentPage === 1) endPage = Math.min(3, totalPages);
  if (currentPage === totalPages) startPage = Math.max(1, totalPages - 2);

  const createPageBtn = (page) => {
    const isActive = page === currentPage;
    return (
      <button
        key={`page-${page}`}
        onClick={() => onPageChange(page)}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
          isActive
            ? 'font-bold text-gray-900 border-2 border-gray-900'
            : 'font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
        }`}
      >
        {page}
      </button>
    );
  };

  const createEllipsis = (key) => (
    <span
      key={`ellipsis-${key}`}
      className="w-10 h-10 flex items-center justify-center text-gray-400 font-medium tracking-widest"
    >
      ...
    </span>
  );

  const renderPages = () => {
    const pages = [];
    
    if (startPage > 1) {
      pages.push(createPageBtn(1));
      if (startPage > 2) pages.push(createEllipsis('start'));
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(createPageBtn(i));
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(createEllipsis('end'));
      pages.push(createPageBtn(totalPages));
    }

    return pages;
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 w-fit bg-white p-1 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 mx-auto">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 transition-colors ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        <RiArrowLeftSLine size={20} />
      </button>
      
      {renderPages()}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 transition-colors ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <RiArrowRightSLine size={20} />
      </button>
    </nav>
  );
}
