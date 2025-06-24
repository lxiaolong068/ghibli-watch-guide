// 完整的吉卜力工作室电影列表和角色信息
// 用于第三阶段内容充实

export interface GhibliMovie {
  tmdbId: number;
  titleEn: string;
  titleJa: string;
  titleZh: string;
  year: number;
  director: string;
  duration: number;
  synopsis: string;
  posterUrl?: string;
  backdropUrl?: string;
  mainCharacters: Character[];
  themes: string[];
  significance: string;
}

export interface Character {
  name: string;
  nameJa: string;
  nameZh: string;
  description: string;
  isMainCharacter: boolean;
  voiceActorJa?: string;
  voiceActorEn?: string;
  imageDescription?: string;
}

export const GHIBLI_MOVIES: GhibliMovie[] = [
  {
    tmdbId: 129,
    titleEn: "Spirited Away",
    titleJa: "千と千尋の神隠し",
    titleZh: "千与千寻",
    year: 2001,
    director: "宫崎骏",
    duration: 125,
    synopsis: "10岁的千寻在搬家途中误入神灵世界，为了拯救被变成猪的父母，她必须在汤婆婆的澡堂工作，并找回自己的名字。",
    themes: ["成长", "勇气", "环保", "传统文化"],
    significance: "获得奥斯卡最佳动画长片奖，是宫崎骏的代表作之一",
    mainCharacters: [
      {
        name: "Chihiro Ogino",
        nameJa: "荻野千尋",
        nameZh: "荻野千寻",
        description: "10岁的小女孩，勇敢善良，在神灵世界中成长并拯救了父母",
        isMainCharacter: true,
        voiceActorJa: "柊瑠美",
        voiceActorEn: "Daveigh Chase"
      },
      {
        name: "Haku",
        nameJa: "ハク",
        nameZh: "白龙",
        description: "神秘的少年，实际上是琥珀川的河神，帮助千寻在神灵世界生存",
        isMainCharacter: true,
        voiceActorJa: "入野自由",
        voiceActorEn: "Jason Marsden"
      },
      {
        name: "No-Face",
        nameJa: "カオナシ",
        nameZh: "无脸男",
        description: "神秘的精灵，渴望被接纳和理解，象征着现代社会的孤独",
        isMainCharacter: true,
        voiceActorJa: "中村彰男"
      },
      {
        name: "Yubaba",
        nameJa: "湯婆婆",
        nameZh: "汤婆婆",
        description: "澡堂的老板娘，贪婪但有自己的原则，千寻的雇主",
        isMainCharacter: true,
        voiceActorJa: "夏木マリ",
        voiceActorEn: "Suzanne Pleshette"
      },
      {
        name: "Lin",
        nameJa: "リン",
        nameZh: "小玲",
        description: "澡堂的工作人员，千寻的朋友和导师，实际上是白鼬精",
        isMainCharacter: false,
        voiceActorJa: "玉井夕海",
        voiceActorEn: "Susan Egan"
      }
    ]
  },
  {
    tmdbId: 10515,
    titleEn: "My Neighbor Totoro",
    titleJa: "となりのトトロ",
    titleZh: "龙猫",
    year: 1988,
    director: "宫崎骏",
    duration: 86,
    synopsis: "两个小女孩搬到乡下，在那里遇到了森林精灵龙猫，展开了一段温馨的冒险。",
    themes: ["家庭", "自然", "童真", "希望"],
    significance: "吉卜力工作室的标志性作品，龙猫成为工作室的吉祥物",
    mainCharacters: [
      {
        name: "Satsuki Kusakabe",
        nameJa: "草壁サツキ",
        nameZh: "草壁皋月",
        description: "10岁的姐姐，懂事负责，照顾妹妹和生病的母亲",
        isMainCharacter: true,
        voiceActorJa: "日高のり子",
        voiceActorEn: "Dakota Fanning"
      },
      {
        name: "Mei Kusakabe",
        nameJa: "草壁メイ",
        nameZh: "草壁梅",
        description: "4岁的妹妹，天真活泼，第一个发现龙猫的人",
        isMainCharacter: true,
        voiceActorJa: "坂本千夏",
        voiceActorEn: "Elle Fanning"
      },
      {
        name: "Totoro",
        nameJa: "トトロ",
        nameZh: "龙猫",
        description: "森林的守护神，巨大温和的精灵，只有纯真的孩子才能看见",
        isMainCharacter: true,
        voiceActorJa: "高木均",
        voiceActorEn: "Frank Welker"
      },
      {
        name: "Tatsuo Kusakabe",
        nameJa: "草壁タツオ",
        nameZh: "草壁达郎",
        description: "父亲，大学教授，理解并支持女儿们的想象力",
        isMainCharacter: false,
        voiceActorJa: "糸井重里",
        voiceActorEn: "Tim Daly"
      }
    ]
  },
  {
    tmdbId: 12477,
    titleEn: "Grave of the Fireflies",
    titleJa: "火垂るの墓",
    titleZh: "萤火虫之墓",
    year: 1988,
    director: "高畑勋",
    duration: 89,
    synopsis: "二战末期，14岁的清太和4岁的妹妹节子在战争中失去父母，艰难求生的悲伤故事。",
    themes: ["战争", "家庭", "生存", "悲剧"],
    significance: "反战题材的经典作品，被誉为最催泪的动画电影之一",
    mainCharacters: [
      {
        name: "Seita Yokokawa",
        nameJa: "横川清太",
        nameZh: "横川清太",
        description: "14岁的哥哥，在战争中努力保护妹妹，最终因营养不良死去",
        isMainCharacter: true,
        voiceActorJa: "辰巳努",
        voiceActorEn: "J. Robert Spencer"
      },
      {
        name: "Setsuko Yokokawa",
        nameJa: "横川節子",
        nameZh: "横川节子",
        description: "4岁的妹妹，天真可爱，在哥哥的保护下度过战争的艰难时光",
        isMainCharacter: true,
        voiceActorJa: "白石綾乃",
        voiceActorEn: "Amy Jones"
      }
    ]
  },
  {
    tmdbId: 2034,
    titleEn: "Castle in the Sky",
    titleJa: "天空の城ラピュタ",
    titleZh: "天空之城",
    year: 1986,
    director: "宫崎骏",
    duration: 125,
    synopsis: "少女希达拥有神秘的飞行石，与少年巴鲁一起寻找传说中的天空之城拉普达。",
    themes: ["冒险", "友情", "科技与自然", "反战"],
    significance: "宫崎骏执导的首部吉卜力作品，确立了工作室的艺术风格",
    mainCharacters: [
      {
        name: "Sheeta",
        nameJa: "シータ",
        nameZh: "希达",
        description: "拉普达王室的后裔，拥有飞行石，善良勇敢的少女",
        isMainCharacter: true,
        voiceActorJa: "横沢啓子",
        voiceActorEn: "Anna Paquin"
      },
      {
        name: "Pazu",
        nameJa: "パズー",
        nameZh: "巴鲁",
        description: "矿工少年，梦想找到天空之城，希达的伙伴和保护者",
        isMainCharacter: true,
        voiceActorJa: "田中真弓",
        voiceActorEn: "James Van Der Beek"
      },
      {
        name: "Muska",
        nameJa: "ムスカ",
        nameZh: "穆斯卡",
        description: "政府特工，拉普达王室后裔，野心勃勃的反派角色",
        isMainCharacter: true,
        voiceActorJa: "寺田農",
        voiceActorEn: "Mark Hamill"
      }
    ]
  },
  {
    tmdbId: 10494,
    titleEn: "Princess Mononoke",
    titleJa: "もののけ姫",
    titleZh: "幽灵公主",
    year: 1997,
    director: "宫崎骏",
    duration: 134,
    synopsis: "少年阿席达卡为了解除诅咒，踏上旅程，卷入人类与森林神灵的战争。",
    themes: ["环保", "文明冲突", "生死", "和谐共存"],
    significance: "宫崎骏最具史诗感的作品，探讨人与自然的复杂关系",
    mainCharacters: [
      {
        name: "Ashitaka",
        nameJa: "アシタカ",
        nameZh: "阿席达卡",
        description: "虾夷族的王子，被诅咒后踏上寻找解咒方法的旅程",
        isMainCharacter: true,
        voiceActorJa: "松田洋治",
        voiceActorEn: "Billy Crudup"
      },
      {
        name: "San",
        nameJa: "サン",
        nameZh: "小桑",
        description: "被狼神养大的人类少女，森林的守护者，被称为幽灵公主",
        isMainCharacter: true,
        voiceActorJa: "石田ゆり子",
        voiceActorEn: "Claire Danes"
      },
      {
        name: "Lady Eboshi",
        nameJa: "エボシ御前",
        nameZh: "黑帽大人",
        description: "铁镇的领导者，坚强的女性，代表人类文明的进步",
        isMainCharacter: true,
        voiceActorJa: "田中裕子",
        voiceActorEn: "Minnie Driver"
      }
    ]
  },
  {
    tmdbId: 4935,
    titleEn: "Howl's Moving Castle",
    titleJa: "ハウルの動く城",
    titleZh: "哈尔的移动城堡",
    year: 2004,
    director: "宫崎骏",
    duration: 119,
    synopsis: "18岁的苏菲被荒野女巫变成老婆婆，为了解除魔法，她进入了魔法师哈尔的移动城堡。",
    themes: ["爱情", "自信", "战争", "魔法"],
    significance: "改编自英国作家戴安娜·韦恩·琼斯的小说，展现了爱情的力量",
    mainCharacters: [
      {
        name: "Sophie Hatter",
        nameJa: "ソフィー・ハッター",
        nameZh: "苏菲·哈特",
        description: "帽子店的长女，被变成老婆婆后发现了自己的内在力量",
        isMainCharacter: true,
        voiceActorJa: "倍賞千恵子",
        voiceActorEn: "Jean Simmons"
      },
      {
        name: "Howl",
        nameJa: "ハウル",
        nameZh: "哈尔",
        description: "英俊的魔法师，拥有移动城堡，内心脆弱但善良",
        isMainCharacter: true,
        voiceActorJa: "木村拓哉",
        voiceActorEn: "Christian Bale"
      },
      {
        name: "Calcifer",
        nameJa: "カルシファー",
        nameZh: "卡西法",
        description: "火恶魔，哈尔的心脏，为城堡提供动力",
        isMainCharacter: true,
        voiceActorJa: "我修院達也",
        voiceActorEn: "Billy Crystal"
      },
      {
        name: "Markl",
        nameJa: "マルクル",
        nameZh: "马鲁克",
        description: "哈尔的徒弟，聪明的小男孩",
        isMainCharacter: false,
        voiceActorJa: "神木隆之介",
        voiceActorEn: "Josh Hutcherson"
      }
    ]
  },
  {
    tmdbId: 10681,
    titleEn: "Kiki's Delivery Service",
    titleJa: "魔女の宅急便",
    titleZh: "魔女宅急便",
    year: 1989,
    director: "宫崎骏",
    duration: 103,
    synopsis: "13岁的小魔女琪琪带着黑猫吉吉离开家乡，在海边城市开始独立生活。",
    themes: ["成长", "独立", "友情", "自信"],
    significance: "描绘青春期成长的经典作品，展现了少女的坚强与脆弱",
    mainCharacters: [
      {
        name: "Kiki",
        nameJa: "キキ",
        nameZh: "琪琪",
        description: "13岁的小魔女，善良勇敢，通过快递服务在新城市立足",
        isMainCharacter: true,
        voiceActorJa: "高山みなみ",
        voiceActorEn: "Kirsten Dunst"
      },
      {
        name: "Jiji",
        nameJa: "ジジ",
        nameZh: "吉吉",
        description: "琪琪的黑猫伙伴，聪明机智，是琪琪最好的朋友",
        isMainCharacter: true,
        voiceActorJa: "佐久間レイ",
        voiceActorEn: "Phil Hartman"
      },
      {
        name: "Tombo",
        nameJa: "トンボ",
        nameZh: "蜻蜓",
        description: "对飞行充满热情的少年，琪琪的朋友",
        isMainCharacter: false,
        voiceActorJa: "山口勝平",
        voiceActorEn: "Matthew Lawrence"
      }
    ]
  },
  {
    tmdbId: 13414,
    titleEn: "Nausicaä of the Valley of the Wind",
    titleJa: "風の谷のナウシカ",
    titleZh: "风之谷",
    year: 1984,
    director: "宫崎骏",
    duration: 117,
    synopsis: "在被污染的世界中，风之谷的公主娜乌西卡努力寻找人类与自然和谐共存的道路。",
    themes: ["环保", "和平", "牺牲", "理解"],
    significance: "宫崎骏环保主题的开山之作，奠定了其创作理念",
    mainCharacters: [
      {
        name: "Nausicaä",
        nameJa: "ナウシカ",
        nameZh: "娜乌西卡",
        description: "风之谷的公主，能与昆虫沟通，致力于保护自然",
        isMainCharacter: true,
        voiceActorJa: "島本須美",
        voiceActorEn: "Alison Lohman"
      },
      {
        name: "Asbel",
        nameJa: "アスベル",
        nameZh: "阿斯贝鲁",
        description: "培吉特市的王子，娜乌西卡的盟友",
        isMainCharacter: false,
        voiceActorJa: "松田洋治",
        voiceActorEn: "Shia LaBeouf"
      }
    ]
  }
];

// 角色创建的辅助函数
export function createCharacterData(movie: GhibliMovie, character: Character) {
  return {
    name: character.name,
    nameJa: character.nameJa,
    nameZh: character.nameZh,
    description: character.description,
    isMainCharacter: character.isMainCharacter
  };
}

// 电影角色关联创建的辅助函数
export function createMovieCharacterData(movieId: string, characterId: string, character: Character) {
  return {
    movieId,
    characterId,
    role: character.isMainCharacter ? 'MAIN' : 'SUPPORTING',
    voiceActorJa: character.voiceActorJa,
    voiceActorEn: character.voiceActorEn,
    characterOrder: character.isMainCharacter ? 1 : 2
  };
}
