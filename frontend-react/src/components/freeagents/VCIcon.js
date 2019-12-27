import React from "react"
import { Popup, Icon } from "semantic-ui-react"

const VCIcon = ({ canVC }) => {
  const iconColor = () => {
    if (canVC === "YES") return "green"
    else if (canVC === "NO") return "red"

    return "yellow"
  }

  const canVCCapitalized = canVC.charAt(0) + canVC.toLowerCase().slice(1)
  return (
    <Popup
      content={`Voice chat: ${canVCCapitalized}`}
      trigger={<Icon name="microphone" size="big" color={iconColor()} />}
    />
  )
}

export default VCIcon
