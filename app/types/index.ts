export type Movie = {
  id: string;
  titleEn: string;
  titleJa: string;
  year: number;
  director: string;
  duration: number;
  synopsis: string;
  posterUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

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

export type Availability = {
  id: string;
  movieId: string;
  platformId: string;
  regionId: string;
  url?: string;
  priceInfo?: any;
  notes?: string;
  type: 'FREE' | 'SUBSCRIPTION' | 'RENTAL' | 'PURCHASE';
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
  platform: {
    name: string;
    logo?: string;
  };
  region: {
    code: string;
    name: string;
  };
};

export enum PlatformType {
  STREAMING = 'STREAMING',
  RENTAL = 'RENTAL',
  PURCHASE = 'PURCHASE',
  FREE = 'FREE',
  CINEMA = 'CINEMA',
  PHYSICAL = 'PHYSICAL',
} 