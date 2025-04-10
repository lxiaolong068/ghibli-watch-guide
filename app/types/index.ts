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

// 新增 PriceInfo 接口
interface PriceInfo {
  price?: number;
  currency?: string; // 例如 'USD', 'JPY', 'EUR'
  format?: 'HD' | 'SD' | '4K'; // 租赁/购买的格式
  // 可以根据需要添加更多字段，例如租赁时长
}

export type Availability = {
  id: string;
  movieId: string;
  platformId: string;
  regionId: string;
  url?: string;
  priceInfo?: PriceInfo | null; // 使用 PriceInfo 接口替换 any
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