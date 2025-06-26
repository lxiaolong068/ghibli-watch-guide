// Complete Studio Ghibli movie list and character information
// Used for third phase content enrichment

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
    director: "Hayao Miyazaki",
    duration: 125,
    synopsis: "10-year-old Chihiro becomes trapped in a spirit world while moving to a new home. To save her parents who have been turned into pigs, she must work at Yubaba's bathhouse and find her true name.",
    themes: ["Coming of age", "Courage", "Environmental protection", "Traditional culture"],
    significance: "Won the Academy Award for Best Animated Feature, one of Miyazaki's masterpieces",
    mainCharacters: [
      {
        name: "Chihiro Ogino",
        nameJa: "荻野千尋",
        nameZh: "荻野千寻",
        description: "A 10-year-old girl who is brave and kind, grows in the spirit world and saves her parents",
        isMainCharacter: true,
        voiceActorJa: "柊瑠美",
        voiceActorEn: "Daveigh Chase"
      },
      {
        name: "Haku",
        nameJa: "ハク",
        nameZh: "白龙",
        description: "A mysterious boy who is actually the river god of the Kohaku River, helps Chihiro survive in the spirit world",
        isMainCharacter: true,
        voiceActorJa: "入野自由",
        voiceActorEn: "Jason Marsden"
      },
      {
        name: "No-Face",
        nameJa: "カオナシ",
        nameZh: "无脸男",
        description: "A mysterious spirit who longs to be accepted and understood, symbolizing loneliness in modern society",
        isMainCharacter: true,
        voiceActorJa: "中村彰男"
      },
      {
        name: "Yubaba",
        nameJa: "湯婆婆",
        nameZh: "汤婆婆",
        description: "The bathhouse proprietress, greedy but has her own principles, Chihiro's employer",
        isMainCharacter: true,
        voiceActorJa: "夏木マリ",
        voiceActorEn: "Suzanne Pleshette"
      },
      {
        name: "Lin",
        nameJa: "リン",
        nameZh: "小玲",
        description: "A bathhouse worker, Chihiro's friend and mentor, actually a white weasel spirit",
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
    director: "Hayao Miyazaki",
    duration: 86,
    synopsis: "Two young girls move to the countryside where they encounter the forest spirit Totoro, beginning a heartwarming adventure.",
    themes: ["Family", "Nature", "Childhood innocence", "Hope"],
    significance: "Studio Ghibli's iconic work, with Totoro becoming the studio's mascot",
    mainCharacters: [
      {
        name: "Satsuki Kusakabe",
        nameJa: "草壁サツキ",
        nameZh: "草壁皋月",
        description: "The 10-year-old elder sister, mature and responsible, caring for her younger sister and sick mother",
        isMainCharacter: true,
        voiceActorJa: "日高のり子",
        voiceActorEn: "Dakota Fanning"
      },
      {
        name: "Mei Kusakabe",
        nameJa: "草壁メイ",
        nameZh: "草壁梅",
        description: "The 4-year-old younger sister, innocent and lively, the first to discover Totoro",
        isMainCharacter: true,
        voiceActorJa: "坂本千夏",
        voiceActorEn: "Elle Fanning"
      },
      {
        name: "Totoro",
        nameJa: "トトロ",
        nameZh: "龙猫",
        description: "Guardian of the forest, a giant gentle spirit that only pure-hearted children can see",
        isMainCharacter: true,
        voiceActorJa: "高木均",
        voiceActorEn: "Frank Welker"
      },
      {
        name: "Tatsuo Kusakabe",
        nameJa: "草壁タツオ",
        nameZh: "草壁达郎",
        description: "The father, a university professor who understands and supports his daughters' imagination",
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
    director: "Isao Takahata",
    duration: 89,
    synopsis: "At the end of WWII, 14-year-old Seita and his 4-year-old sister Setsuko lose their parents in the war and struggle to survive in this heartbreaking story.",
    themes: ["War", "Family", "Survival", "Tragedy"],
    significance: "A classic anti-war film, considered one of the most emotionally devastating animated movies",
    mainCharacters: [
      {
        name: "Seita Yokokawa",
        nameJa: "横川清太",
        nameZh: "横川清太",
        description: "The 14-year-old brother who struggles to protect his sister during the war, ultimately dying from malnutrition",
        isMainCharacter: true,
        voiceActorJa: "辰巳努",
        voiceActorEn: "J. Robert Spencer"
      },
      {
        name: "Setsuko Yokokawa",
        nameJa: "横川節子",
        nameZh: "横川节子",
        description: "The 4-year-old sister, innocent and lovely, endures the hardships of war under her brother's protection",
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
    director: "Hayao Miyazaki",
    duration: 125,
    synopsis: "A young girl named Sheeta possesses a mysterious levitation stone and joins a boy named Pazu to search for the legendary floating city of Laputa.",
    themes: ["Adventure", "Friendship", "Technology vs nature", "Anti-war"],
    significance: "Miyazaki's first Studio Ghibli work, establishing the studio's artistic style",
    mainCharacters: [
      {
        name: "Sheeta",
        nameJa: "シータ",
        nameZh: "希达",
        description: "A descendant of Laputa's royal family, possesses the levitation stone, a kind and brave young girl",
        isMainCharacter: true,
        voiceActorJa: "横沢啓子",
        voiceActorEn: "Anna Paquin"
      },
      {
        name: "Pazu",
        nameJa: "パズー",
        nameZh: "巴鲁",
        description: "A miner boy who dreams of finding the floating city, Sheeta's companion and protector",
        isMainCharacter: true,
        voiceActorJa: "田中真弓",
        voiceActorEn: "James Van Der Beek"
      },
      {
        name: "Muska",
        nameJa: "ムスカ",
        nameZh: "穆斯卡",
        description: "A government agent and descendant of Laputa's royal family, an ambitious antagonist",
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
    director: "Hayao Miyazaki",
    duration: 134,
    synopsis: "Young Ashitaka embarks on a journey to lift a curse, becoming entangled in a war between humans and forest spirits.",
    themes: ["Environmental protection", "Civilization conflict", "Life and death", "Harmonious coexistence"],
    significance: "Miyazaki's most epic work, exploring the complex relationship between humans and nature",
    mainCharacters: [
      {
        name: "Ashitaka",
        nameJa: "アシタカ",
        nameZh: "阿席达卡",
        description: "Prince of the Emishi clan, embarks on a journey to find a way to lift his curse",
        isMainCharacter: true,
        voiceActorJa: "松田洋治",
        voiceActorEn: "Billy Crudup"
      },
      {
        name: "San",
        nameJa: "サン",
        nameZh: "小桑",
        description: "A human girl raised by wolf gods, protector of the forest, known as Princess Mononoke",
        isMainCharacter: true,
        voiceActorJa: "石田ゆり子",
        voiceActorEn: "Claire Danes"
      },
      {
        name: "Lady Eboshi",
        nameJa: "エボシ御前",
        nameZh: "黑帽大人",
        description: "Leader of Iron Town, a strong woman representing the progress of human civilization",
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
    director: "Hayao Miyazaki",
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
    director: "Hayao Miyazaki",
    duration: 103,
    synopsis: "13-year-old witch Kiki leaves home with her black cat Jiji to begin independent life in a seaside city.",
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
        description: "Kiki's black cat companion, clever and witty, Kiki's best friend",
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
    director: "Hayao Miyazaki",
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
