// Complete Studio Ghibli Movie List and Character Information (English Version)
// For Phase 3 content enrichment

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

export const GHIBLI_MOVIES_EN: GhibliMovie[] = [
  {
    tmdbId: 129,
    titleEn: "Spirited Away",
    titleJa: "千と千尋の神隠し",
    titleZh: "千与千寻",
    year: 2001,
    director: "Hayao Miyazaki",
    duration: 125,
    synopsis: "10-year-old Chihiro accidentally enters the spirit world while moving with her parents. To save her parents who have been turned into pigs, she must work at Yubaba's bathhouse and reclaim her name.",
    themes: ["Coming of age", "Courage", "Environmental", "Traditional culture"],
    significance: "Winner of the Academy Award for Best Animated Feature, one of Miyazaki's masterpieces",
    mainCharacters: [
      {
        name: "Chihiro Ogino",
        nameJa: "荻野千尋",
        nameZh: "荻野千寻",
        description: "A 10-year-old girl who is brave and kind, grows up in the spirit world and saves her parents",
        isMainCharacter: true,
        voiceActorJa: "Rumi Hiiragi",
        voiceActorEn: "Daveigh Chase"
      },
      {
        name: "Haku",
        nameJa: "ハク",
        nameZh: "白龙",
        description: "A mysterious boy who is actually the river spirit of the Kohaku River, helps Chihiro survive in the spirit world",
        isMainCharacter: true,
        voiceActorJa: "Miyu Irino",
        voiceActorEn: "Jason Marsden"
      },
      {
        name: "No-Face",
        nameJa: "カオナシ",
        nameZh: "无脸男",
        description: "A mysterious spirit who becomes obsessed with Chihiro and represents the dangers of greed and consumption",
        isMainCharacter: true,
        voiceActorJa: "Akio Nakamura",
        voiceActorEn: "Bob Bergen"
      },
      {
        name: "Yubaba",
        nameJa: "湯婆婆",
        nameZh: "汤婆婆",
        description: "The powerful witch who runs the bathhouse, represents materialism and the adult world",
        isMainCharacter: true,
        voiceActorJa: "Mari Natsuki",
        voiceActorEn: "Suzanne Pleshette"
      },
      {
        name: "Lin",
        nameJa: "リン",
        nameZh: "小玲",
        description: "A bathhouse worker who becomes Chihiro's friend and mentor, helping her navigate the spirit world",
        isMainCharacter: false,
        voiceActorJa: "Yumi Tamai",
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
    synopsis: "Two young sisters, Satsuki and Mei, move to the countryside with their father and discover magical forest spirits, including the friendly Totoro.",
    themes: ["Childhood", "Family", "Nature", "Magic"],
    significance: "Studio Ghibli's most iconic work, became the studio's mascot and symbol",
    mainCharacters: [
      {
        name: "Satsuki Kusakabe",
        nameJa: "草壁サツキ",
        nameZh: "草壁皋月",
        description: "The responsible older sister who takes care of her family while her mother is in the hospital",
        isMainCharacter: true,
        voiceActorJa: "Noriko Hidaka",
        voiceActorEn: "Dakota Fanning"
      },
      {
        name: "Mei Kusakabe",
        nameJa: "草壁メイ",
        nameZh: "草壁小月",
        description: "The curious and energetic younger sister who first discovers Totoro",
        isMainCharacter: true,
        voiceActorJa: "Chika Sakamoto",
        voiceActorEn: "Elle Fanning"
      },
      {
        name: "Totoro",
        nameJa: "トトロ",
        nameZh: "龙猫",
        description: "The large, friendly forest spirit who befriends the sisters and helps them in times of need",
        isMainCharacter: true,
        voiceActorJa: "Hitoshi Takagi",
        voiceActorEn: "Frank Welker"
      },
      {
        name: "Tatsuo Kusakabe",
        nameJa: "草壁タツオ",
        nameZh: "草壁达郎",
        description: "The girls' father, a university professor who supports his daughters' imagination and wonder",
        isMainCharacter: false,
        voiceActorJa: "Shigesato Itoi",
        voiceActorEn: "Tim Daly"
      }
    ]
  }
];
