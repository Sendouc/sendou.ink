import React from 'react'
import Tournament from './Tournament'

const Comps = () => {
  const mockData = [{
    id: 'a',
    name: "In The Zone X",
    bracket: "https://sendous.challonge.com/InTheZone10",
    vod: "https://www.twitch.tv/videos/446387554",
    weapons: ["Heavy Splatling Remix", "Tenta Camo Brella", "Tentatek Splattershot", "Soda Slosher", "Splattershot Jr.", "Kensa Splattershot Pro", "Splatterscope", "Custom Dualie Squelchers", "Splat Brella", "Firefin Splatterscope", "Kensa Splattershot"],
    team_count: 42,
    japanese: false,
    patch: '4.9.0',
    timestamp: 1561852800,
    alpha_team: ["15919661737096779013", "17188550932108025730", "14175924256374209434", "10344205398411576675",], //either uids or nicknames order matters kaji plontro grey kiver
    bravo_team: ["12385180454540543327", "14434881234947959524", "15316460862005315247", "7140457213492687321"], //erza brian sorin zekken
    alpha_team_players: ["Kaji", "plontro", "Grey", "Kiver"],
    bravo_team_players: ["Erza", "Brian", "Sorin", "Zekken"],
    alpha_team_name: ["Kraken Paradise"],
    bravo_team_name: ["Team Olive"],
    rounds: [{
      winner: "BRAVO", //enum
      map: "MakoMart",
      mode: "Splat Zones", //enum
      alpha_weapons: ["Heavy Splatling Remix", "Soda Slosher", "Splattershot Jr.", "Kensa Splattershot Pro"],
      bravo_weapons: ["Soda Slosher", "Splatterscope", "Splattershot Jr.", "Kensa Splattershot Pro"]
    },
    {
      winner: "BRAVO", //enum
      map: "Wahoo World",
      mode: "Splat Zones", //enum
      alpha_weapons: ["Heavy Splatling Remix", "Soda Slosher", "Splattershot Jr.", "Custom Dualie Squelchers"],
      bravo_weapons: ["Splat Brella", "Firefin Splatterscope", "Splattershot Jr.", "Kensa Splattershot"]
    },
    {
      winner: "ALPHA",
      map: "Skipper Pavilion",
      mode: "Splat Zones",
      alpha_weapons: ["Heavy Splatling Remix", "Soda Slosher", "Tenta Camo Brella", "Custom Dualie Squelchers"],
      bravo_weapons: ["Kensa Sloshing Machine", "Splatterscope", "Splattershot Jr.", "Kensa Splattershot Pro"]
    },
    {
      winner: "BRAVO",
      map: "Manta Maria",
      mode: "Splat Zones",
      alpha_weapons: ["Heavy Splatling Remix", "Soda Slosher", "Tenta Camo Brella", "Tentatek Splattershot"],
      bravo_weapons: ["Splat Brella", "Firefin Splatterscope", "Splattershot Jr.", "Kensa Splattershot"]
    }]
  }]
  return (
    <div>
      <div>
        Search bar here.
      </div>
      <div>
        {mockData.map(t => {
          return (
            <Tournament tournament={t} key={t.id}/>
          )
        })}
      </div>
      <div>
        Pagination here
      </div>
    </div>
  )
}

export default Comps