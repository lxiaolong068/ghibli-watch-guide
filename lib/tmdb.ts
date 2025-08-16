import process from 'process';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY; // 使用 process.env 获取 API Key
const TMDB_API_TIMEOUT = 5000; // 请求超时时间（毫秒）
const TMDB_API_RETRY_COUNT = 2; // 失败后重试次数
const TMDB_API_RETRY_DELAY = 300; // 重试延迟（毫秒）

// Only throw error at runtime, not during build
function checkApiKey() {
  if (!TMDB_API_KEY) {
    throw new Error('Missing TMDB_API_KEY environment variable');
  }
}

interface TmdbErrorResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

/**
 * 基础的 TMDB API 请求函数
 * @param endpoint API 端点路径 (e.g., '/movie/{movie_id}')
 * @param params 查询参数对象
 * @param revalidateSeconds 重新验证时间（秒），false表示不重新验证
 * @returns API 响应的 JSON 数据
 * @throws 如果请求失败或 API 返回错误，则抛出错误
 */
/**
 * 实现带重试机制的休眠函数
 * @param ms 休眠时间（毫秒）
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 增强版TMDB API请求函数，带有超时、重试和增强的错误处理
 * @param endpoint API端点路径
 * @param params 查询参数对象
 * @param revalidateSeconds 重新验证时间（秒）
 * @param retryCount 当前重试次数（内部使用）
 * @returns API响应的JSON数据
 */
async function fetchTmdbApi<T>(endpoint: string, params: Record<string, string | number> = {}, revalidateSeconds: number | false = 3600, retryCount: number = 0): Promise<T> {
  // 确认API Key存在
  checkApiKey();

  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY!);
  url.searchParams.append('language', 'en-US'); // 默认使用英文

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  // 创建缓存键以便在开发中日志记录
  const cacheKey = endpoint.replace(/\//g, '_') + '_' + Object.values(params).join('_');
  
  try {
    // 优化Next.js缓存选项
    const fetchOptions: RequestInit = {
      // 添加请求超时
      signal: AbortSignal.timeout(TMDB_API_TIMEOUT),
      next: revalidateSeconds === false 
        ? { revalidate: false } 
        : { 
            revalidate: revalidateSeconds,
            tags: [`tmdb-${endpoint.split('/')[1] || 'api'}`] // 添加基于端点的标签
          },
    };
    
    // 只在开发环境记录详细日志
    if (process.env.NODE_ENV !== 'production') {
      const retryMessage = retryCount > 0 ? ` (retry ${retryCount}/${TMDB_API_RETRY_COUNT})` : '';
      console.log(`[TMDB] Fetching: ${cacheKey}${retryMessage} (revalidate: ${revalidateSeconds === false ? 'disabled' : revalidateSeconds}s)`);
    }
    
    const response = await fetch(url.toString(), fetchOptions);

    // 处理非成功响应
    if (!response.ok) {
      let errorData: TmdbErrorResponse | null = null;
      try {
        // 尝试解析TMDB的错误响应体
        errorData = await response.json() as TmdbErrorResponse;
      } catch (_error) {
        // 无法解析JSON时使用通用错误
      }
      
      // 创建详细的错误对象
      const error = new Error(`TMDB API Error (${errorData?.status_code || response.status}): ${errorData?.status_message || response.statusText}`) as Error & { status: number; endpoint: string };
      error.status = response.status;
      error.endpoint = endpoint;
      throw error;
    }

    const data = await response.json() as T;
    return data;
  } catch (error) {
    // 处理错误，包括超时、网络错误等
    const isTimeoutError = error instanceof DOMException && error.name === 'TimeoutError';
    const isNetworkError = error instanceof TypeError && error.message.includes('network');
    const isServerError = error instanceof Error && 'status' in error && typeof (error as { status: number }).status === 'number' && (error as { status: number }).status >= 500;
    
    // 可重试的错误类型
    const isRetryableError = isTimeoutError || isNetworkError || isServerError;
    
    if (isRetryableError && retryCount < TMDB_API_RETRY_COUNT) {
      // 指数退避重试延迟 (300ms, 600ms, ...)
      const delay = TMDB_API_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`[TMDB] Retrying ${endpoint} after ${delay}ms (${retryCount + 1}/${TMDB_API_RETRY_COUNT})`);
      
      await sleep(delay);
      // 递归调用自身进行重试，增加重试计数
      return fetchTmdbApi<T>(endpoint, params, revalidateSeconds, retryCount + 1);
    }
    
    // 记录详细错误信息
    console.error(`[TMDB] Failed fetching ${endpoint}:`, {
      message: error instanceof Error ? error.message : String(error),
      retries: retryCount,
      params
    });
    
    // 重新抛出增强的错误信息
    throw error;
  }
}

