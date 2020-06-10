import { gql, DocumentNode } from "apollo-boost"

export interface BannersData {
  banners: {
    id: string
    logoUrl: string
    description: string
    link: string
    textColor: string
    bgColor: string
    staleAfter: string
  }[]
}

export const BANNERS: DocumentNode = gql`
  {
    banners {
      id
      logoUrl
      description
      link
      textColor
      bgColor
      staleAfter
    }
  }
`
