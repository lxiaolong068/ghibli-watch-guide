#!/usr/bin/env tsx
/**
 * Update Database Content to English
 * Updates existing Chinese content to English for user-facing text
 */

import { PrismaClient } from '../prisma/generated/client';
import { GHIBLI_REVIEWS_EN } from '../data/ghibli-reviews-en';
import { GHIBLI_WATCH_GUIDES_EN } from '../data/ghibli-watch-guides-en';
import { GHIBLI_MOVIES_EN } from '../data/ghibli-movies-en';

const prisma = new PrismaClient();

async function updateContentToEnglish() {
  console.log('🌍 Starting English content update...');
  console.log('📅 Execution time:', new Date().toLocaleString('en-US'));

  const startTime = Date.now();

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Show before statistics
    console.log('\n📊 Before update statistics:');
    const beforeStats = {
      movies: await prisma.movie.count(),
      characters: await prisma.character.count(),
      reviews: await prisma.movieReview.count(),
      guides: await prisma.watchGuide.count(),
    };
    console.log('  Movies:', beforeStats.movies);
    console.log('  Characters:', beforeStats.characters);
    console.log('  Reviews:', beforeStats.reviews);
    console.log('  Watch Guides:', beforeStats.guides);

    let updatedReviews = 0;
    let updatedGuides = 0;
    let updatedCharacters = 0;

    // Update movie reviews to English
    console.log('\n📝 Updating movie reviews to English...');
    for (const review of GHIBLI_REVIEWS_EN) {
      const existingReview = await prisma.movieReview.findFirst({
        where: {
          movie: { tmdbId: review.movieTmdbId },
          language: 'zh'
        }
      });

      if (existingReview) {
        await prisma.movieReview.update({
          where: { id: existingReview.id },
          data: {
            title: review.title,
            content: review.content,
            author: review.author,
            language: 'en'
          }
        });
        console.log(`  ✅ Updated review: ${review.title}`);
        updatedReviews++;
      } else {
        // Create new English review if no Chinese version exists
        const movie = await prisma.movie.findUnique({
          where: { tmdbId: review.movieTmdbId }
        });
        
        if (movie) {
          await prisma.movieReview.create({
            data: {
              movieId: movie.id,
              title: review.title,
              content: review.content,
              rating: review.rating,
              author: review.author,
              reviewType: review.reviewType,
              language: 'en',
              isPublished: true,
              publishedAt: review.publishedAt
            }
          });
          console.log(`  ✅ Created new English review: ${review.title}`);
          updatedReviews++;
        }
      }
    }

    // Update watch guides to English
    console.log('\n📚 Updating watch guides to English...');
    for (const guide of GHIBLI_WATCH_GUIDES_EN) {
      const existingGuide = await prisma.watchGuide.findFirst({
        where: {
          guideType: guide.guideType
        }
      });

      if (existingGuide) {
        await prisma.watchGuide.update({
          where: { id: existingGuide.id },
          data: {
            title: guide.title,
            description: guide.description,
            content: guide.content
          }
        });
        console.log(`  ✅ Updated guide: ${guide.title}`);
        updatedGuides++;
      } else {
        // Create new English guide
        const newGuide = await prisma.watchGuide.create({
          data: {
            title: guide.title,
            description: guide.description,
            guideType: guide.guideType,
            content: guide.content,
            isPublished: guide.isPublished
          }
        });

        // Add guide movies
        for (const guideMovie of guide.movies) {
          const movie = await prisma.movie.findUnique({
            where: { tmdbId: guideMovie.tmdbId }
          });
          
          if (movie) {
            await prisma.watchGuideMovie.create({
              data: {
                guideId: newGuide.id,
                movieId: movie.id,
                order: guideMovie.order,
                notes: guideMovie.notes || guideMovie.reason
              }
            });
          }
        }
        console.log(`  ✅ Created new English guide: ${guide.title}`);
        updatedGuides++;
      }
    }

    // Update character descriptions to English
    console.log('\n👥 Updating character descriptions to English...');
    for (const movieData of GHIBLI_MOVIES_EN) {
      const movie = await prisma.movie.findUnique({
        where: { tmdbId: movieData.tmdbId }
      });

      if (movie) {
        // Update movie synopsis to English
        await prisma.movie.update({
          where: { id: movie.id },
          data: {
            synopsis: movieData.synopsis,
            director: movieData.director
          }
        });

        for (const characterData of movieData.mainCharacters) {
          const character = await prisma.character.findFirst({
            where: { name: characterData.name }
          });

          if (character) {
            await prisma.character.update({
              where: { id: character.id },
              data: {
                description: characterData.description
              }
            });
            console.log(`  ✅ Updated character: ${characterData.name}`);
            updatedCharacters++;
          }
        }
      }
    }

    // Show after statistics
    console.log('\n📊 After update statistics:');
    const afterStats = {
      movies: await prisma.movie.count(),
      characters: await prisma.character.count(),
      reviews: await prisma.movieReview.count(),
      guides: await prisma.watchGuide.count(),
    };
    console.log('  Movies:', afterStats.movies);
    console.log('  Characters:', afterStats.characters);
    console.log('  Reviews:', afterStats.reviews);
    console.log('  Watch Guides:', afterStats.guides);

    console.log('\n🎯 Update Summary:');
    console.log(`  - Updated Reviews: ${updatedReviews}`);
    console.log(`  - Updated Guides: ${updatedGuides}`);
    console.log(`  - Updated Characters: ${updatedCharacters}`);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    console.log(`\n⏱️ Total execution time: ${duration} seconds`);
    console.log('🎉 English content update completed successfully!');

  } catch (error) {
    console.error('❌ Error during English content update:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
if (require.main === module) {
  updateContentToEnglish()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { updateContentToEnglish };
