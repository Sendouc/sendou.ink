import React from 'react'
import { Icon } from 'antd'
import { discordLogoSvg } from '../../img/imports'
import { withRouter } from 'react-router-dom'

const Footer = withRouter(({ history }) => {
  return (
    <div style={{ fontSize: 30, color: "white", textAlign: "center" }}>
      {/* This looks weird but it's necessary for styling reasons */}
      <Icon type="github" onClick={() => window.location.assign('https://github.com/Sendouc/sendou-ink')} />{" "}
      <Icon component={discordLogoSvg} onClick={() => window.location.assign('https://discord.gg/J6NqUvt')} />{" "}
      <Icon type="twitter" onClick={() => window.location.assign('https://twitter.com/sendouc')} />{" "}
      <Icon type="info-circle" onClick={() => history.push("/about")} />
    </div>
  )
})

export default Footer