import {
  weapons,
  countryCodes,
  themeColors,
  headOnlyAbilities,
  clothingOnlyAbilities,
  shoesOnlyAbilities,
  stackableAbilities,
  headGearEnglish,
  clothingGearEnglish,
  shoesGearEnglish,
  maps,
} from "./utils/lists"

// https://github.com/microsoft/TypeScript/issues/28046#issuecomment-480516434
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never

export type Weapon = ElementType<typeof weapons>
export type Stage = ElementType<typeof maps>
export type CountryCode = ElementType<typeof countryCodes>
export type ThemeColor = ElementType<typeof themeColors>

export type HeadOnlyAbility = ElementType<typeof headOnlyAbilities>
export type ClothingOnlyAbility = ElementType<typeof clothingOnlyAbilities>
export type ShoesOnlyAbility = ElementType<typeof shoesOnlyAbilities>
export type StackableAbility =
  | ElementType<typeof stackableAbilities>
  | "UNKNOWN"
export type Ability =
  | HeadOnlyAbility
  | ClothingOnlyAbility
  | ShoesOnlyAbility
  | StackableAbility

export type HeadGear = ElementType<typeof headGearEnglish>
export type ClothingGear = ElementType<typeof clothingGearEnglish>
export type ShoesGear = ElementType<typeof shoesGearEnglish>

export type SubWeapon =
  | "Splat Bomb"
  | "Suction Bomb"
  | "Burst Bomb"
  | "Curling Bomb"
  | "Autobomb"
  | "Ink Mine"
  | "Sprinkler"
  | "Toxic Mist"
  | "Point Sensor"
  | "Splash Wall"
  | "Squid Beakon"
  | "Fizzy Bomb"
  | "Torpedo"

export type SpecialWeapon =
  | "Tenta Missiles"
  | "Sting Ray"
  | "Inkjet"
  | "Splashdown"
  | "Ink Armor"
  | "Curling-Bomb Launcher"
  | "Burst-Bomb Launcher"
  | "Autobomb Launcher"
  | "Splat-Bomb Launcher"
  | "Suction-Bomb Launcher"
  | "Ink Storm"
  | "Baller"
  | "Bubble Blower"
  | "Booyah Bomb"
  | "Ultra Stamp"

export interface Theme {
  colorMode: "dark" | "light"
  bgColor: string
  darkerBgColor: string
  textColor: string
  borderStyle: string
  grayWithShade: string
  themeColorWithShade: string
  themeColorHex: string
  themeColorHexLighter: string
  themeColor: ThemeColor
}

export interface UserLean {
  id: string
  username: string
  discord_id: string
  twitter_name?: string
  avatar?: string
  custom_url?: string
  plus?: {
    membership_status?: "ONE" | "TWO"
    plus_region: "EU" | "NA"
    vouch_status?: "ONE" | "TWO"
    can_vouch?: "ONE" | "TWO"
    can_vouch_again_after?: string
  }
}

export interface User {
  id: string
  username: string
  discriminator: string
  discord_id: string
  avatar?: string
  twitch_name?: string
  twitter_name?: string
  youtube_name?: string
  youtube_id?: string
  country?: CountryCode
  weapons?: Weapon[]
  top500: boolean
  custom_url?: string
  bio?: string
  sens?: {
    stick: number
    motion?: number
  }
}

export interface Build {
  id: string
  weapon: Weapon
  title?: string
  description?: string
  headgear: [
    HeadOnlyAbility | StackableAbility,
    StackableAbility,
    StackableAbility,
    StackableAbility | "UNKNOWN"
  ]
  clothing: [
    ClothingOnlyAbility | StackableAbility,
    StackableAbility,
    StackableAbility,
    StackableAbility
  ]
  shoes: [
    ShoesOnlyAbility | StackableAbility,
    StackableAbility,
    StackableAbility,
    StackableAbility | "UNKNOWN"
  ]
  headgearItem?: HeadGear
  clothingItem?: ClothingGear
  shoesItem?: ShoesGear
  updatedAt: string
  top: boolean
  jpn: boolean
  discord_user?: {
    username: string
    discriminator: string
    discord_id: string
  }
}

export type AnalyzerBuild = Pick<
  Build,
  "weapon" | "headgear" | "clothing" | "shoes"
>

export interface Placement {
  id: string
  weapon: Weapon
  rank: number
  mode: 1 | 2 | 3 | 4
  x_power: number
  unique_id: string
  month: number
  year: number
}

export interface FreeAgentPost {
  id: string
  can_vc: "YES" | "USUALLY" | "SOMETIMES" | "NO"
  playstyles: ("FRONTLINE" | "MIDLINE" | "BACKLINE")[]
  activity?: string
  looking_for?: string
  past_experience?: string
  description?: string
  hidden: boolean
  createdAt: string
  discord_user: {
    username: string
    discriminator: string
    discord_id: string
    twitter_name?: string
    country?: CountryCode
    weapons?: Weapon[]
    top500: boolean
    avatar?: string
  }
}

export interface TournamentResult {
  date: string
  tweet_id?: string
  tournament_name: string
  placement: number
}

export interface Team {
  name: string
  twitter_name?: string
  challonge_name?: string
  discord_url?: string
  founded?: {
    month: number
    year: number
  }
  captain_discord_id: string
  member_discord_ids: string[]
  member_users: {
    discord_id: string
    username: string
    discriminator: string
    twitch_name?: string
    twitter_name?: string
    country?: CountryCode
    weapons: Weapon[]
    custom_url?: string
  }[]
  countries: string[]
  tag?: String
  lf_post?: String
  tournament_results: TournamentResult[]
}

export interface DetailedTeamInfo {
  team_name: string
  score: number
  players: {
    discord_user: {
      username: string
      discriminator: string
      twitter_name: string
      discord_id: string
    }
    weapon: Weapon
    main_abilities: Ability[]
    sub_abilities: Ability[][]
    kills: number
    assists: number
    deaths: number
    specials: number
    paint: number
    gear: (HeadGear | ClothingGear | ShoesGear)[]
  }[]
}

//==============================================================================
// Apollo
//==============================================================================

export interface UserData {
  user?: UserLean
}

export interface SearchForBuildsData {
  searchForBuilds: Build[]
}

export interface SearchForBuildsVars {
  discord_id?: string
  weapon?: Weapon
}

export interface PlayerInfoData {
  playerInfo?: {
    placements: Placement[]
  }
}

export interface PlayerInfoVars {
  twitter: string
}

export interface FreeAgentPostsData {
  freeAgentPosts: FreeAgentPost[]
}
