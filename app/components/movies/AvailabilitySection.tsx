import { getMovieAvailability, getAllRegions } from '@/app/actions/availability';
// 注意: 当Prisma模型生成后，才能直接从@prisma/client导入
// Note: We'll be able to import directly from @prisma/client after Prisma models are generated
// Using string enums as temporary replacements

// Availability type enum
enum AvailabilityType {
  SUBSCRIPTION = 'SUBSCRIPTION', // Subscription service
  RENT = 'RENT',         // Rent
  BUY = 'BUY',          // Buy
  FREE = 'FREE',         // Free
  CINEMA = 'CINEMA',       // Cinema
  LIBRARY = 'LIBRARY',      // Library
  DVD = 'DVD'           // DVD/Blu-ray
}

// Platform type enum
enum PlatformType {
  STREAMING = 'STREAMING',    // Streaming
  RENTAL = 'RENTAL',       // Rental
  PURCHASE = 'PURCHASE',     // Purchase
  FREE = 'FREE',         // Free
  CINEMA = 'CINEMA',       // Cinema
  PHYSICAL = 'PHYSICAL'     // Physical (e.g., DVD)
}

// Convert enum values to readable text
const availabilityTypeLabels: Record<string, string> = {
  [AvailabilityType.SUBSCRIPTION]: 'Subscription',
  [AvailabilityType.RENT]: 'Rent',
  [AvailabilityType.BUY]: 'Buy',
  [AvailabilityType.FREE]: 'Free',
  [AvailabilityType.CINEMA]: 'Cinema',
  [AvailabilityType.LIBRARY]: 'Library',
  [AvailabilityType.DVD]: 'DVD/Blu-ray',
};

const platformTypeLabels: Record<string, string> = {
  [PlatformType.STREAMING]: 'Streaming',
  [PlatformType.RENTAL]: 'Rental',
  [PlatformType.PURCHASE]: 'Purchase',
  [PlatformType.FREE]: 'Free',
  [PlatformType.CINEMA]: 'Cinema',
  [PlatformType.PHYSICAL]: 'Physical Media',
};

// Get readable date format
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
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
  // Get region list and movie availability information
  const regions = await getAllRegions();
  const { availabilities, lastUpdated } = await getMovieAvailability(movieId, selectedRegionCode);

  // If no availability data, show a message
  if (availabilities.length === 0) {
    return (
      <div className="mt-6 bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Watch Options</h2>
        <div className="text-gray-500 text-center py-6">
          {selectedRegionCode 
            ? `No viewing information found for the selected region.` 
            : `No viewing information available at this time. Please check back later.`}
        </div>
      </div>
    );
  }

  // Group by region for display
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
      <h2 className="text-lg font-semibold mb-4">Watch Options</h2>
      
      {/* Last updated time */}
      {lastUpdated && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {formatDate(lastUpdated)}
        </p>
      )}
      
      {/* Region selector will be implemented in another component */}
      
      {/* Availability information display */}
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
                      {/* Platform Logo */}
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
                    
                    {/* Watch link button */}
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Watch Now
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