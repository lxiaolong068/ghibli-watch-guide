import Link from 'next/link';
import { getLatestMovies } from '@/app/actions/movies';
import { MovieList } from '@/app/components/MovieList';
import { UserBehaviorTracker } from '@/app/components/analytics/UserBehaviorTracker';
import { ResponsiveAdSenseAd } from '@/app/components/SEOOptimizer';
import { HomeRecommendations } from '@/app/components/recommendations/HomeRecommendations';

// Remove force-dynamic setting to allow page caching
// export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch the latest 9 movies
  const latestMovies = await getLatestMovies(9);

  return (
    <div className="space-y-8">
      {/* User behavior tracking */}
      <UserBehaviorTracker pageType="home" />
      {/* Welcome section */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Where to Watch Studio Ghibli Movies Online
        </h2>
        <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
          Find the latest information on where to watch Studio Ghibli movies worldwide,
          including streaming platforms, subscription services, and purchase options.
        </p>
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/movies"
          className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Movie List</h3>
          <p className="text-gray-600 dark:text-slate-300">Browse all Studio Ghibli animated films</p>
        </Link>
        <Link
          href="/guides"
          className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Watch Guides</h3>
          <p className="text-gray-600 dark:text-slate-300">Discover the best viewing order for Ghibli films</p>
        </Link>
        <Link
          href="/characters"
          className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Characters</h3>
          <p className="text-gray-600 dark:text-slate-300">Explore beloved Ghibli characters</p>
        </Link>
        <Link
          href="/reviews"
          className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Reviews</h3>
          <p className="text-gray-600 dark:text-slate-300">Read professional film reviews and analysis</p>
        </Link>
        <Link
          href="/regions"
          className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-slate-700 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Regional Guide</h3>
          <p className="text-gray-600 dark:text-slate-300">Check viewing options in your region</p>
        </Link>
      </section>

      {/* Advertisement section */}
      <section className="flex justify-center">
        <ResponsiveAdSenseAd
          adSlot="1234567890"
          adFormat="auto"
        />
      </section>

      {/* Latest Movies List - showing only the latest 9 movies */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-slate-100">Latest Ghibli Movies</h2>
        {latestMovies.length > 0 ? (
          <MovieList movies={latestMovies} />
        ) : (
          <p className="text-center text-gray-500 dark:text-slate-400">Could not load latest movies.</p>
        )}
      </section>

      {/* Personalized recommendations section */}
      <section>
        <HomeRecommendations />
      </section>

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