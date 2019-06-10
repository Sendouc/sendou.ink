import React from 'react'
import { Header, Image } from 'semantic-ui-react'
import rigBanner from '../img/misc/rigBanner.png'

const HomePage = () => {
  return (
    <div style={{'textAlign': 'center'}}>
      <div>
        <Header as='h2'>Welcome to sendou.ink!<Header sub>Competitive Splatoon Hub</Header></Header>
      </div>
      <div style={{'paddingTop': '10px'}}>
        <Image rounded src={rigBanner} size='huge' centered/>
      </div>
    </div>
  )
}

export default HomePage