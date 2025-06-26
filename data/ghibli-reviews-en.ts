// Studio Ghibli Movie Professional Reviews (English Version)
// For Phase 3 content enrichment

export interface MovieReview {
  movieTmdbId: number;
  title: string;
  content: string;
  rating: number; // 1-10
  author: string;
  reviewType: 'PROFESSIONAL' | 'EDITORIAL' | 'ANALYSIS';
  tags: string[];
  publishedAt: Date;
  language: 'zh' | 'en' | 'ja';
}

export const GHIBLI_REVIEWS_EN: MovieReview[] = [
  {
    movieTmdbId: 129,
    title: "Spirited Away: Miyazaki's Coming-of-Age Allegory and Environmental Reflection",
    content: `Spirited Away stands as the pinnacle of Hayao Miyazaki's creative career. This Oscar-winning masterpiece for Best Animated Feature is not merely a story about a little girl's adventure, but a profound coming-of-age allegory.

**Depth of Storytelling**
Chihiro transforms from a spoiled, timid city girl into a brave, kind, and responsible young woman through her trials in the spirit world. This transformation isn't sudden but achieved gradually through a series of specific events and challenges. She learns to work, to care for others, and to face difficulties.

**Environmental Themes**
The spirit world in the film serves as a metaphor for modern industrial civilization. The polluted river spirit, No-Face's greed, and Yubaba's materialism all reflect problems in modern society. Through these symbols, Miyazaki expresses his concerns about environmental destruction and spiritual pollution.

**Visual Artistic Achievement**
The film's visuals are extraordinarily beautiful, with every frame worthy of being appreciated as art. From the fantastical architecture of the spirit world to the design of various spirits, everything embodies a perfect fusion of Japanese traditional culture and modern imagination. The bathhouse design particularly showcases Japanese traditional architectural features while being filled with fantastical elements.

**Musical Emotional Rendering**
Joe Hisaishi's score adds tremendous value to the film, with the theme song "Always With Me" becoming a classic. The perfect harmony between music and visuals creates a unique emotional atmosphere.

**Rich Cultural Content**
The film integrates elements of Japanese Shintoism and Buddhism while also critiquing modern consumerism. This multi-layered cultural approach gives the film deeper meaning and broader audience appeal.

Overall, Spirited Away is an animated film that achieves extremely high standards in artistry, thoughtfulness, and entertainment value. It's not only suitable for children but also serves as a mirror for adults to reflect on modern life.`,
    rating: 10,
    author: "Ghibli Watch Guide Editorial Team",
    reviewType: "PROFESSIONAL",
    tags: ["Coming of age", "Environmental", "Fantasy", "Japanese culture", "Miyazaki"],
    publishedAt: new Date('2024-01-15'),
    language: "en"
  },
  {
    movieTmdbId: 10515,
    title: "My Neighbor Totoro: Warm Guardian of Pure Childhood",
    content: `My Neighbor Totoro is one of Studio Ghibli's most representative works and Miyazaki's most tender tribute to childhood memories. This 1988 work continues to move audiences worldwide.

**Charm of Childhood Perspective**
The film tells the story entirely from children's perspectives, allowing us to rediscover the world's beauty through innocent eyes. Satsuki and Mei's curiosity and imagination about their surroundings remind us of our own childhood wonder.

**Healing Power of Nature**
The countryside setting is not just a backdrop but a character in itself. Ancient trees, clear streams, and vast fields all embody the healing power of nature. Totoro, as a forest spirit, represents humanity's harmonious relationship with nature.

**Family Bonds**
The deep affection between the sisters and their father's patient care create a warm family atmosphere. Even in the face of their mother's illness, the family maintains optimism and mutual support.

**Simple Yet Profound Themes**
While the story appears simple, it explores profound themes about growth, family, nature, and hope. These universal themes transcend cultural boundaries and resonate with audiences of all ages.

**Artistic Excellence**
Miyazaki's hand-drawn animation reaches artistic perfection here. Every detail, from character expressions to natural scenery, is meticulously crafted. Totoro's design has become an iconic image in animation history.

My Neighbor Totoro is not just an excellent animated film but a precious childhood memory. It reminds us to maintain inner innocence, cherish the beauty around us, and believe that warmth and miracles still exist in the world.`,
    rating: 9,
    author: "Ghibli Watch Guide Editorial Team",
    reviewType: "PROFESSIONAL",
    tags: ["Childhood", "Family", "Nature", "Heartwarming", "Classic"],
    publishedAt: new Date('2024-01-20'),
    language: "en"
  }
];
