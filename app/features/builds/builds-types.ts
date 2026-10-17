import type { MainWeaponId } from "~/modules/in-game-lists/types";

export interface BuildWeaponWithTop500Info {
	weaponSplId: MainWeaponId;
	isTop500: number;
}
