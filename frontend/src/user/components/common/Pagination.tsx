import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function buildVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [5, 10, 20, 30],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalItems <= 0) {
    return null;
  }

  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const normalizedPageSizeOptions = Array.from(new Set([...pageSizeOptions, pageSize])).sort((left, right) => left - right);
  return (
    <section className="mt-10 inline-flex max-w-full rounded-3xl border border-hairline bg-surface-soft/40 px-4 py-4 sm:px-5">
      <div className="max-w-full overflow-x-auto">
        <div className="flex min-w-max items-center gap-4 whitespace-nowrap text-sm font-medium text-secondary">
          <div className="flex items-center gap-4">
            <span className="shrink-0">共 {totalItems} 条</span>
            <label className="flex shrink-0 items-center gap-2">
              <span>每页</span>
              <select
                value={pageSize}
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                className="theme-card rounded-xl px-3 py-2 text-sm font-bold text-ink outline-none transition-colors focus:border-primary"
                aria-label="选择每页显示数量"
              >
                {normalizedPageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} 条
                  </option>
                ))}
              </select>
            </label>
            <nav className="flex shrink-0 flex-wrap items-center gap-2" aria-label="分页导航">
              <PaginationArrow
                direction="prev"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              />

              {visiblePages.map((page, index) => {
                const previousPage = visiblePages[index - 1];
                const showEllipsis = previousPage && page - previousPage > 1;

                return (
                  <React.Fragment key={page}>
                    {showEllipsis ? <span className="px-2 text-sm font-bold text-muted">...</span> : null}
                    <button
                      type="button"
                      onClick={() => onPageChange(page)}
                      className={`min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                        page === currentPage
                          ? 'bg-primary text-white shadow-md'
                          : 'theme-card text-secondary hover:border-primary/30 hover:text-primary'
                      }`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

              <PaginationArrow
                direction="next"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              />
            </nav>
          </div>
          <span className="shrink-0 text-xs font-bold text-muted">
            当前第 {currentPage} / {totalPages} 页
          </span>
        </div>
      </div>
    </section>
  );
}

function PaginationArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="theme-card flex min-w-10 items-center justify-center rounded-xl px-3 py-2 text-secondary transition-all hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      aria-label={direction === 'prev' ? '上一页' : '下一页'}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
