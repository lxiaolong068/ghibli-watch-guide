/**
 * 标签分类体系配置
 * 定义完整的电影标签分类和预设标签
 */

import { TagCategory } from '@/app/types';

// 标签分类定义
export interface TagCategoryConfig {
  key: TagCategory;
  name: string;
  nameJa: string;
  nameZh: string;
  description: string;
  color: string;
  icon: string;
}

// 预设标签定义
export interface PresetTag {
  name: string;
  nameJa: string;
  nameZh: string;
  description: string;
  category: TagCategory;
  color: string;
  priority: number; // 1-5，数字越小优先级越高
}

// 标签分类配置
export const TAG_CATEGORIES: TagCategoryConfig[] = [
  {
    key: TagCategory.THEME,
    name: 'Theme',
    nameJa: 'テーマ',
    nameZh: '主题',
    description: '电影的核心主题和思想内容',
    color: '#10B981',
    icon: '🎭'
  },
  {
    key: TagCategory.GENRE,
    name: 'Genre',
    nameJa: 'ジャンル',
    nameZh: '类型',
    description: '电影的类型分类',
    color: '#8B5CF6',
    icon: '🎬'
  },
  {
    key: TagCategory.MOOD,
    name: 'Mood',
    nameJa: '雰囲気',
    nameZh: '情感',
    description: '电影带给观众的情感体验',
    color: '#F59E0B',
    icon: '💝'
  },
  {
    key: TagCategory.AUDIENCE,
    name: 'Audience',
    nameJa: '対象年齢',
    nameZh: '受众',
    description: '适合的观众群体',
    color: '#06B6D4',
    icon: '👥'
  },
  {
    key: TagCategory.QUALITY,
    name: 'Quality',
    nameJa: '品質',
    nameZh: '品质',
    description: '电影的品质和成就',
    color: '#EF4444',
    icon: '🏆'
  },
  {
    key: TagCategory.STYLE,
    name: 'Style',
    nameJa: 'スタイル',
    nameZh: '风格',
    description: '电影的视觉和艺术风格',
    color: '#EC4899',
    icon: '🎨'
  },
  {
    key: TagCategory.SETTING,
    name: 'Setting',
    nameJa: '設定',
    nameZh: '背景',
    description: '电影的时代和地点背景',
    color: '#6366F1',
    icon: '🌍'
  },
  {
    key: TagCategory.CHARACTER,
    name: 'Character',
    nameJa: 'キャラクター',
    nameZh: '角色',
    description: '电影中的角色特色',
    color: '#84CC16',
    icon: '👤'
  }
];

