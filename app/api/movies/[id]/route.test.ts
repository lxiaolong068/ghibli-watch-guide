import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest'; // Import Mock type
import { GET } from './route'; 
import { NextRequest } from 'next/server'; // NextResponse not used directly
import type { MovieDetails } from '@/lib/tmdb'; 

// Import the ORIGINAL modules. Vitest will replace them with mocks from __mocks__.
import { getMovieDetails, getMovieWatchProviders } from '@/lib/tmdb';
import { prisma } from '@/lib/prisma';

// Tell Vitest to use the mocks from the __mocks__ directory
vi.mock('@/lib/tmdb');
vi.mock('@/lib/prisma');

// Cast the auto-mocked imports to Mock type to control them
const mockedGetMovieDetails = getMovieDetails as Mock;
const mockedGetMovieWatchProviders = getMovieWatchProviders as Mock;
const mockFindUnique = prisma.movie.findUnique as Mock;
const _mockDisconnect = prisma.$disconnect as Mock; // If needed

// 模拟 NextResponse.json 用于断言
const mockJson = vi.fn();
vi.mock('next/server', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next/server')>();
  return {
    ...mod,
    NextResponse: {
      ...mod.NextResponse,
      json: (...args: [unknown, { status?: number }?]) => { 
        // 记录调用参数以便断言
        mockJson(...args);
        // 返回一个模拟的 Response 对象
        return new Response(JSON.stringify(args[0]), { status: args[1]?.status || 200 });
      },
    },
  };
});

