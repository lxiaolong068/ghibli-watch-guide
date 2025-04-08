import { PrismaClient, Movie, Platform, Region } from '../../app/generated/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// 基础数据
const regions = [
  { code: 'US', name: '美国' },
  { code: 'CA', name: '加拿大' },
  { code: 'JP', name: '日本' },
  { code: 'GB', name: '英国' },
  { code: 'EU', name: '欧洲' },
  { code: 'AU', name: '澳大利亚' },
  { code: 'NZ', name: '新西兰' },
] as const;

const platforms = [
  { name: 'Max', website: 'https://www.max.com', type: 'STREAMING' as const },
  { name: 'Netflix', website: 'https://www.netflix.com', type: 'STREAMING' as const },
  { name: 'Amazon Prime Video', website: 'https://www.amazon.com/primevideo', type: 'STREAMING' as const },
  { name: 'Apple TV', website: 'https://tv.apple.com', type: 'STREAMING' as const },
  { name: 'YouTube', website: 'https://www.youtube.com', type: 'STREAMING' as const },
  { name: 'Vudu', website: 'https://www.vudu.com', type: 'STREAMING' as const },
  { name: 'GKIDS', website: 'https://gkids.com/films', type: 'CINEMA' as const },
] as const;

const movies = [
  {
    titleEn: 'Spirited Away',
    titleJa: '千と千尋の神隠し',
    titleZh: '千与千寻',
    year: 2001,
    director: 'Hayao Miyazaki',
    duration: 125,
    synopsis: '千寻和父母一起搬家途中意外进入神灵世界，父母因贪吃变成了猪，为了救出父母，千寻必须在汤屋工作...',
    posterUrl: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    titleEn: 'My Neighbor Totoro',
    titleJa: 'となりのトトロ',
    titleZh: '龙猫',
    year: 1988,
    director: 'Hayao Miyazaki',
    duration: 86,
    synopsis: '小月和小梅与父亲搬到乡下，在那里她们遇见了神奇的龙猫...',
    posterUrl: 'https://image.tmdb.org/t/p/w500/rtGDOeG9LzoerkDGZF9dnVeLppL.jpg',
  },
  {
    titleEn: 'Grave of the Fireflies',
    titleJa: '火垂るの墓',
    titleZh: '萤火虫之墓',
    year: 1988,
    director: 'Isao Takahata',
    duration: 89,
    synopsis: '二战末期，清太和妹妹节子在战火中失去父母，相依为命...',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wcNkHDbyc290hcWk7KXbBZUuXpq.jpg',
  },
] as const;

async function main() {
  console.log('开始数据填充...');

  // 清理现有数据
  await prisma.availability.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.platform.deleteMany();
  await prisma.region.deleteMany();

  console.log('已清理现有数据');

  // 填充地区数据
  const createdRegions = await Promise.all(
    regions.map((region) =>
      prisma.region.create({
        data: region,
      })
    )
  );

  console.log('已创建地区数据');

  // 填充平台数据
  const createdPlatforms = await Promise.all(
    platforms.map((platform) =>
      prisma.platform.create({
        data: platform,
      })
    )
  );

  console.log('已创建平台数据');

  // 填充电影数据
  const createdMovies = await Promise.all(
    movies.map((movie) =>
      prisma.movie.create({
        data: movie,
      })
    )
  );

  console.log('已创建电影数据');

  // 填充可用性数据
  const availabilityData = [
    // 美国地区的数据
    {
      movieId: createdMovies.find((m: Movie) => m.titleEn === 'Spirited Away')!.id,
      platformId: createdPlatforms.find((p: Platform) => p.name === 'Max')!.id,
      regionId: createdRegions.find((r: Region) => r.code === 'US')!.id,
      isSubscription: true,
      isFree: false,
      lastChecked: new Date(),
      priceInfo: { subscription: '$9.99/month' },
    },
    {
      movieId: createdMovies.find((m: Movie) => m.titleEn === 'Grave of the Fireflies')!.id,
      platformId: createdPlatforms.find((p: Platform) => p.name === 'Netflix')!.id,
      regionId: createdRegions.find((r: Region) => r.code === 'US')!.id,
      isSubscription: true,
      isFree: false,
      lastChecked: new Date(),
      priceInfo: { subscription: '$15.49/month' },
    },
    // 欧洲地区的数据
    {
      movieId: createdMovies.find((m: Movie) => m.titleEn === 'Spirited Away')!.id,
      platformId: createdPlatforms.find((p: Platform) => p.name === 'Netflix')!.id,
      regionId: createdRegions.find((r: Region) => r.code === 'EU')!.id,
      isSubscription: true,
      isFree: false,
      lastChecked: new Date(),
      priceInfo: { subscription: '€4.99/month' },
    },
  ];

  await Promise.all(
    availabilityData.map((data) =>
      prisma.availability.create({
        data,
      })
    )
  );

  console.log('已创建可用性数据');
  console.log('数据填充完成！');
}

main()
  .catch((e) => {
    console.error('数据填充出错：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 