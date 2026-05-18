import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm max-w-fit mx-auto mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        <FiChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold text-xs select-none">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
                currentPage === page
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
