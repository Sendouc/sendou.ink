import type { TDImageAsset } from "@tldraw/tldraw";
import {
  Tldraw,
  ColorStyle,
  type TldrawApp,
  TDShapeType,
  TDAssetType,
} from "@tldraw/tldraw";
import * as React from "react";
import type { MainWeaponId } from "~/modules/in-game-lists";
import { mainWeaponIds } from "~/modules/in-game-lists";
import { mainWeaponImageUrl } from "~/utils/urls";
import { Button } from "./Button";
import { Image } from "./Image";

const mapUrl = "http://localhost:5800/img/planner-maps/test.png";

export default function Planner() {
  const [_app, setApp] = React.useState<TldrawApp>();
  const app = _app!;

  const handleMount = React.useCallback((app: TldrawApp) => {
    setApp(app);
    app.style({ color: ColorStyle.Red });
  }, []);

  const handleAddImage = React.useCallback(
    ({
      src,
      size,
      isLocked,
      point,
      cb,
    }: {
      src: string;
      size: number[];
      isLocked: boolean;
      point: number[];
      cb?: () => void;
    }) => {
      if (!app) return;

      const asset: TDImageAsset = {
        id: src,
        type: TDAssetType.Image,
        fileName: "img",
        src,
        size,
      };

      // tldraw creator:
      // "So image shapes in tldraw work like this: we add an asset to the app.assets table, then we reference that asset in the shape object itself.
      // This lets us have multiple copies of an image on the canvas without having all of those take up memory individually"

      app.insertContent({
        assets: [asset],
        shapes: [],
      });

      app.createShapes({
        id: src,
        type: TDShapeType.Image,
        assetId: src,
        size,
        isAspectRatioLocked: true,
        isLocked,
        point,
      });
      cb?.();
    },
    [app]
  );

  const handleAddWeapon = React.useCallback(
    (weaponId: MainWeaponId) => {
      handleAddImage({
        src: `${mainWeaponImageUrl(weaponId)}.png`,
        size: [50, 50],
        isLocked: false,
        // xxx: slightly randomize this?
        point: [500, 500],
        cb: () => app.selectTool("select"),
      });
    },
    [app, handleAddImage]
  );

  const handleAddBackgroundImage = React.useCallback(() => {
    app.resetDocument();
    handleAddImage({
      src: mapUrl,
      size: [1600, 900],
      isLocked: true,
      point: [0, 50],
    });
  }, [app, handleAddImage]);

  return (
    <>
      <div className="plans__top-section">
        <Button onClick={handleAddBackgroundImage}>Add</Button>
      </div>
      <div className="plans__weapons-section">
        {mainWeaponIds.map((weaponId) => {
          return (
            <Button
              key={weaponId}
              variant="minimal"
              onClick={() => handleAddWeapon(weaponId)}
            >
              <Image
                alt=""
                path={mainWeaponImageUrl(weaponId)}
                width={36}
                height={36}
              />
            </Button>
          );
        })}
      </div>
      <Tldraw showMultiplayerMenu={false} onMount={handleMount} />
    </>
  );
}
