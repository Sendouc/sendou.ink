type Rating = {
  mu: number;
  sigma: number;
};

declare module "openskill" {
  export function rating(rating?: Rating): Rating;
  export function ordinal(rating: Rating): number;
  export function rate(ratings: [Rating[], Rating[]]): [Rating[], Rating[]];
}
