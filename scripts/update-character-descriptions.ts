#!/usr/bin/env tsx
/**
 * Update character descriptions from Chinese to English
 */

import { PrismaClient } from '../prisma/generated/client';

const prisma = new PrismaClient();

// English descriptions for characters
const CHARACTER_DESCRIPTIONS: Record<string, string> = {
  "Chihiro Ogino": "A 10-year-old girl who is brave and kind, growing and saving her parents in the spirit world",
  "Haku": "A mysterious boy who is actually the river spirit of Kohaku River, helping Chihiro survive in the spirit world",
  "No-Face": "A mysterious spirit who longs to be accepted and understood, symbolizing the loneliness of modern society",
  "Yubaba": "The greedy but principled owner of the bathhouse, Chihiro's employer",
  "Lin": "A bathhouse worker who becomes Chihiro's friend and mentor, actually a white weasel spirit",
  "Totoro": "The guardian of the forest, a gentle giant spirit that only pure-hearted children can see",
  "Satsuki Kusakabe": "A responsible 10-year-old older sister who takes care of her younger sister and sick mother",
  "Mei Kusakabe": "A lively 4-year-old younger sister who is the first to discover Totoro",
  "Tatsuo Kusakabe": "The father, a university professor who understands and supports his daughters' imagination",
  "Sophie Hatter": "The eldest daughter of a hat shop who discovers her inner strength after being turned into an old woman",
  "Howl": "A handsome wizard who owns a moving castle, fragile inside but kind-hearted",
  "Calcifer": "A fire demon who is Howl's heart and provides power for the castle",
  "Markl": "Howl's apprentice, a smart little boy",
  "Seita Yokokawa": "A 14-year-old brother who tries to protect his sister during the war, eventually dying of malnutrition",
  "Setsuko Yokokawa": "A 4-year-old sister who is innocent and lovely, spending difficult wartime under her brother's protection"
};

async function updateCharacterDescriptions() {
  try {
    console.log('Starting character description updates...');
    
    for (const [name, description] of Object.entries(CHARACTER_DESCRIPTIONS)) {
      const result = await prisma.character.updateMany({
        where: { name },
        data: { description }
      });
      
      if (result.count > 0) {
        console.log(`Updated description for: ${name}`);
      } else {
        console.log(`Character not found: ${name}`);
      }
    }
    
    console.log('Character description updates completed!');
  } catch (error) {
    console.error('Error updating character descriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  updateCharacterDescriptions();
}

export { updateCharacterDescriptions };