import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Base data
const regions = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'EU', name: 'Europe' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
] as const;

const platforms = [
  {
    name: 'Netflix',
    website: 'https://www.netflix.com',
    type: 'STREAMING',
    logo: 'https://example.com/netflix-logo.png',
  },
  {
    name: 'HBO Max',
    website: 'https://www.hbomax.com',
    type: 'STREAMING',
    logo: 'https://example.com/hbomax-logo.png',
  },
  { name: 'Max', website: 'https://www.max.com', type: 'STREAMING' as const },
  { name: 'Apple TV', website: 'https://tv.apple.com', type: 'STREAMING' as const },
  { name: 'YouTube', website: 'https://www.youtube.com', type: 'STREAMING' as const },
  { name: 'Vudu', website: 'https://www.vudu.com', type: 'STREAMING' as const },
  { name: 'GKIDS', website: 'https://gkids.com/films', type: 'CINEMA' as const },
] as const;

const movies = [
  {
    titleEn: 'Spirited Away',
    titleJa: '千と千尋の神隠し',
    year: 2001,
    director: 'Hayao Miyazaki',
    duration: 125,
    synopsis: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    titleEn: 'My Neighbor Totoro',
    titleJa: 'となりのトトロ',
    year: 1988,
    director: 'Hayao Miyazaki',
    duration: 86,
    synopsis: 'Two young girls move to the country with their father to be near their hospitalized mother, and have adventures with the wondrous forest spirits who live nearby.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
  },
  {
    titleEn: 'Grave of the Fireflies',
    titleJa: '火垂るの墓',
    year: 1988,
    director: 'Isao Takahata',
    duration: 89,
    synopsis: 'A devastating story of two siblings struggling to survive in Japan during World War II.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wcNkHDbyc290hcWk7KXbBZUuXpq.jpg',
  },
] as const;

// 填充可用性数据
const availabilityData = [
  {
    movieId: '1',
    platformId: '1',
    regionId: '1',
    type: 'SUBSCRIPTION',
    url: 'https://www.netflix.com/title/60023642',
    lastChecked: new Date(),
    priceInfo: { subscription: '$9.99/month' },
  },
  {
    movieId: '2',
    platformId: '2',
    regionId: '1',
    type: 'SUBSCRIPTION',
    url: 'https://www.max.com/movies/grave-of-the-fireflies',
    lastChecked: new Date(),
    priceInfo: { subscription: '$15.49/month' },
  },
  {
    movieId: '1',
    platformId: '1',
    regionId: '5',
    type: 'SUBSCRIPTION',
    url: 'https://www.netflix.com/title/60023642',
    lastChecked: new Date(),
    priceInfo: { subscription: '€4.99/month' },
  },
];

async function main() {
  console.log('Starting data seeding...');

  // Clear existing data
  await prisma.availability.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.region.deleteMany();

  console.log('Cleared existing data');

  // Seed regions
  const createdRegions = await Promise.all(
    regions.map((region) =>
      prisma.region.create({
        data: region,
      })
    )
  );

  console.log('Created regions');

  // Seed platforms
  const createdPlatforms = await Promise.all(
    platforms.map((platform) =>
      prisma.platform.create({
        data: platform,
      })
    )
  );

  console.log('Created platforms');

  // Seed movies
  const createdMovies = await Promise.all(
    movies.map((movie) =>
      prisma.movie.create({
        data: movie,
      })
    )
  );

  console.log('Created movies');

  // Seed availabilities
  const availabilities = [
    {
      movieId: createdMovies[0].id,
      platformId: createdPlatforms[0].id,
      regionId: createdRegions[0].id,
      type: 'SUBSCRIPTION',
      lastChecked: new Date(),
      priceInfo: { subscription: '$9.99/month' },
    },
    {
      movieId: createdMovies[2].id,
      platformId: createdPlatforms[0].id,
      regionId: createdRegions[0].id,
      type: 'SUBSCRIPTION',
      lastChecked: new Date(),
      priceInfo: { subscription: '$15.49/month' },
    },
    {
      movieId: createdMovies[0].id,
      platformId: createdPlatforms[0].id,
      regionId: createdRegions[4].id,
      type: 'SUBSCRIPTION',
      lastChecked: new Date(),
      priceInfo: { subscription: '€4.99/month' },
    },
  ];

  await Promise.all(
    availabilities.map((data) =>
      prisma.availability.create({
        data,
      })
    )
  );

  console.log('Created availabilities');
  console.log('Data seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during data seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 