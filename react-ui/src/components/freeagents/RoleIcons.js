import React from "react"
import { Popup, Icon } from "semantic-ui-react"

const RoleIcons = ({ playstyles }) => {
  return (
    <>
      <Popup
        content={
          <>
            Frontline/Slayer{" "}
            {playstyles.FRONTLINE ? (
              <Icon name="checkmark" color="green" />
            ) : (
              <Icon name="close" color="red" />
            )}
          </>
        }
        trigger={
          <Icon
            name="crosshairs"
            size="big"
            color={playstyles.FRONTLINE ? "green" : null}
            disabled={!playstyles.FRONTLINE}
          />
        }
      />
      <Popup
        content={
          <>
            Midline/Support{" "}
            {playstyles.MIDLINE ? (
              <Icon name="checkmark" color="green" />
            ) : (
              <Icon name="close" color="red" />
            )}
          </>
        }
        trigger={
          <Icon
            name="medkit"
            size="big"
            color={playstyles.MIDLINE ? "green" : null}
            disabled={!playstyles.MIDLINE}
          />
        }
      />
      <Popup
        content={
          <>
            Backline/Anchor{" "}
            {playstyles.BACKLINE ? (
              <Icon name="checkmark" color="green" />
            ) : (
              <Icon name="close" color="red" />
            )}
          </>
        }
        trigger={
          <Icon
            name="anchor"
            size="big"
            color={playstyles.BACKLINE ? "green" : null}
            disabled={!playstyles.BACKLINE}
          />
        }
      />
    </>
  )
}

export default RoleIcons
