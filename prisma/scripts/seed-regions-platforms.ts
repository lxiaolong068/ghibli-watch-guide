import { PrismaClient, PlatformType } from '@prisma/client';
import path from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// 主要地区数据
const regions = [
  { code: 'US', name: 'United States' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China Mainland' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
];

// 主要平台数据
const platforms = [
  // 流媒体平台
  { 
    name: 'Netflix', 
    website: 'https://www.netflix.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/440px-Netflix_2015_logo.svg.png'
  },
  { 
    name: 'Disney+', 
    website: 'https://www.disneyplus.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/440px-Disney%2B_logo.svg.png'
  },
  { 
    name: 'HBO Max', 
    website: 'https://www.hbomax.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/440px-HBO_Max_Logo.svg.png'
  },
  { 
    name: 'Amazon Prime Video', 
    website: 'https://www.primevideo.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Prime_Video.png/440px-Prime_Video.png'
  },
  { 
    name: 'Hulu', 
    website: 'https://www.hulu.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hulu_Logo.svg/440px-Hulu_Logo.svg.png'
  },
  // 中国流媒体平台
  { 
    name: '哔哩哔哩', 
    website: 'https://www.bilibili.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Bilibili_Logo_Blue.svg/440px-Bilibili_Logo_Blue.svg.png'
  },
  { 
    name: '优酷', 
    website: 'https://www.youku.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/YouKu_Logo.svg/440px-YouKu_Logo.svg.png'
  },
  { 
    name: '腾讯视频', 
    website: 'https://v.qq.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Tencent_Video_Logo.svg/440px-Tencent_Video_Logo.svg.png'
  },
  { 
    name: '爱奇艺', 
    website: 'https://www.iqiyi.com', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/IQIYI_logo.svg/440px-IQIYI_logo.svg.png'
  },
  // 日本流媒体平台
  { 
    name: 'Amazon Prime Video JP', 
    website: 'https://www.amazon.co.jp/primevideo', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Prime_Video.png/440px-Prime_Video.png'
  },
  { 
    name: 'U-NEXT', 
    website: 'https://video.unext.jp', 
    type: PlatformType.STREAMING,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/U-NEXT_logo.svg/440px-U-NEXT_logo.svg.png'
  },
  // 租赁/购买平台
  { 
    name: 'iTunes/Apple TV', 
    website: 'https://www.apple.com/apple-tv-app', 
    type: PlatformType.PURCHASE,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Apple_TV_App_Logo.svg/440px-Apple_TV_App_Logo.svg.png'
  },
  { 
    name: 'Google Play Movies', 
    website: 'https://play.google.com/store/movies', 
    type: PlatformType.PURCHASE,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Google_Play_Movies_%26_TV_icon_%282016%29.svg/440px-Google_Play_Movies_%26_TV_icon_%282016%29.svg.png'
  },
  { 
    name: 'YouTube Movies', 
    website: 'https://www.youtube.com/movies', 
    type: PlatformType.RENTAL,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/440px-YouTube_full-color_icon_%282017%29.svg.png'
  },
  // 免费平台
  { 
    name: 'Kanopy', 
    website: 'https://www.kanopy.com', 
    type: PlatformType.FREE,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Kanopy_logo.svg/440px-Kanopy_logo.svg.png'
  },
  { 
    name: 'Hoopla', 
    website: 'https://www.hoopladigital.com', 
    type: PlatformType.FREE,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Hoopla_Digital_Logo.png/440px-Hoopla_Digital_Logo.png'
  },
  // 实体媒体
  { 
    name: 'GKIDS (物理媒体)', 
    website: 'https://gkids.com/films', 
    type: PlatformType.PHYSICAL,
    logo: 'https://gkids.com/wp-content/uploads/2016/03/gkids_logo.png'
  },
  { 
    name: 'Shout! Factory', 
    website: 'https://www.shoutfactory.com', 
    type: PlatformType.PHYSICAL,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Shout%21_Factory_logo.svg/440px-Shout%21_Factory_logo.svg.png'
  },
];

async function seedRegionsAndPlatforms() {
  console.log('开始填充地区和平台数据...');

  try {
    // 填充地区数据
    console.log('添加地区数据...');
    for (const region of regions) {
      await prisma.region.upsert({
        where: { code: region.code },
        update: { name: region.name },
        create: {
          code: region.code,
          name: region.name,
        },
      });
    }
    console.log(`成功添加 ${regions.length} 个地区`);

    // 填充平台数据
    console.log('添加平台数据...');
    let platformCount = 0;
    for (const platform of platforms) {
      await prisma.platform.upsert({
        where: { 
          // 由于没有唯一标识符，我们创建一个基于名称和网站的组合查询
          id: (await prisma.platform.findFirst({
            where: { 
              name: platform.name,
              website: platform.website
            }
          }))?.id || 'new-platform' 
        },
        update: { 
          name: platform.name,
          website: platform.website,
          type: platform.type,
          logo: platform.logo
        },
        create: {
          name: platform.name,
          website: platform.website,
          type: platform.type,
          logo: platform.logo
        },
      });
      platformCount++;
    }
    console.log(`成功添加 ${platformCount} 个平台`);

    console.log('地区和平台数据填充完成!');
  } catch (error) {
    console.error('填充数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行填充函数
seedRegionsAndPlatforms()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 