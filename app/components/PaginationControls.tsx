'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
}

export function PaginationControls({ 
  totalItems, 
  currentPage, 
  pageSize 
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Simple Previous/Next links for now
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:justify-end">
        {hasPreviousPage ? (
          <Link
            href={createPageURL(currentPage - 1)}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span 
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            Previous
          </span>
        )}
        {hasNextPage ? (
          <Link
            href={createPageURL(currentPage + 1)}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span 
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            Next
          </span>
        )}
      </div>
    </nav>
  );
} 