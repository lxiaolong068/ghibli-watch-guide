export interface Movie {
  id: string;
  titleEn: string;
  titleJa: string;
  titleZh?: string;
  year: number;
  director: string;
  duration: number;
  synopsis: string;
  posterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  availabilities?: Availability[];
}

export interface Platform {
  id: string;
  name: string;
  website: string;
  type: PlatformType;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
  availabilities?: Availability[];
}

export interface Region {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  availabilities?: Availability[];
}

export interface Availability {
  id: string;
  movieId: string;
  platformId: string;
  regionId: string;
  url?: string;
  priceInfo?: any;
  notes?: string;
  isSubscription: boolean;
  isFree: boolean;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
  movie?: Movie;
  platform?: Platform;
  region?: Region;
}

export enum PlatformType {
  STREAMING = 'STREAMING',
  RENTAL = 'RENTAL',
  PURCHASE = 'PURCHASE',
  FREE = 'FREE',
  CINEMA = 'CINEMA',
  PHYSICAL = 'PHYSICAL',
} 