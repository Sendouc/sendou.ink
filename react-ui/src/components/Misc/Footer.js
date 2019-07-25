import React from 'react'
import { Icon } from 'semantic-ui-react'

const Footer = () => {
  return (
    <div style={{"fontSize": "small", "paddingTop": "25px"}} >
      <hr />
      Website by <a href="https://twitter.com/sendouc">Sendou</a>. Data for the X Rank Leaderboards provided by <a href="https://twitter.com/LeanYoshi">Lean</a>. 
      Data for the rotations provided by <a href="https://splatoon2.ink/">splatoon2.ink</a>. Map pictures for the planner provided by <a href="https://twitter.com/zorg_z0rg_z0r8">zorg</a>.<br />
      <Icon name='github' /> Source code for this site is available on <a href="https://github.com/Sendouc/sendou-ink">GitHub</a>
    </div>
  )
}

export default Footer