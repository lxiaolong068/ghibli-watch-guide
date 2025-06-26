import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');

    // Test database connection
    const movieCount = await prisma.movie.count();
    const characterCount = await prisma.character.count();
    const movieCharacterCount = await prisma.movieCharacter.count();

    console.log(`📊 Database statistics: Movies ${movieCount}, Characters ${characterCount}, Relations ${movieCharacterCount}`);

    // Get some sample data
    const sampleMovies = await prisma.movie.findMany({
      take: 3,
      select: {
        id: true,
        tmdbId: true,
        titleEn: true,
        titleZh: true
      }
    });

    const sampleCharacters = await prisma.character.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        nameZh: true,
        isMainCharacter: true
      }
    });

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        counts: {
          movies: movieCount,
          characters: characterCount,
          movieCharacters: movieCharacterCount
        }
      },
      samples: {
        movies: sampleMovies,
        characters: sampleCharacters
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...'
      }
    }, { status: 500 });
  }
}
