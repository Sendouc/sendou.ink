import React from 'react'
import { Segment } from 'semantic-ui-react'
import { useSelector } from "react-redux"

const PageAbout = () => {
  const localization = useSelector(state => state.localization)
  return (
    <Segment>
      <div style={{margin: "1.5em"}}>
        <p>
          {localization['Goal']}
        </p>
        <p>
          <h4>{localization['Help']}</h4>
          {localization["Ask on Discord"]}: <a href="https://discord.gg/J6NqUvt">https://discord.gg/J6NqUvt</a>
        </p>
        <p>
          <h4>{localization["Thanks to"]}</h4>
          <ul>
            <li><a href="https://twitter.com/LeanYoshi">Lean</a> (provided the Top 500 X Rank data)</li>
            <li><a href="https://twitter.com/zorg_z0rg_z0r8">zorg</a> (provided background pictures for the map planner)</li>
            <li><a href="https://splatoon2.ink/">splatoon2.ink</a> (provided rotations data)</li>
            <li><a href="https://twitter.com/JikoSplatoon">Jiko</a> (Chinese translation)</li>
            <li><a href="https://twitter.com/yan87780671">Yani</a> (Chinese translation)</li>
            <li><a href="https://twitter.com/Kassy_tw">Kassy</a> (Spanish translation)</li>
            <li><a href="https://twitter.com/yuza_i">Yuza</a> (German translation)</li>
            <li><a href="https://vk.com/erff_splatoon">Erfes</a> (Russian translation)</li>
            <li><a href="https://twitter.com/VoltoMatte">Volto</a> (Italian translation)</li>
            <li><a href="https://twitter.com/DatPretto">Pretto</a> (Italian translation)</li>
          </ul>
        </p>
      </div>
    </Segment>
  )
}

export default PageAbout