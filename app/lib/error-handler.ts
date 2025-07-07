import { NextResponse } from 'next/server';
import { Prisma } from '../../prisma/generated/client';

// 错误类型定义
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: unknown;
}

// 自定义错误类
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}

// 常见错误创建函数
export const createError = {
  notFound: (resource = 'Resource') => 
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  
  badRequest: (message = 'Bad request') => 
    new AppError(message, 400, 'BAD_REQUEST'),
  
  unauthorized: (message = 'Unauthorized') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Forbidden') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  conflict: (message = 'Conflict') => 
    new AppError(message, 409, 'CONFLICT'),
  
  tooManyRequests: (message = 'Too many requests') => 
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  
  internal: (message = 'Internal server error') => 
    new AppError(message, 500, 'INTERNAL_ERROR'),
};

// Prisma错误处理
export function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new AppError('Unique constraint violation', 409, 'UNIQUE_CONSTRAINT');
      case 'P2025':
        return new AppError('Record not found', 404, 'NOT_FOUND');
      case 'P2003':
        return new AppError('Foreign key constraint violation', 400, 'FOREIGN_KEY_CONSTRAINT');
      default:
        return new AppError('Database error', 500, 'DATABASE_ERROR', error.code);
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return new AppError('Unknown database error', 500, 'UNKNOWN_DATABASE_ERROR');
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return new AppError('Database connection error', 500, 'DATABASE_CONNECTION_ERROR');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return new AppError('Database initialization error', 500, 'DATABASE_INIT_ERROR');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new AppError('Invalid query parameters', 400, 'VALIDATION_ERROR');
  }

  return new AppError('Unknown error', 500, 'UNKNOWN_ERROR');
}

// TMDB API错误处理
export function handleTmdbError(error: unknown): AppError {
  if (error instanceof Error) {
    const errorWithStatus = error as Error & { status?: number; endpoint?: string };
    
    if (errorWithStatus.status) {
      switch (errorWithStatus.status) {
        case 401:
          return new AppError('TMDB API authentication failed', 500, 'TMDB_AUTH_ERROR');
        case 404:
          return new AppError('Movie not found in TMDB', 404, 'TMDB_NOT_FOUND');
        case 429:
          return new AppError('TMDB API rate limit exceeded', 429, 'TMDB_RATE_LIMIT');
        default:
          return new AppError(
            `TMDB API error: ${error.message}`, 
            errorWithStatus.status >= 500 ? 500 : 400, 
            'TMDB_ERROR'
          );
      }
    }
  }

  return new AppError('External API error', 500, 'EXTERNAL_API_ERROR');
}

// 通用错误处理函数
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  let apiError: ApiError;

  if (error instanceof AppError) {
    apiError = {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(error);
    apiError = {
      message: prismaError.message,
      code: prismaError.code,
      statusCode: prismaError.statusCode,
    };
  } else if (error instanceof Error) {
    apiError = {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    };
  } else {
    apiError = {
      message: 'Unknown error occurred',
      statusCode: 500,
      code: 'UNKNOWN_ERROR',
    };
  }

  return NextResponse.json(
    {
      error: apiError.message,
      code: apiError.code,
      ...(process.env.NODE_ENV === 'development' && { details: apiError.details }),
    },
    { status: apiError.statusCode }
  );
}

// 客户端错误处理工具
export const clientErrorHandler = {
  // 处理fetch响应
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new AppError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }
    return response.json();
  },

  // 显示用户友好的错误消息
  getDisplayMessage(error: unknown): string {
    if (error instanceof AppError) {
      switch (error.code) {
        case 'NOT_FOUND':
          return 'The requested item could not be found.';
        case 'UNAUTHORIZED':
          return 'You are not authorized to perform this action.';
        case 'FORBIDDEN':
          return 'Access to this resource is forbidden.';
        case 'TOO_MANY_REQUESTS':
          return 'Too many requests. Please try again later.';
        case 'TMDB_RATE_LIMIT':
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  },
};
