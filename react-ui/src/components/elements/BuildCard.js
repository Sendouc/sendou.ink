import React from "react"
import { Card, Badge } from "antd"
import { Link } from 'react-router-dom'

import { abilities, top500crown } from '../../img/imports'


const mainAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: "2",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000"
}
const subAbilityStyle = {
  //https://github.com/loadout-ink/splat2-calc
  zIndex: "2",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  background: "#000",
  border: "2px solid #888",
  borderRight: "0px",
  borderBottom: "0px",
  backgroundSize: "100%",
  boxShadow: "0 0 0 1px #000"
}

const parseIntoAbilityIcons = (element, index) => {
  if (index === 0) {
    return <span key={index}><img src={abilities[element].image} style={mainAbilityStyle} alt={element}/>{' '}</span>
  } else {
    return <img key={index} src={abilities[element].image} style={subAbilityStyle} alt={element} />
  }
} 

const BuildCard = ({ build }) => {
  // Arrays of 4
  const headAbilities = build.headgear
  const clothingAbilities = build.clothing
  const shoesAbilities = build.shoes
  const userName = `${build.discord_user.username}#${build.discord_user.discriminator}` //TODO: Truncuate long nicknames to avoid the rows breaking
  const playerProfileLink = `/u/${build.discord_id}`
  const lastUpdated = new Date(parseInt(build.updatedAt)).toLocaleString("en-GB")
  const card = 
    <Card style={{ width: 200, background: "WhiteSmoke" }}>
      <p>{headAbilities.map(parseIntoAbilityIcons)}</p>
      <p>{clothingAbilities.map(parseIntoAbilityIcons)}</p>
      <p>{shoesAbilities.map(parseIntoAbilityIcons)}</p>
      <Link to={playerProfileLink}>{userName}</Link><br/>
      <i>{lastUpdated}</i>
    </Card>
  if (build.top) {
    return (
      <Badge count={<img src={top500crown} alt="top 500 indicator" style={{height: "25px", width: "auto"}}/>}>
      {card}
      </Badge>
    )
  } else {
    return (
      <>
      {card}
      </>
    )
  }
}

export default BuildCard
