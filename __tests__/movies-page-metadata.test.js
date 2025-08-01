/**
 * Movies Page Metadata Generation Tests
 * Tests the dynamic title generation for SEO optimization
 */

import { describe, test, expect } from 'vitest';

// Mock the generateMetadata function logic for testing
function generateMoviePageMetadata(searchParams) {
  const page = searchParams?.['page'] ?? '1';
  const parsedPage = parseInt(Array.isArray(page) ? page[0] : page, 10);
  const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  
  const baseTitle = 'Studio Ghibli Movie List';
  const siteName = 'Where to Watch Studio Ghibli Movies';
  
  let title, description, ogTitle;
  
  if (currentPage <= 1) {
    title = `${baseTitle} | ${siteName}`;
    description = 'Complete list of all Studio Ghibli movies. Find where to watch each film, including Spirited Away, My Neighbor Totoro, Howl\'s Moving Castle, and more.';
    ogTitle = 'Complete Studio Ghibli Movie List';
  } else {
    title = `${baseTitle} - Page ${currentPage} | ${siteName}`;
    description = `Browse Studio Ghibli movies - Page ${currentPage}. Find where to watch each film, including streaming availability on Netflix, Max, and other platforms.`;
    ogTitle = `Complete Studio Ghibli Movie List - Page ${currentPage}`;
  }
  
  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: 'Browse all Studio Ghibli films and find out where to stream them.',
      type: 'website',
    },
  };
}

describe('Movies Page Metadata Generation', () => {
  test('should generate correct title for first page (no page param)', () => {
    const metadata = generateMoviePageMetadata({});
    expect(metadata.title).toBe('Studio Ghibli Movie List | Where to Watch Studio Ghibli Movies');
    expect(metadata.openGraph.title).toBe('Complete Studio Ghibli Movie List');
  });

  test('should generate correct title for first page (page=1)', () => {
    const metadata = generateMoviePageMetadata({ page: '1' });
    expect(metadata.title).toBe('Studio Ghibli Movie List | Where to Watch Studio Ghibli Movies');
    expect(metadata.openGraph.title).toBe('Complete Studio Ghibli Movie List');
  });

  test('should generate correct title for second page', () => {
    const metadata = generateMoviePageMetadata({ page: '2' });
    expect(metadata.title).toBe('Studio Ghibli Movie List - Page 2 | Where to Watch Studio Ghibli Movies');
    expect(metadata.openGraph.title).toBe('Complete Studio Ghibli Movie List - Page 2');
    expect(metadata.description).toContain('Page 2');
  });

  test('should generate correct title for third page', () => {
    const metadata = generateMoviePageMetadata({ page: '3' });
    expect(metadata.title).toBe('Studio Ghibli Movie List - Page 3 | Where to Watch Studio Ghibli Movies');
    expect(metadata.openGraph.title).toBe('Complete Studio Ghibli Movie List - Page 3');
    expect(metadata.description).toContain('Page 3');
  });

  test('should handle invalid page numbers gracefully', () => {
    const testCases = ['0', '-1', 'abc', '', null, undefined];
    
    testCases.forEach(invalidPage => {
      const metadata = generateMoviePageMetadata({ page: invalidPage });
      expect(metadata.title).toBe('Studio Ghibli Movie List | Where to Watch Studio Ghibli Movies');
      expect(metadata.openGraph.title).toBe('Complete Studio Ghibli Movie List');
    });
  });

  test('should handle array page parameters', () => {
    const metadata = generateMoviePageMetadata({ page: ['2', '3'] });
    expect(metadata.title).toBe('Studio Ghibli Movie List - Page 2 | Where to Watch Studio Ghibli Movies');
    expect(metadata.openGraph.title).toBe('Complete Studio Ghibli Movie List - Page 2');
  });

  test('should generate unique descriptions for different pages', () => {
    const page1Metadata = generateMoviePageMetadata({ page: '1' });
    const page2Metadata = generateMoviePageMetadata({ page: '2' });
    
    expect(page1Metadata.description).not.toBe(page2Metadata.description);
    expect(page1Metadata.description).toContain('Complete list of all Studio Ghibli movies');
    expect(page2Metadata.description).toContain('Browse Studio Ghibli movies - Page 2');
  });

  test('should maintain consistent OpenGraph structure', () => {
    const metadata = generateMoviePageMetadata({ page: '2' });
    
    expect(metadata.openGraph).toHaveProperty('title');
    expect(metadata.openGraph).toHaveProperty('description');
    expect(metadata.openGraph).toHaveProperty('type');
    expect(metadata.openGraph.type).toBe('website');
    expect(metadata.openGraph.description).toBe('Browse all Studio Ghibli films and find out where to stream them.');
  });
});
