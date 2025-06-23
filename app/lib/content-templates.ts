// 内容模板和数据结构定义

export interface MovieReviewTemplate {
  title: string;
  content: string;
  sections: {
    plot_summary: string;
    visual_style: string;
    themes: string;
    characters: string;
    music: string;
    cultural_impact: string;
    recommendation: string;
  };
  rating: number;
  pros: string[];
  cons: string[];
  target_audience: string[];
  similar_movies: string[];
}

export interface WatchGuideTemplate {
  title: string;
  description: string;
  introduction: string;
  movies: {
    movieId: string;
    order: number;
    reason: string;
    notes: string;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    emotional_intensity: 'light' | 'moderate' | 'intense';
    themes: string[];
  }[];
  conclusion: string;
  additional_tips: string[];
}

export interface CharacterProfileTemplate {
  name: string;
  nameJa?: string;
  nameZh?: string;
  description: string;
  personality_traits: string[];
  character_arc: string;
  relationships: {
    character: string;
    relationship_type: string;
    description: string;
  }[];
  memorable_quotes: string[];
  symbolism: string;
  voice_actors: {
    language: string;
    actor: string;
    notes?: string;
  }[];
}

export interface BehindScenesTemplate {
  title: string;
  category: 'production' | 'animation' | 'music' | 'voice_acting' | 'inspiration';
  content: string;
  fun_facts: string[];
  production_timeline: {
    date: string;
    milestone: string;
    description: string;
  }[];
  interviews: {
    person: string;
    role: string;
    quote: string;
    context: string;
  }[];
  technical_details: {
    aspect: string;
    description: string;
  }[];
}

// 内容生成器类
export class ContentGenerator {
  // 生成电影评论模板
  static generateMovieReview(movieData: any): MovieReviewTemplate {
    return {
      title: `深度解析：${movieData.titleZh || movieData.titleEn}`,
      content: '',
      sections: {
        plot_summary: `《${movieData.titleZh || movieData.titleEn}》讲述了...`,
        visual_style: '宫崎骏一贯的细腻画风在本片中...',
        themes: '本片探讨了成长、环保、人性等深刻主题...',
        characters: '主人公的成长历程体现了...',
        music: '久石让的配乐为影片增添了...',
        cultural_impact: '本片对日本动画产业的影响...',
        recommendation: '推荐给喜欢深度思考的观众...'
      },
      rating: 0,
      pros: [],
      cons: [],
      target_audience: [],
      similar_movies: []
    };
  }

  // 生成观影指南模板
  static generateWatchGuide(guideType: string): WatchGuideTemplate {
    const templates = {
      chronological: {
        title: '吉卜力工作室电影时间线观影指南',
        description: '按照制作时间顺序了解吉卜力的发展历程',
        introduction: '吉卜力工作室自1985年成立以来，创作了众多经典动画电影...'
      },
      thematic: {
        title: '吉卜力电影主题分类观影指南',
        description: '按照不同主题分类，深入理解吉卜力的创作理念',
        introduction: '吉卜力的作品涵盖了成长、环保、战争、爱情等多个主题...'
      },
      beginner: {
        title: '吉卜力新手入门观影指南',
        description: '适合初次接触吉卜力作品的观众',
        introduction: '如果你是第一次观看吉卜力电影，建议从这些作品开始...'
      }
    };

    const template = templates[guideType as keyof typeof templates] || templates.beginner;
    
    return {
      ...template,
      movies: [],
      conclusion: '',
      additional_tips: []
    };
  }

  // 生成角色档案模板
  static generateCharacterProfile(characterName: string): CharacterProfileTemplate {
    return {
      name: characterName,
      description: '',
      personality_traits: [],
      character_arc: '',
      relationships: [],
      memorable_quotes: [],
      symbolism: '',
      voice_actors: []
    };
  }

  // 生成幕后故事模板
  static generateBehindScenes(movieTitle: string, category: string): BehindScenesTemplate {
    return {
      title: `《${movieTitle}》制作幕后`,
      category: category as any,
      content: '',
      fun_facts: [],
      production_timeline: [],
      interviews: [],
      technical_details: []
    };
  }
}

// 内容验证器
export class ContentValidator {
  static validateMovieReview(review: MovieReviewTemplate): string[] {
    const errors: string[] = [];
    
    if (!review.title || review.title.length < 10) {
      errors.push('标题长度至少需要10个字符');
    }
    
    if (!review.content || review.content.length < 100) {
      errors.push('内容长度至少需要100个字符');
    }
    
    if (review.rating < 1 || review.rating > 10) {
      errors.push('评分必须在1-10之间');
    }
    
    return errors;
  }

  static validateWatchGuide(guide: WatchGuideTemplate): string[] {
    const errors: string[] = [];
    
    if (!guide.title || guide.title.length < 5) {
      errors.push('指南标题长度至少需要5个字符');
    }
    
    if (!guide.movies || guide.movies.length < 3) {
      errors.push('观影指南至少需要包含3部电影');
    }
    
    return errors;
  }
}

// SEO优化内容生成器
export class SEOContentGenerator {
  static generateMetaDescription(movieData: any): string {
    const title = movieData.titleZh || movieData.titleEn;
    const year = movieData.year;
    const director = movieData.director || '宫崎骏';
    
    return `观看《${title}》(${year}) - ${director}执导的吉卜力经典动画。获取最新流媒体平台信息，包括Netflix、Disney+等观看方式。`;
  }

  static generateStructuredData(movieData: any) {
    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": movieData.titleEn,
      "alternateName": [movieData.titleJa, movieData.titleZh].filter(Boolean),
      "description": movieData.synopsis,
      "datePublished": `${movieData.year}-01-01`,
      "director": {
        "@type": "Person",
        "name": movieData.director || "宫崎骏"
      },
      "productionCompany": {
        "@type": "Organization",
        "name": "Studio Ghibli"
      },
      "genre": ["Animation", "Family", "Fantasy"],
      "image": movieData.posterUrl,
      "aggregateRating": movieData.voteAverage ? {
        "@type": "AggregateRating",
        "ratingValue": movieData.voteAverage,
        "ratingCount": 1000,
        "bestRating": 10,
        "worstRating": 1
      } : undefined
    };
  }

  static generateBreadcrumbData(movieData: any) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "电影列表",
          "item": "/movies"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": movieData.titleZh || movieData.titleEn,
          "item": `/movies/${movieData.id}`
        }
      ]
    };
  }
}

// 多语言内容管理器
export class MultiLanguageContentManager {
  private static readonly SUPPORTED_LANGUAGES = ['en', 'ja', 'zh', 'ko', 'fr', 'es'];

  static getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  static generateTranslationTemplate(content: any, targetLanguage: string) {
    return {
      originalLanguage: 'en',
      targetLanguage,
      content: {
        title: content.title || '',
        description: content.description || '',
        sections: content.sections || {},
      },
      translationStatus: 'pending',
      translatedAt: null,
      translator: null,
      reviewStatus: 'pending'
    };
  }

  static validateTranslation(original: any, translated: any): string[] {
    const errors: string[] = [];
    
    if (!translated.title && original.title) {
      errors.push('标题翻译缺失');
    }
    
    if (!translated.description && original.description) {
      errors.push('描述翻译缺失');
    }
    
    return errors;
  }
}
