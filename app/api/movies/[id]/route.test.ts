import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route'; // 导入我们要测试的 GET 处理函数
import { NextResponse, NextRequest } from 'next/server'; // 导入 NextRequest
import type { MovieDetails } from '@/lib/tmdb'; // 导入类型用于模拟

// 模拟 lib/tmdb 模块
vi.mock('@/lib/tmdb', () => ({
  getMovieDetails: vi.fn(), // 模拟 getMovieDetails 函数
}));

// 模拟 NextResponse.json 用于断言
const mockJson = vi.fn();
vi.mock('next/server', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next/server')>();
  return {
    ...mod,
    NextResponse: {
      ...mod.NextResponse,
      json: (...args: any[]) => {
        // 记录调用参数以便断言
        mockJson(...args);
        // 返回一个模拟的 Response 对象
        return new Response(JSON.stringify(args[0]), { status: args[1]?.status || 200 });
      },
    },
  };
});

// 引入模拟后的 getMovieDetails
import { getMovieDetails } from '@/lib/tmdb';
const mockedGetMovieDetails = vi.mocked(getMovieDetails);

describe('API Route: /api/movies/[id]', () => {

  beforeEach(() => {
    // 在每个测试用例开始前重置模拟函数和调用记录
    vi.clearAllMocks();
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
      title: 'Spirited Away',
      original_title: '千と千尋の神隠し',
      overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
      poster_path: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      backdrop_path: '/Ab8mkHmkDzvB2gdBRfbzlbZ6stZ.jpg',
      release_date: '2001-07-20',
      runtime: 125,
      genres: [{ id: 16, name: 'Animation' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' }],
      production_companies: [], // 简化
    };

    // 设置模拟函数的返回值
    mockedGetMovieDetails.mockResolvedValue(mockMovieDetails);

    const request = createMockRequest('129'); // 使用辅助函数
    const response = await GET(request, { params: { id: '129' } });

    // 检查 getMovieDetails 是否被正确调用
    expect(mockedGetMovieDetails).toHaveBeenCalledWith(129);
    // 检查 NextResponse.json 是否被正确调用
    expect(mockJson).toHaveBeenCalledWith(mockMovieDetails);
    // 可以选择检查响应体内容
    const body = await response.json();
    expect(body).toEqual(mockMovieDetails);
    expect(response.status).toBe(200);
  });

  it('should return 404 if movie is not found', async () => {
    // 模拟 getMovieDetails 抛出 TMDB 404 错误
    const tmdbNotFoundError = new Error('TMDB API Error (404): The resource you requested could not be found.');
    mockedGetMovieDetails.mockRejectedValue(tmdbNotFoundError);

    const request = createMockRequest('999999'); // 使用辅助函数
    const response = await GET(request, { params: { id: '999999' } });

    expect(mockedGetMovieDetails).toHaveBeenCalledWith(999999);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Movie not found' }, { status: 404 });
    expect(response.status).toBe(404);
  });

  it('should return 401 if TMDB API key is invalid', async () => {
    // 模拟 getMovieDetails 抛出 TMDB 401 错误
    const tmdbAuthError = new Error('TMDB API Error (401): Invalid API key: You must be granted a valid key.');
    mockedGetMovieDetails.mockRejectedValue(tmdbAuthError);

    const request = createMockRequest('129'); // 使用辅助函数
    const response = await GET(request, { params: { id: '129' } });

    expect(mockedGetMovieDetails).toHaveBeenCalledWith(129);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid TMDB API Key or access denied' }, { status: 401 });
    expect(response.status).toBe(401);
  });

  it('should return 502 for other TMDB API errors', async () => {
    // 模拟 getMovieDetails 抛出其他 TMDB 错误
    const tmdbGenericError = new Error('TMDB API Error (500): Internal Server Error.');
    mockedGetMovieDetails.mockRejectedValue(tmdbGenericError);

    const request = createMockRequest('129'); // 使用辅助函数
    const response = await GET(request, { params: { id: '129' } });

    expect(mockedGetMovieDetails).toHaveBeenCalledWith(129);
    expect(mockJson).toHaveBeenCalledWith({ error: `TMDB API error: ${tmdbGenericError.message}` }, { status: 502 });
    expect(response.status).toBe(502);
  });

   it('should return 503 if fetch itself fails', async () => {
    // 模拟 fetch 失败 (更深层次的模拟，或者直接模拟 getMovieDetails 抛出特定错误)
    const fetchError = new Error('fetch failed'); // fetch 失败通常是这种类型
    mockedGetMovieDetails.mockRejectedValue(fetchError);

    const request = createMockRequest('129'); // 使用辅助函数
    const response = await GET(request, { params: { id: '129' } });

    expect(mockedGetMovieDetails).toHaveBeenCalledWith(129);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to connect to TMDB API' }, { status: 503 });
    expect(response.status).toBe(503);
  });

  it('should return 400 for invalid movie ID format', async () => {
    const request = createMockRequest('invalid-id'); // 使用辅助函数
    const response = await GET(request, { params: { id: 'invalid-id' } });

    // 检查 getMovieDetails 是否未被调用
    expect(mockedGetMovieDetails).not.toHaveBeenCalled();
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid Movie ID format' }, { status: 400 });
    expect(response.status).toBe(400);
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