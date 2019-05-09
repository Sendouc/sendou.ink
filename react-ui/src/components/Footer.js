import React from 'react'
import { Icon } from 'semantic-ui-react'

const Footer = () => {
  return (
    <div style={{"fontSize": "small", "paddingTop": "25px"}} >
      <hr />
      Website by <a href="https://twitter.com/sendouc">Sendou</a>. Data for X Rank Leaderboards provided by <a href="https://twitter.com/LeanYoshi">Lean</a>.<br />
      <Icon name='github' /> Source code for this site is available on <a href="https://github.com/Sendouc/sendou-ink">GitHub</a>
    </div>
  )
}

export default Footer