// Define cast member type for Credits
interface CastMember {
  character?: string;
  name?: string;
  id: number;
  order?: number;
  profile_path?: string | null;
}

// Define crew member type for Credits
interface CrewMember {
  job?: string;
  name?: string;
  id: number;
  department?: string;
  profile_path?: string | null;
}

// Define movie credits type
interface Credits {
  cast?: CastMember[];
  crew?: CrewMember[];
}

// Define movie details interface type (add more fields as needed)
export interface MovieDetails {
  id: number;
  imdb_id: string | null; // Added
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // YYYY-MM-DD format
  runtime: number | null; // in minutes
  vote_average?: number; // Added (optional as it might not always be present)
  genres: { id: number; name: string }[];
  production_companies: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  credits?: Credits; // Added
  // Can add more fields based on TMDB API documentation: https://developer.themoviedb.org/reference/movie-details
}

/**
 * 根据电影 ID 获取电影详情
 * @param movieId TMDB 电影 ID
 * @returns 电影详情对象
 */
/**
 * 获取电影详情，带有优化的缓存策略和错误处理
 * @param movieId TMDB电影ID
 * @param options 可选配置参数
 * @returns 电影详情对象
 */
export async function getMovieDetails(
  movieId: number, 
  options: { cache?: number | false } = {}
): Promise<MovieDetails> {
  // 默认使用1天缓存，但允许自定义
  const revalidateSeconds = options.cache !== undefined ? options.cache : 86400; // 默认1天
  
  try {
    // 使用带重试机制的API调用
    const movieDetails = await fetchTmdbApi<MovieDetails>(`/movie/${movieId}`, {}, revalidateSeconds);
    
    // 只在开发环境记录成功日志，减少生产环境日志量
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[TMDB] Successfully fetched details for movie: ${movieDetails.title}`);
    }
    
    return movieDetails;
  } catch (error) {
    const _isServerError = error instanceof Error && 'status' in error && typeof (error as { status: number }).status === 'number' && (error as { status: number }).status >= 500;
    const isClientError = error instanceof Error && 'status' in error && typeof (error as { status: number }).status === 'number' && (error as { status: number }).status >= 400 && (error as { status: number }).status < 500;
    
    // 客户端错误（如404）通常不需要重试，直接处理
    if (isClientError && 'status' in error && (error as { status: number }).status === 404) {
      console.warn(`[TMDB] Movie ID ${movieId} not found`);
      // 可以返回一个空的电影对象，取决于你的错误处理策略
      throw new Error(`Movie with ID ${movieId} not found in TMDB`);
    }
    
    console.error(`[TMDB] Failed to fetch details for movie ID ${movieId}:`, error);
    throw error;
  }
}

// --- Watch Provider Interfaces ---
// Based on https://developer.themoviedb.org/reference/movie-watch-providers

export interface WatchProviderItem {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderCountryResult {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  ads?: WatchProviderItem[]; // Add other types like 'ads' if needed
}

export interface WatchProviderResults {
  [countryCode: string]: WatchProviderCountryResult;
}

export interface MovieWatchProvidersResponse {
  id: number;
  results: WatchProviderResults;
}

// --- End Watch Provider Interfaces ---

/**
 * 根据电影 ID 获取电影详情
 * @param movieId TMDB 电影 ID
 * @returns 观看提供商信息
 */
/**
 * 获取电影观看提供商信息，带有更快的缓存更新频率
 * @param movieId TMDB电影ID
 * @param options 可选配置参数
 * @returns 观看提供商信息
 */
export async function getMovieWatchProviders(
  movieId: number,
  options: { cache?: number | false } = {}
): Promise<MovieWatchProvidersResponse> {
  // 提供商数据变化较频繁，默认使用1小时缓存
  const revalidateSeconds = options.cache !== undefined ? options.cache : 3600; // 默认1小时
  
  try {
    // TMDB API端点是/movie/{movie_id}/watch/providers
    const providers = await fetchTmdbApi<MovieWatchProvidersResponse>(
      `/movie/${movieId}/watch/providers`, 
      {}, 
      revalidateSeconds
    );
    
    // 只在开发环境记录成功日志
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[TMDB] Successfully fetched watch providers for movie ID: ${movieId}`);
    }
    
    return providers;
  } catch (error) {
    // 对于提供商API，404并非严重错误，可能只是该电影没有提供商数据
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 404) {
      // 返回一个有效但空的响应，而不是抛出错误
      return {
        id: movieId,
        results: {}
      };
    }
    
    console.error(`[TMDB] Failed to fetch watch providers for movie ID ${movieId}:`, error);
    throw error;
  }
}

// 示例：获取"千与千寻" (ID: 129) 的详情
// getMovieDetails(129).then(details => console.log(details)).catch(err => console.error(err)); 