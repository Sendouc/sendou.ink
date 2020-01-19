import { weapons, countryCodes, themeColors } from "./utils/lists"

// https://github.com/microsoft/TypeScript/issues/28046#issuecomment-480516434
type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never

export type Weapon = ElementType<typeof weapons>
export type CountryCode = ElementType<typeof countryCodes>
export type ThemeColor = ElementType<typeof themeColors>

export interface UserLean {
  id: string
  username: string
  discord_id: string
  twitter_name?: string
  custom_url?: string
  plus?: {
    membership_status?: "ONE" | "TWO"
    plus_region: "EU" | "NA"
    vouch_status?: "ONE" | "TWO"
    can_vouch?: "ONE" | "TWO"
    can_vouch_again_after?: string
  }
}

export interface UserData {
  user?: UserLean
}

export interface User {
  id: string
  username: string
  discriminator: string
  discord_id: string
  twitch_name?: string
  twitter_name?: string
  country?: CountryCode
  weapons?: Weapon[]
  top500: boolean
  custom_url?: string
  sens?: {
    stick: number
    motion?: number
  }
}

export interface SearchForUserData {
  searchForUser?: User
}

export interface SearchForUserVars {
  discord_id?: string
  custom_url?: string
}
