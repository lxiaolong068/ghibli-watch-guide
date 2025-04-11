'use client';

import { useRouter, usePathname } from 'next/navigation';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

// Path mapping configuration
const pathMap: { [key: string]: string } = {
  'movies': 'Movies',
  'about': 'About',
  'contact': 'Contact',
  // Add more mappings as needed
};

export default function Breadcrumb() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const handleClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center text-gray-500">
        <button
          onClick={() => handleClick('/')}
          className="flex items-center hover:text-primary-600 focus:outline-none"
        >
          <HomeIcon className="h-4 w-4" />
          <span className="ml-1">Home</span>
        </button>
      </div>

      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;
        const displayName = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        return (
          <div key={path} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {index === segments.length - 1 ? (
              <span className="ml-2 text-primary-600 font-medium">
                {displayName}
              </span>
            ) : (
              <button
                onClick={() => handleClick(path)}
                className="ml-2 text-gray-500 hover:text-primary-600 focus:outline-none"
              >
                {displayName}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
} 