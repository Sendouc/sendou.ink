import { Ability } from "@prisma/client";
import { weaponToCode } from "lib/lists/weaponCodes";
import { GetBuildsByWeaponData } from "prisma/queries/getBuildsByWeapon";
import { Dispatch, useReducer } from "react";
import useSWR from "swr";

export type BuildFilterType = "AT_LEAST" | "AT_MOST" | "HAS" | "DOES_NOT_HAVE";

interface BuildFilter {
  type: BuildFilterType;
  abilityPoints: number;
  ability: Ability;
  key: number;
}

export interface UseBuildsByWeaponState {
  weapon: string;
  filters: BuildFilter[];
  expandedUsers: Set<number>;
}

type Action =
  | {
      type: "SET_WEAPON";
      weapon: string;
    }
  | {
      type: "EXPAND_USER";
      id: number;
    }
  | {
      type: "ADD_FILTER";
    }
  | {
      type: "REMOVE_FILTER";
      index: number;
    }
  | {
      type: "SET_FILTER_TYPE";
      index: number;
      filterType: BuildFilter["type"];
    }
  | {
      type: "SET_FILTER_ABILITY_POINTS";
      index: number;
      abilityPoints: number;
    }
  | {
      type: "SET_FILTER_ABILITY";
      index: number;
      ability: Ability;
    };

export type UseBuildsByWeaponDispatch = Dispatch<Action>;

export function useBuildsByWeapon() {
  const [state, dispatch] = useReducer(
    (oldState: UseBuildsByWeaponState, action: Action) => {
      switch (action.type) {
        case "SET_WEAPON":
          return { ...oldState, weapon: action.weapon };
        case "EXPAND_USER":
          return {
            ...oldState,
            expandedUsers: new Set([...oldState.expandedUsers, action.id]),
          };
        case "ADD_FILTER":
          return {
            ...oldState,
            filters: [
              ...oldState.filters,
              {
                ability: "ISM",
                type: "AT_LEAST",
                abilityPoints: 12,
                key: new Date().getTime(),
              },
            ] as BuildFilter[],
          };
        case "REMOVE_FILTER":
          return {
            ...oldState,
            filters: oldState.filters.filter((_, i) => i !== action.index),
          };
        case "SET_FILTER_TYPE":
          const filtersTypeCopy = [...oldState.filters];
          filtersTypeCopy[action.index] = {
            ...filtersTypeCopy[action.index],
            type: action.filterType,
          };

          return {
            ...oldState,
            filters: filtersTypeCopy,
          };
        case "SET_FILTER_ABILITY":
          const filtersAbilityCopy = [...oldState.filters];
          filtersAbilityCopy[action.index] = {
            ...filtersAbilityCopy[action.index],
            ability: action.ability,
          };

          return {
            ...oldState,
            filters: filtersAbilityCopy,
          };
        case "SET_FILTER_ABILITY_POINTS":
          const filtersAbilityPointsCopy = [...oldState.filters];
          filtersAbilityPointsCopy[action.index] = {
            ...filtersAbilityPointsCopy[action.index],
            abilityPoints: action.abilityPoints,
          };

          return {
            ...oldState,
            filters: filtersAbilityPointsCopy,
          };
        default:
          return oldState;
      }
    },
    { weapon: "", filters: [], expandedUsers: new Set() as Set<number> }
  );

  const { data = [] } = useSWR<GetBuildsByWeaponData>(() => {
    if (!state.weapon) return null;

    const key = state.weapon as keyof typeof weaponToCode;
    return `/api/builds/${weaponToCode[key]}`;
  });

  return {
    data: state.filters.length
      ? data.reduce((acc: GetBuildsByWeaponData, buildArray) => {
          const filteredArray = buildArray.filter((build) => {
            return state.filters.every((filter) => {
              // @ts-ignore
              const apCount = build.abilityPoints[filter.ability] ?? 0;

              switch (filter.type) {
                case "HAS":
                  return !!apCount;
                case "DOES_NOT_HAVE":
                  return !apCount;
                case "AT_MOST":
                  return apCount <= filter.abilityPoints;
                case "AT_LEAST":
                  return apCount >= filter.abilityPoints;
                default:
                  throw Error("Invalid filter type");
              }
            });
          });

          if (!filteredArray.length) return acc;

          return [...acc, filteredArray];
        }, [])
      : data,
    state,
    dispatch,
  };
}
