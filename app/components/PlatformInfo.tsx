import Image from 'next/image';
import Link from 'next/link';

interface Platform {
  id: string;
  name: string;
  logo?: string;
  type: 'streaming' | 'rental' | 'purchase';
  price?: string;
  url?: string;
}

interface PlatformInfoProps {
  platforms: Platform[];
  region: string;
}

export function PlatformInfo({ platforms, region }: PlatformInfoProps) {
  const streamingPlatforms = platforms.filter(p => p.type === 'streaming');
  const rentalPlatforms = platforms.filter(p => p.type === 'rental');
  const purchasePlatforms = platforms.filter(p => p.type === 'purchase');

  const PlatformCard = ({ platform }: { platform: Platform }) => (
    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {platform.logo && (
        <Image
          src={platform.logo}
          alt={`${platform.name} logo`}
          width={40}
          height={40}
          className="rounded"
        />
      )}
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{platform.name}</h4>
        {platform.price && (
          <p className="text-sm text-gray-600">{platform.price}</p>
        )}
      </div>
      {platform.url && (
        <Link
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
        >
          Watch
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {streamingPlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Streaming Services
          </h3>
          <div className="grid gap-3">
            {streamingPlatforms.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      )}

      {rentalPlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Rental Options
          </h3>
          <div className="grid gap-3">
            {rentalPlatforms.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      )}

      {purchasePlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Purchase Options
          </h3>
          <div className="grid gap-3">
            {purchasePlatforms.map(platform => (
              <PlatformCard key={platform.id} platform={platform} />
            ))}
          </div>
        </div>
      )}

      {platforms.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No viewing information found for {region}.
        </div>
      )}
    </div>
  );
}
