import process from 'process';

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY; // 使用 process.env 获取 API Key

if (!TMDB_API_KEY) {
  throw new Error('Missing TMDB_API_KEY environment variable');
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
async function fetchTmdbApi<T>(endpoint: string, params: Record<string, string | number> = {}, revalidateSeconds: number | false = 3600): Promise<T> {
  // 再次确认 API Key 存在，以满足 TypeScript 类型检查
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not defined. This should not happen if the initial check passed.');
  }

  const url = new URL(`${TMDB_API_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US'); // 默认使用英文，后续可考虑支持多语言

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    // Add Next.js caching options
    const fetchOptions: RequestInit = {
      next: revalidateSeconds === false ? { revalidate: false } : { revalidate: revalidateSeconds },
    };
    console.log(`Fetching TMDB: ${url.toString()} with options:`, fetchOptions); // Log fetch options
    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      let errorData: TmdbErrorResponse | null = null;
      try {
        // 尝试解析 TMDB 的错误响应体
        errorData = await response.json() as TmdbErrorResponse;
      } catch (parseError) {
        // 如果无法解析 JSON，则抛出通用错误
        throw new Error(`TMDB API request failed with status ${response.status}: ${response.statusText}`);
      }
      // 如果解析成功，抛出包含 TMDB 错误信息的错误
      throw new Error(`TMDB API Error (${errorData?.status_code}): ${errorData?.status_message || response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error("Error fetching TMDB API:", error);
    // 可以根据需要进一步处理或重新抛出错误
    throw error; // 重新抛出错误，以便调用者知道发生了问题
  }
}

// Define crew member type for Credits
interface CrewMember {
  job?: string;
  name?: string;
  id: number;
  // Add other relevant crew properties if needed
}

// Define movie credits type
interface Credits {
  crew?: CrewMember[];
  // cast?: CastMember[]; // Can add cast later if needed
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
export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  console.log(`Fetching details for movie ID: ${movieId} (revalidate: 1 day)`); // 添加日志
  try {
    // Fetch with a longer revalidation period (e.g., 1 day = 86400 seconds)
    const movieDetails = await fetchTmdbApi<MovieDetails>(`/movie/${movieId}`, {}, 86400);
    console.log(`Successfully fetched details for movie: ${movieDetails.title}`); // 成功日志
    return movieDetails;
  } catch (error) {
    console.error(`Failed to fetch details for movie ID ${movieId}:`, error);
    // 在这里可以决定是返回 null, undefined, 还是继续抛出错误
    // 返回一个表示错误的特定对象可能更好，但这取决于你的错误处理策略
    throw error; // 暂时重新抛出
  }
}

// --- Watch Provider Interfaces ---
// Based on https://developer.themoviedb.org/reference/movie-watch-providers

interface WatchProviderItem {
  logo_path: string | null;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProviderCountryResult {
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
export async function getMovieWatchProviders(movieId: number): Promise<MovieWatchProvidersResponse> {
  console.log(`Fetching watch providers for movie ID: ${movieId} (revalidate: 1 hour)`);
  try {
    // TMDB API 端点是 /movie/{movie_id}/watch/providers
    // Revalidate providers more frequently (e.g., 1 hour = 3600 seconds)
    const providers = await fetchTmdbApi<MovieWatchProvidersResponse>(`/movie/${movieId}/watch/providers`, {}, 3600);
    console.log(`Successfully fetched watch providers for movie ID: ${movieId}`);
    return providers;
  } catch (error) {
    console.error(`Failed to fetch watch providers for movie ID ${movieId}:`, error);
    // 根据错误处理策略决定如何处理
    // 如果找不到提供商信息 (例如 404), TMDB 可能不返回错误，而是返回空 results
    // 如果是 API 错误（如 401），fetchTmdbApi 会抛出
    throw error; // 暂时重新抛出
  }
}

// 示例：获取"千与千寻" (ID: 129) 的详情
// getMovieDetails(129).then(details => console.log(details)).catch(err => console.error(err)); 