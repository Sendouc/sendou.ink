import React from 'react'
import { Icon } from 'antd'
import RollSim from './RollSim'
import { discordLogoSvg } from '../../img/imports'

const Footer = () => {
  return (
    <div>
      <div style={{ "paddingTop": "25px" }}>
        <RollSim />
      </div>
      <div style={{ fontSize: 30, color: "white", textAlign: "center" }}>
      <hr />
      {/* This looks weird but it's necessary for styling reasons */}
      <Icon type="github" onClick={() => window.location.assign('https://github.com/Sendouc/sendou-ink')} />{" "}
      <Icon component={discordLogoSvg} onClick={() => window.location.assign('https://discord.gg/J6NqUvt')} />{" "}
      <Icon type="twitter" onClick={() => window.location.assign('https://twitter.com/sendouc')} />{" "}
      {/*<Icon type="info-circle" />*/}
      </div>
    </div>
  )
}

export default Footer