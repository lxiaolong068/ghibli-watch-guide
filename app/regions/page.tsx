import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regions - Ghibli Watch Guide',
  description: 'Information about where to watch Studio Ghibli movies by region is coming soon.',
};

export default function RegionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Regions</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Information about movie availability by region is coming soon! We are working hard to gather and present this data accurately.
      </p>
      <p className="mt-4">
        In the meantime, you can browse the full list of Ghibli movies on our{' '}
        <a href="/" className="text-blue-600 hover:underline dark:text-blue-400">
          homepage
        </a>
        .
      </p>
    </div>
  );
}