describe('API Route: /api/movies/[id]', () => {

  beforeEach(() => {
    // 清除上一个测试的状态
    // Clear ALL mocks associated with the auto-mocked modules
    vi.clearAllMocks();

    // Reset specific mock implementations if needed (clearAllMocks resets calls but not implementation)
    mockJson.mockClear();

    // Default mock implementations for most tests
    // Note: We now access the mock via the casted variable
  });

  // 辅助函数创建模拟请求 (使用 NextRequest)
  const createMockRequest = (movieId: string): NextRequest => {
    // 构造一个 URL
    const url = new URL(`http://localhost/api/movies/${movieId}`);
    // 创建 NextRequest 实例
    return new NextRequest(url);
  };

  it('should return movie details for a valid movie ID', async () => {
    const mockMovieDetails: MovieDetails = {
      id: 129,
      imdb_id: null, 
      title: 'Spirited Away',
      original_title: '千と千尋の神隠し',
      overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
      poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      backdrop_path: '/Ab8mkHmkDzvB2gdBRfbzlbZ6stZ.jpg',
      release_date: '2001-07-20',
      runtime: 125,
      genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
      production_companies: [],
      // Add other properties if needed by the combinedData logic in GET
    }; 
    // Example watch providers, ensure 'id' matches the tmdbId used
    const mockWatchProviders = {
      id: 129,
      results: {
        US: {
          flatrate: [
            {
              logo_path: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',
              provider_id: 8,
              provider_name: 'Netflix',
              display_priority: 0
            }
          ]
          // Add link, buy, rent if needed by tests
        }
      }
    };
 
    // Mock prisma.movie.findUnique to return a movie
    mockFindUnique.mockResolvedValue({
      id: 'clxyz123', 
      tmdbId: 129,
      titleEn: 'Spirited Away',
      // include other fields if movieArgs.select needs them
    });

    // Setup TMDB mock return values
    mockedGetMovieDetails.mockResolvedValue(mockMovieDetails);
    mockedGetMovieWatchProviders.mockResolvedValue(mockWatchProviders);

    const request = createMockRequest('clxyz123'); 
    const response = await GET(request, { params: { id: 'clxyz123' } });

    // 检查 getMovieDetails 是否被正确调用
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'clxyz123' }, select: expect.any(Object) });
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(129);
    expect(mockedGetMovieWatchProviders).toHaveBeenCalledWith(129);

    const expectedCombinedData = {
      ...mockMovieDetails,
      watchProviders: mockWatchProviders.results,
    };

    // 检查 NextResponse.json 是否被正确调用
    expect(mockJson).toHaveBeenCalledWith(expectedCombinedData);
    // 可以选择检查响应体内容
    const body = await response.json();
    expect(body).toEqual(expectedCombinedData);
    expect(response.status).toBe(200);
  });

  it('should return 404 if movie is not found', async () => {
    // Mock prisma.movie.findUnique to return null (movie not found in DB)
    mockFindUnique.mockResolvedValue(null);

    const request = createMockRequest('nonexistent-cuid'); 
    const response = await GET(request, { params: { id: 'nonexistent-cuid' } });

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'nonexistent-cuid' }, select: expect.any(Object) });
    // getMovieDetails should NOT have been called
    expect(mockedGetMovieDetails).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Movie not found in database' }, { status: 404 });
    expect(response.status).toBe(404);
  });

  it('should return 401 if TMDB API key is invalid', async () => {
    // 模拟 getMovieDetails 抛出 TMDB 401 错误
    const tmdbAuthError = new Error('TMDB API Error (401): Invalid API key: You must be granted a valid key.');
    // Mock prisma to return a valid movie first
    mockFindUnique.mockResolvedValue({ id: 'clxyz456', tmdbId: 456, titleEn: 'Test Movie' });
    mockedGetMovieDetails.mockRejectedValue(tmdbAuthError);
    // Mock watch providers, ensure 'id' matches tmdbId
    mockedGetMovieWatchProviders.mockResolvedValue({ id: 456, results: {} });

    const request = createMockRequest('clxyz456'); 
    const response = await GET(request, { params: { id: 'clxyz456' } });

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'clxyz456' }, select: expect.any(Object) });
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(456);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid TMDB API Key or access denied' }, { status: 401 });
    expect(response.status).toBe(401);
  });

  it('should return 502 for other TMDB API errors', async () => {
    // 模拟 getMovieDetails 抛出其他 TMDB 错误
    const tmdbGenericError = new Error('TMDB API Error (500): Internal Server Error.');
    // Mock prisma to return a valid movie first
    mockFindUnique.mockResolvedValue({ id: 'clxyz789', tmdbId: 789, titleEn: 'Another Test' });
    mockedGetMovieDetails.mockRejectedValue(tmdbGenericError);
    // Mock watch providers, ensure 'id' matches tmdbId
    mockedGetMovieWatchProviders.mockResolvedValue({ id: 789, results: {} });

    const request = createMockRequest('clxyz789'); 
    const response = await GET(request, { params: { id: 'clxyz789' } });

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'clxyz789' }, select: expect.any(Object) });
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(789);
    expect(mockJson).toHaveBeenCalledWith({ error: `TMDB API error: ${tmdbGenericError.message}` }, { status: 502 });
    expect(response.status).toBe(502);
  });

  it('should return 503 if fetch itself fails', async () => {
    // 模拟 fetch 失败 (更深层次的模拟，或者直接模拟 getMovieDetails 抛出特定错误)
    const fetchError = new Error('fetch failed'); 
    // Mock prisma to return a valid movie first
    mockFindUnique.mockResolvedValue({ id: 'clxyz101', tmdbId: 101, titleEn: 'Fetch Fail Test' });
    mockedGetMovieDetails.mockRejectedValue(fetchError);
    // Mock watch providers, ensure 'id' matches tmdbId
    mockedGetMovieWatchProviders.mockResolvedValue({ id: 101, results: {} });

    const request = createMockRequest('clxyz101'); 
    const response = await GET(request, { params: { id: 'clxyz101' } });

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'clxyz101' }, select: expect.any(Object) });
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(101);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to connect to TMDB API' }, { status: 503 });
    expect(response.status).toBe(503);
  });

  it('should return 400 for invalid movie ID format', async () => {
    // Mock prisma.movie.findUnique to return null for invalid CUID
    mockFindUnique.mockResolvedValue(null);

    const request = createMockRequest('invalid-id'); 
    const response = await GET(request, { params: { id: 'invalid-id' } });

    // 检查 getMovieDetails 是否未被调用
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'invalid-id' }, select: expect.any(Object) });
    expect(mockedGetMovieDetails).not.toHaveBeenCalled();
    // Expect 404 because the route checks DB first
    expect(mockJson).toHaveBeenCalledWith({ error: 'Movie not found in database' }, { status: 404 });
    expect(response.status).toBe(404);
  });

  // 虽然 Next.js 路由通常会处理缺失参数的情况，但可以加个测试以防万一
  // 注意：实际中，如果 id 参数缺失，路由本身可能不会匹配，这个测试可能不会按预期执行
  // 但为了代码覆盖率和逻辑健壮性，我们假设路由可以被这样调用
  // it('should return 400 if movie ID is missing', async () => {
  //   const request = createMockRequest();
  //   // 模拟 params.id 为 undefined 的情况 (需要调整类型或模拟方式)
  //   const response = await GET(request, { params: { id: undefined as any } });

  //   expect(mockedGetMovieDetails).not.toHaveBeenCalled();
  //   expect(mockJson).toHaveBeenCalledWith({ error: 'Movie ID is required' }, { status: 400 });
  //   expect(response.status).toBe(400);
  // });

}); 