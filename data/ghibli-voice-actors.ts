// 吉卜力电影配音演员信息
// 用于第三阶段内容充实

export interface VoiceActor {
  name: string;
  nameJa?: string;
  nameEn?: string;
  nameZh?: string;
  bio: string;
  imageUrl?: string;
  birthDate?: string;
  nationality: string;
  notableWorks: string[];
}

export interface MovieVoiceActor {
  movieTmdbId: number;
  characterName: string;
  voiceActorJa?: VoiceActor;
  voiceActorEn?: VoiceActor;
  voiceActorZh?: VoiceActor;
  role: 'MAIN' | 'SUPPORTING' | 'MINOR';
}

export const GHIBLI_VOICE_ACTORS: MovieVoiceActor[] = [
  {
    movieTmdbId: 129,
    characterName: "千寻",
    voiceActorJa: {
      name: "柊瑠美",
      nameJa: "柊瑠美",
      nameEn: "Rumi Hiiragi",
      nameZh: "柊瑠美",
      bio: "日本女性声优，因为《千与千寻》中千寻一角而闻名。当时年仅13岁的她，用纯真的声音完美诠释了千寻的成长历程。",
      birthDate: "1987-08-01",
      nationality: "日本",
      notableWorks: ["千与千寻", "海猫鸣泣之时", "School Days"]
    },
    voiceActorEn: {
      name: "Daveigh Chase",
      nameEn: "Daveigh Chase",
      nameZh: "戴维·蔡斯",
      bio: "美国女演员和声优，以其在《千与千寻》英语版中的出色配音而知名。她的声音完美捕捉了千寻的勇敢和纯真。",
      birthDate: "1990-07-24",
      nationality: "美国",
      notableWorks: ["千与千寻", "午夜凶铃", "大小谎言"]
    },
    role: "MAIN"
  },
  {
    movieTmdbId: 129,
    characterName: "白龙",
    voiceActorJa: {
      name: "入野自由",
      nameJa: "入野自由",
      nameEn: "Miyu Irino",
      nameZh: "入野自由",
      bio: "日本男性声优和演员，以其清澈的声音和出色的演技著称。在《千与千寻》中完美诠释了白龙的神秘和温柔。",
      birthDate: "1988-02-19",
      nationality: "日本",
      notableWorks: ["千与千寻", "王国之心", "进击的巨人"]
    },
    voiceActorEn: {
      name: "Jason Marsden",
      nameEn: "Jason Marsden",
      nameZh: "杰森·马斯登",
      bio: "美国演员和声优，拥有丰富的配音经验。他为白龙配音时展现了角色的复杂性和深度。",
      birthDate: "1975-01-03",
      nationality: "美国",
      notableWorks: ["千与千寻", "高飞家族", "辛普森一家"]
    },
    role: "MAIN"
  },
  {
    movieTmdbId: 10515,
    characterName: "皋月",
    voiceActorJa: {
      name: "日高のり子",
      nameJa: "日高のり子",
      nameEn: "Noriko Hidaka",
      nameZh: "日高法子",
      bio: "日本著名女性声优，以其温暖的声音和出色的演技闻名。在《龙猫》中完美诠释了皋月的懂事和坚强。",
      birthDate: "1962-05-31",
      nationality: "日本",
      notableWorks: ["龙猫", "乱马1/2", "Touch"]
    },
    voiceActorEn: {
      name: "Dakota Fanning",
      nameEn: "Dakota Fanning",
      nameZh: "达科塔·范宁",
      bio: "美国著名女演员，童星出身。她在《龙猫》英语版中的配音充满了童真和活力。",
      birthDate: "1994-02-23",
      nationality: "美国",
      notableWorks: ["龙猫", "我是山姆", "暮光之城"]
    },
    role: "MAIN"
  },
  {
    movieTmdbId: 10515,
    characterName: "小梅",
    voiceActorJa: {
      name: "坂本千夏",
      nameJa: "坂本千夏",
      nameEn: "Chika Sakamoto",
      nameZh: "坂本千夏",
      bio: "日本女性声优，以其可爱的童声著称。在《龙猫》中完美演绎了小梅的天真烂漫。",
      birthDate: "1959-08-17",
      nationality: "日本",
      notableWorks: ["龙猫", "七龙珠", "樱桃小丸子"]
    },
    voiceActorEn: {
      name: "Elle Fanning",
      nameEn: "Elle Fanning",
      nameZh: "艾丽·范宁",
      bio: "美国女演员，达科塔·范宁的妹妹。她在《龙猫》英语版中的配音天真可爱，完美契合小梅的角色。",
      birthDate: "1998-04-09",
      nationality: "美国",
      notableWorks: ["龙猫", "马琳菲森", "霓虹恶魔"]
    },
    role: "MAIN"
  },
  {
    movieTmdbId: 4935,
    characterName: "苏菲",
    voiceActorJa: {
      name: "倍賞千恵子",
      nameJa: "倍賞千恵子",
      nameEn: "Chieko Baisho",
      nameZh: "倍赏千惠子",
      bio: "日本著名女演员和歌手，拥有丰富的表演经验。在《哈尔的移动城堡》中分别为年轻和年老的苏菲配音，展现了精湛的演技。",
      birthDate: "1941-06-29",
      nationality: "日本",
      notableWorks: ["哈尔的移动城堡", "男人真命苦", "砂之器"]
    },
    voiceActorEn: {
      name: "Jean Simmons",
      nameEn: "Jean Simmons",
      nameZh: "琼·西蒙斯",
      bio: "英国著名女演员，好莱坞黄金时代的代表人物。她为年老苏菲的配音充满了智慧和温暖。",
      birthDate: "1929-01-31",
      nationality: "英国",
      notableWorks: ["哈尔的移动城堡", "乱世佳人", "斯巴达克斯"]
    },
    role: "MAIN"
  },
  {
    movieTmdbId: 4935,
    characterName: "哈尔",
    voiceActorJa: {
      name: "木村拓哉",
      nameJa: "木村拓哉",
      nameEn: "Takuya Kimura",
      nameZh: "木村拓哉",
      bio: "日本著名演员和歌手，SMAP成员。他为哈尔的配音充满了魅力和深度，完美诠释了这个复杂的角色。",
      birthDate: "1972-11-13",
      nationality: "日本",
      notableWorks: ["哈尔的移动城堡", "HERO", "华丽一族"]
    },
    voiceActorEn: {
      name: "Christian Bale",
      nameEn: "Christian Bale",
      nameZh: "克里斯蒂安·贝尔",
      bio: "英国著名演员，以其精湛的演技和对角色的深度诠释著称。他为哈尔的配音既优雅又充满情感。",
      birthDate: "1974-01-30",
      nationality: "英国",
      notableWorks: ["哈尔的移动城堡", "蝙蝠侠", "机械师"]
    },
    role: "MAIN"
  },
  {
    movieTmdbId: 10681,
    characterName: "琪琪",
    voiceActorJa: {
      name: "高山みなみ",
      nameJa: "高山みなみ",
      nameEn: "Minami Takayama",
      nameZh: "高山南",
      bio: "日本著名女性声优，以其多变的声音和出色的演技著称。在《魔女宅急便》中完美演绎了琪琪的成长历程。",
      birthDate: "1964-05-05",
      nationality: "日本",
      notableWorks: ["魔女宅急便", "名侦探柯南", "乱马1/2"]
    },
    voiceActorEn: {
      name: "Kirsten Dunst",
      nameEn: "Kirsten Dunst",
      nameZh: "克尔斯滕·邓斯特",
      bio: "美国著名女演员，童星出身。她在《魔女宅急便》英语版中的配音充满了青春活力。",
      birthDate: "1982-04-30",
      nationality: "美国",
      notableWorks: ["魔女宅急便", "蜘蛛侠", "绝望主妇"]
    },
    role: "MAIN"
  }
];
