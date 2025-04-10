import Link from 'next/link';
import Image from 'next/image';
import { MovieList } from '@/app/components/MovieList';
import { prisma } from '@/lib/prisma';

async function getMovies() {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: {
        year: 'desc',
      },
    });
    return movies;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

export default async function Home() {
  const movies = await getMovies();

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Where to Watch Studio Ghibli Movies Online
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the latest information on where to watch Studio Ghibli movies worldwide, 
          including streaming platforms, subscription services, and purchase options.
        </p>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/movies"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Movie List</h3>
          <p className="text-gray-600">Browse all Studio Ghibli animated films</p>
        </Link>
        <Link
          href="/regions"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Regional Guide</h3>
          <p className="text-gray-600">Check viewing options in your region</p>
        </Link>
        <Link
          href="/about"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">About Us</h3>
          <p className="text-gray-600">Learn more about our watch guide</p>
        </Link>
      </section>

      {/* Latest Movies List */}
      <MovieList movies={movies} />

      {/* Featured Content */}
      <section className="bg-gradient-to-r from-[#4AB1B3] to-[#76E4C4] rounded-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">Why Use Our Studio Ghibli Watch Guide?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div>
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-white/90">We continuously track and update viewing information across platforms</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Global Coverage</h3>
              <p className="text-white/90">Providing viewing channel information worldwide</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Free Resources</h3>
              <p className="text-white/90">Including information about legal free viewing channels</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
