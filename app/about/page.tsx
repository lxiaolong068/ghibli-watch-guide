import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Ghibli Watch Guide',
  description:
    'Learn more about the Ghibli Watch Guide project, its purpose, and the technology behind it. Discover information about Studio Ghibli films.',
  keywords: 'Studio Ghibli, Ghibli movies, anime, Japanese animation, movie guide, about',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">About Ghibli Watch Guide</h1>

      <div className="space-y-4 text-lg text-gray-700 dark:text-gray-300">
        <p>
          Welcome to the Ghibli Watch Guide! This project is dedicated to fans of
          Studio Ghibli, providing comprehensive information about their beloved
          animated films.
        </p>
        <p>
          Our goal is to be a helpful resource for discovering details about each
          movie, including summaries, cast information, and technical details.
          (Information about where to watch specific films regionally is planned
          for a future update).
        </p>
        <p>
          Movie data presented on this site is primarily sourced from{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            The Movie Database (TMDB)
          </a>
          , a fantastic community-built movie and TV database. We appreciate their
          extensive collection and API.
        </p>
        <p>
          This website is built using modern web technologies including{' '}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Next.js
          </a>
          ,{' '}
          <a
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            React
          </a>
          , and{' '}
          <a
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Tailwind CSS
          </a>
          .
        </p>
        <p>
          Explore the full list of movies on our{' '}
          <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
            homepage
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
