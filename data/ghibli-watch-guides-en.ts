// Studio Ghibli Watch Guides (English Version)
// For Phase 3 content enrichment

export interface WatchGuide {
  title: string;
  description: string;
  guideType: 'CHRONOLOGICAL' | 'BEGINNER' | 'THEMATIC' | 'FAMILY';
  content: string;
  movies: WatchGuideMovie[];
  tags: string[];
  isPublished: boolean;
  publishedAt: Date;
}

export interface WatchGuideMovie {
  tmdbId: number;
  order: number;
  reason: string;
  notes?: string;
}

export const GHIBLI_WATCH_GUIDES_EN: WatchGuide[] = [
  {
    title: "Studio Ghibli Chronological Viewing Guide",
    description: "Watch Studio Ghibli's classic works in chronological order of production to experience the evolution of the studio's artistic style.",
    guideType: "CHRONOLOGICAL",
    content: `# Studio Ghibli Chronological Viewing Guide

Watching Ghibli films in chronological order allows you to clearly see the evolution of the studio's artistic style and thematic expression. From early environmental themes to later deep explorations of humanity, each work is a mark of its era.

## Viewing Recommendations

**Phase 1: Foundation Works (1984-1989)**
The works of this period established Ghibli's basic style and thematic direction, particularly Miyazaki's focus on environmental and anti-war themes.

**Phase 2: Golden Era (1990-2001)**
The studio entered its creative golden age, with works reaching peaks in both artistic and commercial success.

**Phase 3: Mature Period (2002-2014)**
Works became more diverse, with themes explored in greater depth and complexity.

## Viewing Experience Enhancement Tips

- Pay attention to the evolution of animation techniques
- Notice recurring themes and motifs
- Observe changes in character design styles
- Consider the historical context of each film's production`,
    movies: [
      {
        tmdbId: 2034,
        order: 1,
        reason: "Miyazaki's first Ghibli film, establishing the studio's artistic foundation"
      },
      {
        tmdbId: 12477,
        order: 2,
        reason: "Takahata's anti-war masterpiece, showcasing the studio's thematic diversity"
      },
      {
        tmdbId: 10515,
        order: 3,
        reason: "The most iconic Ghibli work, perfecting the studio's signature style"
      },
      {
        tmdbId: 10681,
        order: 4,
        reason: "Coming-of-age story showcasing Miyazaki's storytelling maturity"
      }
    ],
    tags: ["Chronological", "Evolution", "History", "Complete"],
    isPublished: true,
    publishedAt: new Date('2024-02-01')
  },
  {
    title: "Beginner's Guide to Studio Ghibli",
    description: "Designed for first-time Ghibli viewers, starting with the most representative and accessible works, gradually deepening the experience.",
    guideType: "BEGINNER",
    content: `# Beginner's Guide to Studio Ghibli

If you're experiencing Ghibli works for the first time, this guide will help you start with the most accessible and representative films, gradually discovering the magic of Ghibli animation.

## Entry Principles

1. **Start with light-hearted works**: Avoid overly heavy themes initially
2. **Choose classic masterpieces**: Ensure you experience Ghibli's essence
3. **Progressive approach**: From simple story structures to complex thematic expressions
4. **Diverse experience**: Cover different directors and film types

## Viewing Recommendations

**Step 1: Feel the Magic**
Begin with the most characteristically Ghibli heartwarming works to establish basic understanding of the studio's style.

**Step 2: Experience Classics**
Watch internationally acclaimed representative works to understand Ghibli's artistic achievements.

**Step 3: Deep Exploration**
Engage with more complex themes and profound content to fully understand Ghibli's creative philosophy.

## Post-Viewing Suggestions

- Rewatch favorite films; you'll discover something new each time
- Pay attention to visual details and music - these are the essence of Ghibli works
- Learn about the cultural background behind the works for deeper understanding`,
    movies: [
      {
        tmdbId: 10515,
        order: 1,
        reason: "Most heartwarming and accessible work, perfectly showcasing Ghibli's charm",
        notes: "Perfect for family viewing, establishes first impression of Ghibli"
      },
      {
        tmdbId: 10681,
        order: 2,
        reason: "Clear coming-of-age theme, beautiful visuals, simple and understandable story"
      },
      {
        tmdbId: 129,
        order: 3,
        reason: "Oscar-winning work, most internationally recognized Ghibli film"
      },
      {
        tmdbId: 4935,
        order: 4,
        reason: "Romantic love story, showcasing another side of Miyazaki"
      }
    ],
    tags: ["Beginner", "Introduction", "Recommended", "Progressive"],
    isPublished: true,
    publishedAt: new Date('2024-02-05')
  }
];
