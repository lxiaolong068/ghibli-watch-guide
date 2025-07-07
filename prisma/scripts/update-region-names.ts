import { PrismaClient } from '../generated/client';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// Region data with English names
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
  // Add more regions as needed
];

async function updateRegionNames() {
  console.log('Starting region name update...');

  try {
    // Update region names
    console.log('Updating region names to English...');
    for (const region of regions) {
      await prisma.region.update({
        where: { code: region.code },
        data: { name: region.name },
      });
      console.log(`Updated ${region.code} to ${region.name}`);
    }

    console.log('Region name update completed!');
  } catch (error) {
    console.error('Error updating region names:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the update function
updateRegionNames()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 