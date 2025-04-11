import { getMovieAvailability, getAllRegions } from '@/app/actions/availability';
// 注意: 当Prisma模型生成后，才能直接从@prisma/client导入
// 临时使用字符串枚举替代

// 观看可用性类型枚举
enum AvailabilityType {
  SUBSCRIPTION = 'SUBSCRIPTION', // 订阅服务
  RENT = 'RENT',         // 租赁
  BUY = 'BUY',          // 购买
  FREE = 'FREE',         // 免费
  CINEMA = 'CINEMA',       // 电影院放映
  LIBRARY = 'LIBRARY',      // 图书馆借阅
  DVD = 'DVD'           // DVD/蓝光光盘
}

// 平台类型枚举
enum PlatformType {
  STREAMING = 'STREAMING',    // 流媒体
  RENTAL = 'RENTAL',       // 租赁
  PURCHASE = 'PURCHASE',     // 购买
  FREE = 'FREE',         // 免费
  CINEMA = 'CINEMA',       // 电影院
  PHYSICAL = 'PHYSICAL'     // 实体（如DVD）
}

// 将枚举值转换为可读文本
const availabilityTypeLabels: Record<string, string> = {
  [AvailabilityType.SUBSCRIPTION]: '订阅服务',
  [AvailabilityType.RENT]: '租赁',
  [AvailabilityType.BUY]: '购买',
  [AvailabilityType.FREE]: '免费',
  [AvailabilityType.CINEMA]: '影院上映',
  [AvailabilityType.LIBRARY]: '图书馆借阅',
  [AvailabilityType.DVD]: 'DVD/蓝光',
};

const platformTypeLabels: Record<string, string> = {
  [PlatformType.STREAMING]: '流媒体',
  [PlatformType.RENTAL]: '租赁',
  [PlatformType.PURCHASE]: '购买',
  [PlatformType.FREE]: '免费',
  [PlatformType.CINEMA]: '电影院',
  [PlatformType.PHYSICAL]: '实体媒体',
};

// 获取可读的时间展示格式
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface AvailabilitySectionProps {
  movieId: string;
  selectedRegionCode?: string;
}

export async function AvailabilitySection({ movieId, selectedRegionCode }: AvailabilitySectionProps) {
  // 获取地区列表和电影可用性信息
  const regions = await getAllRegions();
  const { availabilities, lastUpdated } = await getMovieAvailability(movieId, selectedRegionCode);

  // 如果没有可用性数据，显示提示信息
  if (availabilities.length === 0) {
    return (
      <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">观看渠道</h2>
        <div className="text-gray-500 text-center py-6">
          {selectedRegionCode 
            ? `没有找到在所选地区的观看信息。` 
            : `暂无观看渠道信息，请稍后再查看。`}
        </div>
      </div>
    );
  }

  // 按地区分组显示
  const groupedByRegion = availabilities.reduce((acc: Record<string, typeof availabilities>, item) => {
    const regionId = item.region.id;
    if (!acc[regionId]) {
      acc[regionId] = [];
    }
    acc[regionId].push(item);
    return acc;
  }, {});

  return (
    <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">观看渠道</h2>
      
      {/* 最后更新时间 */}
      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          最后更新时间: {formatDate(lastUpdated)}
        </p>
      )}
      
      {/* 地区选择器将在另一个组件中实现 */}
      
      {/* 可用性信息展示 */}
      <div className="space-y-6">
        {Object.entries(groupedByRegion).map(([regionId, items]) => {
          const region = items[0].region;
          
          return (
            <div key={regionId} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">{region.name}</h3>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      {/* 平台Logo */}
                      {item.platform.logo && (
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            src={item.platform.logo}
                            alt={item.platform.name}
                            className="h-8 w-auto object-contain"
                          />
                        </div>
                      )}
                      
                      <div>
                        <div className="font-medium">{item.platform.name}</div>
                        <div className="text-sm text-gray-500">
                          {availabilityTypeLabels[item.type] || item.type}
                          {item.price && item.currency && (
                            <span className="ml-2">
                              {item.price} {item.currency}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 观看链接按钮 */}
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        前往观看
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 