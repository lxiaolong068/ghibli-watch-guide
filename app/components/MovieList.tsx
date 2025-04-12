import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@prisma/client';

// Use Prisma type - remove the include for availabilities
// type Movie = Prisma.MovieGetPayload<{}>;
// Or simply use the model type if no includes are needed:
// import type { Movie } from '@prisma/client';

interface MovieListProps {
  movies: Movie[];
}

export function MovieList({ movies }: MovieListProps) {
  return (
    <section className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">Movie List</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="relative flex flex-col overflow-hidden rounded-lg border border-gray-200 transition-all duration-200 ease-in-out hover:border-primary-300 hover:shadow-md"
            >
              <Link 
                href={`/movies/${movie.id}`} 
                className="block"
                prefetch={false}
              >
                {movie.posterUrl && (
                  <div className="aspect-h-3 aspect-w-2 relative overflow-hidden">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.titleEn || ''}
                      className="object-cover object-center transition-transform duration-200 ease-in-out group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
                      loading={index < 3 ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEOgJ8lU8MqAAAAABJRU5ErkJggg=="
                      quality={80}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                    {movie.titleEn}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {movie.year}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                    {movie.synopsis || 'Synopsis not available.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      {movie.voteAverage && movie.voteAverage > 0 
                        ? movie.voteAverage.toFixed(1) 
                        : 'N/A'}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {movie.duration ? `${movie.duration} min` : 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 