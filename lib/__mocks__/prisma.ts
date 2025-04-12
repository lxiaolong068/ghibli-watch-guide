// lib/__mocks__/prisma.ts
import { vi } from 'vitest';

// Export individual mocks directly so they can be imported if needed elsewhere
export const mockMovieFindFirst = vi.fn();
export const mockMovieFindUnique = vi.fn();
export const mockDisconnect = vi.fn();

export const prisma = {
  movie: {
    findFirst: mockMovieFindFirst,
    findUnique: mockMovieFindUnique,
  },
  $disconnect: mockDisconnect,
};