// 预设标签数据
export const PRESET_TAGS: PresetTag[] = [
  // 主题标签 (Theme)
  {
    name: 'Environmental Protection',
    nameJa: '環境保護',
    nameZh: '环保主题',
    description: '关注环境保护和自然的电影',
    category: TagCategory.THEME,
    color: '#10B981',
    priority: 1
  },
  {
    name: 'Coming of Age',
    nameJa: '成長物語',
    nameZh: '成长故事',
    description: '描述角色成长历程的电影',
    category: TagCategory.THEME,
    color: '#F59E0B',
    priority: 1
  },
  {
    name: 'Love Story',
    nameJa: 'ラブストーリー',
    nameZh: '爱情故事',
    description: '浪漫的爱情故事',
    category: TagCategory.THEME,
    color: '#EC4899',
    priority: 2
  },
  {
    name: 'Family Bonds',
    nameJa: '家族の絆',
    nameZh: '家庭温情',
    description: '温馨的家庭故事',
    category: TagCategory.THEME,
    color: '#EF4444',
    priority: 1
  },
  {
    name: 'Anti-War',
    nameJa: '反戦',
    nameZh: '反战主题',
    description: '反映战争残酷性的作品',
    category: TagCategory.THEME,
    color: '#6B7280',
    priority: 3
  },
  {
    name: 'Friendship',
    nameJa: '友情',
    nameZh: '友情',
    description: '友谊和伙伴关系的故事',
    category: TagCategory.THEME,
    color: '#06B6D4',
    priority: 2
  },
  {
    name: 'Self-Discovery',
    nameJa: '自己発見',
    nameZh: '自我发现',
    description: '探索自我身份和价值的故事',
    category: TagCategory.THEME,
    color: '#8B5CF6',
    priority: 2
  },

  // 类型标签 (Genre)
  {
    name: 'Fantasy Adventure',
    nameJa: 'ファンタジー冒険',
    nameZh: '奇幻冒险',
    description: '充满奇幻元素的冒险故事',
    category: TagCategory.GENRE,
    color: '#8B5CF6',
    priority: 1
  },
  {
    name: 'Drama',
    nameJa: 'ドラマ',
    nameZh: '剧情',
    description: '以情节和角色发展为主的剧情片',
    category: TagCategory.GENRE,
    color: '#6366F1',
    priority: 1
  },
  {
    name: 'Animation',
    nameJa: 'アニメーション',
    nameZh: '动画',
    description: '动画电影',
    category: TagCategory.GENRE,
    color: '#F59E0B',
    priority: 1
  },
  {
    name: 'Musical',
    nameJa: 'ミュージカル',
    nameZh: '音乐剧',
    description: '包含音乐和歌曲的电影',
    category: TagCategory.GENRE,
    color: '#EC4899',
    priority: 4
  },

  // 情感标签 (Mood)
  {
    name: 'Heartwarming',
    nameJa: '心温まる',
    nameZh: '温馨治愈',
    description: '能够治愈心灵的温馨作品',
    category: TagCategory.MOOD,
    color: '#10B981',
    priority: 1
  },
  {
    name: 'Deeply Moving',
    nameJa: '感動的',
    nameZh: '感人至深',
    description: '令人感动落泪的作品',
    category: TagCategory.MOOD,
    color: '#F59E0B',
    priority: 1
  },
  {
    name: 'Light-hearted',
    nameJa: '楽しい',
    nameZh: '轻松愉快',
    description: '轻松愉快的娱乐作品',
    category: TagCategory.MOOD,
    color: '#06B6D4',
    priority: 2
  },
  {
    name: 'Thought-provoking',
    nameJa: '考えさせる',
    nameZh: '深刻思考',
    description: '引人深思的作品',
    category: TagCategory.MOOD,
    color: '#6366F1',
    priority: 2
  },
  {
    name: 'Nostalgic',
    nameJa: '懐かしい',
    nameZh: '怀旧',
    description: '唤起怀旧情感的作品',
    category: TagCategory.MOOD,
    color: '#84CC16',
    priority: 3
  },

  // 受众标签 (Audience)
  {
    name: 'All Ages',
    nameJa: '全年齢',
    nameZh: '全年龄',
    description: '适合所有年龄观看',
    category: TagCategory.AUDIENCE,
    color: '#10B981',
    priority: 1
  },
  {
    name: 'Family Friendly',
    nameJa: 'ファミリー向け',
    nameZh: '家庭观影',
    description: '适合全家一起观看',
    category: TagCategory.AUDIENCE,
    color: '#F59E0B',
    priority: 1
  },
  {
    name: 'Children Friendly',
    nameJa: '子供向け',
    nameZh: '儿童友好',
    description: '特别适合儿童观看',
    category: TagCategory.AUDIENCE,
    color: '#06B6D4',
    priority: 2
  },
  {
    name: 'Adult Oriented',
    nameJa: '大人向け',
    nameZh: '成人向',
    description: '更适合成人观看',
    category: TagCategory.AUDIENCE,
    color: '#EF4444',
    priority: 3
  },

  // 品质标签 (Quality)
  {
    name: 'Masterpiece',
    nameJa: '傑作',
    nameZh: '经典之作',
    description: '公认的经典作品',
    category: TagCategory.QUALITY,
    color: '#F59E0B',
    priority: 1
  },
  {
    name: 'Award Winner',
    nameJa: '受賞作品',
    nameZh: '获奖作品',
    description: '获得重要奖项的作品',
    category: TagCategory.QUALITY,
    color: '#8B5CF6',
    priority: 1
  },
  {
    name: 'Box Office Hit',
    nameJa: 'ヒット作品',
    nameZh: '票房佳作',
    description: '票房表现优秀的作品',
    category: TagCategory.QUALITY,
    color: '#059669',
    priority: 2
  },
  {
    name: 'Critically Acclaimed',
    nameJa: '高評価',
    nameZh: '口碑佳作',
    description: '口碑极佳的作品',
    category: TagCategory.QUALITY,
    color: '#DC2626',
    priority: 2
  },

  // 风格标签 (Style)
  {
    name: 'Hand-drawn Animation',
    nameJa: '手描きアニメ',
    nameZh: '手绘动画',
    description: '传统手绘动画风格',
    category: TagCategory.STYLE,
    color: '#EC4899',
    priority: 1
  },
  {
    name: 'Detailed Art',
    nameJa: '細密な絵',
    nameZh: '精美画面',
    description: '画面精美细致',
    category: TagCategory.STYLE,
    color: '#8B5CF6',
    priority: 2
  },
  {
    name: 'Dreamlike',
    nameJa: '夢のような',
    nameZh: '梦幻风格',
    description: '梦幻般的视觉风格',
    category: TagCategory.STYLE,
    color: '#06B6D4',
    priority: 3
  },

  // 背景标签 (Setting)
  {
    name: 'Rural Life',
    nameJa: '田舎暮らし',
    nameZh: '乡村生活',
    description: '以乡村为背景的故事',
    category: TagCategory.SETTING,
    color: '#84CC16',
    priority: 2
  },
  {
    name: 'Urban Life',
    nameJa: '都市生活',
    nameZh: '都市生活',
    description: '以城市为背景的故事',
    category: TagCategory.SETTING,
    color: '#6366F1',
    priority: 3
  },
  {
    name: 'Historical Setting',
    nameJa: '歴史的背景',
    nameZh: '历史背景',
    description: '历史时期背景的故事',
    category: TagCategory.SETTING,
    color: '#92400E',
    priority: 3
  },
  {
    name: 'Magical World',
    nameJa: '魔法世界',
    nameZh: '魔法世界',
    description: '魔法和超自然世界',
    category: TagCategory.SETTING,
    color: '#8B5CF6',
    priority: 2
  },

  // 角色标签 (Character)
  {
    name: 'Strong Female Lead',
    nameJa: '強い女性主人公',
    nameZh: '强女性主角',
    description: '以坚强女性为主角',
    category: TagCategory.CHARACTER,
    color: '#EC4899',
    priority: 1
  },
  {
    name: 'Animal Companions',
    nameJa: '動物の仲間',
    nameZh: '动物伙伴',
    description: '有动物伙伴的故事',
    category: TagCategory.CHARACTER,
    color: '#10B981',
    priority: 2
  },
  {
    name: 'Child Protagonist',
    nameJa: '子供主人公',
    nameZh: '儿童主角',
    description: '以儿童为主角',
    category: TagCategory.CHARACTER,
    color: '#F59E0B',
    priority: 2
  },
  {
    name: 'Elderly Characters',
    nameJa: '高齢者キャラクター',
    nameZh: '老年角色',
    description: '重要的老年角色',
    category: TagCategory.CHARACTER,
    color: '#6B7280',
    priority: 4
  }
];

// 获取分类配置的辅助函数
export function getTagCategoryConfig(category: TagCategory): TagCategoryConfig | undefined {
  return TAG_CATEGORIES.find(config => config.key === category);
}

// 获取分类的预设标签
export function getPresetTagsByCategory(category: TagCategory): PresetTag[] {
  return PRESET_TAGS.filter(tag => tag.category === category)
    .sort((a, b) => a.priority - b.priority);
}

// 获取所有分类的标签数量
export function getTagCountByCategory(): Record<TagCategory, number> {
  const counts = {} as Record<TagCategory, number>;
  
  Object.values(TagCategory).forEach(category => {
    counts[category] = PRESET_TAGS.filter(tag => tag.category === category).length;
  });
  
  return counts;
}
