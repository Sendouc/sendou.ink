import React, { useState } from "react"
import { Dropdown, Button } from "semantic-ui-react"
import { withRouter } from "react-router-dom"
import { weapons } from "../../utils/lists"
import weaponDict from "../../utils/english_internal.json"

const WeaponForm = withRouter(
  ({
    history,
    weaponForm,
    setWeaponForm,
    showImages = true,
    push = false,
    setPage,
    showSubSpecials = false
  }) => {
    const subSpecialOptions = [
      {
        key: "Splat Bomb",
        text: "Splat Bomb",
        value: "Splat Bomb",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Splash.png`
            }
          : null
      },
      {
        key: "Suction Bomb",
        text: "Suction Bomb",
        value: "Suction Bomb",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Suction.png`
            }
          : null
      },
      {
        key: "Burst Bomb",
        text: "Burst Bomb",
        value: "Burst Bomb",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Quick.png`
            }
          : null
      },
      {
        key: "Curling Bomb",
        text: "Curling Bomb",
        value: "Curling Bomb",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Curling.png`
            }
          : null
      },
      {
        key: "Autobomb",
        text: "Autobomb",
        value: "Autobomb",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Robo.png`
            }
          : null
      },
      {
        key: "Ink Mine",
        text: "Ink Mine",
        value: "Ink Mine",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_TimerTrap.png`
            }
          : null
      },
      {
        key: "Toxic Mist",
        text: "Toxic Mist",
        value: "Toxic Mist",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_PoisonFog.png`
            }
          : null
      },
      {
        key: "Point Sensor",
        text: "Point Sensor",
        value: "Point Sensor",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_PointSensor.png`
            }
          : null
      },
      {
        key: "Splash Wall",
        text: "Splash Wall",
        value: "Splash Wall",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Shield.png`
            }
          : null
      },
      {
        key: "Sprinkler",
        text: "Sprinkler",
        value: "Sprinkler",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Sprinkler.png`
            }
          : null
      },
      {
        key: "Squid Beakon",
        text: "Squid Beakon",
        value: "Squid Beakon",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Flag.png`
            }
          : null
      },
      {
        key: "Fizzy Bomb",
        text: "Fizzy Bomb",
        value: "Fizzy Bomb",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Piyo.png`
            }
          : null
      },
      {
        key: "Torpedo",
        text: "Torpedo",
        value: "Torpedo",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Bomb_Tako.png`
            }
          : null
      },
      {
        key: "Tenta Missiles",
        text: "Tenta Missiles",
        value: "Tenta Missiles",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_SuperMissile.png`
            }
          : null
      },
      {
        key: "Sting Ray",
        text: "Sting Ray",
        value: "Sting Ray",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_WaterCutter.png`
            }
          : null
      },
      {
        key: "Inkjet",
        text: "Inkjet",
        value: "Inkjet",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_Jetpack.png`
            }
          : null
      },
      {
        key: "Splashdown",
        text: "Splashdown",
        value: "Splashdown",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_SuperLanding.png`
            }
          : null
      },
      {
        key: "Ink Armor",
        text: "Ink Armor",
        value: "Ink Armor",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_SuperArmor.png`
            }
          : null
      },
      {
        key: "Autobomb Launcher",
        text: "Autobomb Launcher",
        value: "Autobomb Launcher",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_LauncherRobo.png`
            }
          : null
      },
      {
        key: "Burst-Bomb Launcher",
        text: "Burst-Bomb Launcher",
        value: "Burst-Bomb Launcher",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL +
                `/wpnSmall/Wst_LauncherQuick.png`
            }
          : null
      },
      {
        key: "Curling-Bomb Launcher",
        text: "Curling-Bomb Launcher",
        value: "Curling-Bomb Launcher",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL +
                `/wpnSmall/Wst_LauncherCurling.png`
            }
          : null
      },
      {
        key: "Splat-Bomb Launcher",
        text: "Splat-Bomb Launcher",
        value: "Splat-Bomb Launcher",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL +
                `/wpnSmall/Wst_LauncherSplash.png`
            }
          : null
      },
      {
        key: "Suction-Bomb Launcher",
        text: "Suction-Bomb Launcher",
        value: "Suction-Bomb Launcher",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL +
                `/wpnSmall/Wst_LauncherSuction.png`
            }
          : null
      },
      {
        key: "Ink Storm",
        text: "Ink Storm",
        value: "Ink Storm",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_RainCloud.png`
            }
          : null
      },
      {
        key: "Baller",
        text: "Baller",
        value: "Baller",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_AquaBall.png`
            }
          : null
      },
      {
        key: "Bubble Blower",
        text: "Bubble Blower",
        value: "Bubble Blower",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_SuperBubble.png`
            }
          : null
      },
      {
        key: "Booyah Bomb",
        text: "Booyah Bomb",
        value: "Booyah Bomb",
        image: showImages
          ? {
              src: process.env.PUBLIC_URL + `/wpnSmall/Wst_SuperBall.png`
            }
          : null
      },
      {
        key: "Ultra Stamp",
        text: "Ultra Stamp",
        value: "Ultra Stamp",
        image: showImages
          ? {
              src:
                process.env.PUBLIC_URL + `/wpnSmall/Wst_SuperStamp.png`
            }
          : null
      }
    ]
    let options = weapons.map(w => ({
      key: w,
      text: w,
      value: w,
      image: showImages
        ? { src: process.env.PUBLIC_URL + `/wpnSmall/Wst_${weaponDict[w]}.png` }
        : null
    }))
    if (showSubSpecials) options = options.concat(subSpecialOptions)
    return (
      <div>
        <Dropdown
          placeholder="Choose a weapon"
          fluid
          search
          selection
          options={options}
          onChange={(event, { value }) => {
            setWeaponForm(value)
            if (push) history.push(`/builds/${value.replace(/ /g, "_")}`)
            if (setPage) setPage(1)
          }}
          value={weaponForm}
        />
      </div>
    )
  }
)

export const WeaponFormWithButton = withRouter(({ history }) => {
  const [weaponForm, setWeaponForm] = useState("")
  return (
    <div>
      <WeaponForm weaponForm={weaponForm} setWeaponForm={setWeaponForm} />
      <div style={{ paddingTop: "13px" }}>
        <Button
          disabled={weaponForm === ""}
          onClick={() =>
            history.push(
              `/xsearch/w/${weaponDict[weaponForm].replace(/_/g, "-")}`
            )
          }
        >
          Search for a weapon
        </Button>
      </div>
    </div>
  )
})

export default WeaponForm
