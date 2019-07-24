import React, { useState, useEffect } from 'react'
import { SketchField, Tools } from 'react-sketch'
import { CirclePicker } from 'react-color'
import { Dropdown, Button, Icon, Input, Grid, Label, Message } from 'semantic-ui-react'

import WeaponForm from '../XSearch/WeaponForm'
import weaponDict from '../../utils/english_internal.json'

import academy from '../img/plannerMaps/academy-sz-map.png'
import arena from '../img/plannerMaps/arena-sz-map.png'
import camp from '../img/plannerMaps/camp-sz-map.png'
import canal from '../img/plannerMaps/canal-sz-map.png'
import dome from '../img/plannerMaps/dome-sz-OLD.png'
import fitness from '../img/plannerMaps/fitness-sz-map.png'
import games from '../img/plannerMaps/games-sz-map.png'
import hotel from '../img/plannerMaps/hotel-sz-map.png'
import institute from '../img/plannerMaps/institute-sz-map.png'
import mainstage from '../img/plannerMaps/mainstage-rm-new.png'
import mall from '../img/plannerMaps/mall-sz-map.png'
import manta from '../img/plannerMaps/manta-sz-map.png'
import mart from '../img/plannerMaps/mart-sz-map.png'
import pavilion from '../img/plannerMaps/pavilion-sz-map.png'
import pit from '../img/plannerMaps/pit-sz-map.png'
import port from '../img/plannerMaps/port-sz-map.png'
import pumptrack from '../img/plannerMaps/pumptrack-sz-map.png'
import reef from '../img/plannerMaps/reef-sz-new.png'
import shipyard from '../img/plannerMaps/shipyard-sz-map.png'
import skatepark from '../img/plannerMaps/skatepark-sz-new.png'
import towers from '../img/plannerMaps/towers-sz-new-map.png'
import warehouse from '../img/plannerMaps/warehouse-sz-map.png'
import world from '../img/plannerMaps/world-sz-map.png'

const MapPlanner = ({ setMenuSelection }) => {
  let sketch = null
  const isMobile = window.innerWidth <= 1000
  const [tool, setTool] = useState(Tools.Pencil)
  const [color, setColor] = useState('#f44336')
  const [weapon, setWeapon] = useState('')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [text, setText] = useState('')
  const [bg, setBg] = useState(reef)

  const tools = [
    { key: 1, text: 'Pencil', value: Tools.Pencil, icon: 'pencil' },
    { key: 2, text: 'Line', value: Tools.Line, icon: 'window minimize outline' },
    { key: 3, text: 'Rectangle', value: Tools.Rectangle, icon: 'square outline' },
    { key: 4, text: 'Circle', value: Tools.Circle, icon: 'circle outline' },
    { key: 5, text: 'Select', value: Tools.Select, icon: 'object group outline' }
  ]

  const maps = [
    { key: 'The Reef', text: 'The Reef', value: reef },
    { key: 'Musselforge Fitness', text: 'Musselforge Fitness', value: fitness },
    { key: 'Starfish Mainstage', text: 'Starfish Mainstage', value: mainstage },
    { key: 'Humpback Pumptrack', text: 'Humpback Pumptrack', value: pumptrack },
    { key: 'Inkblot Art Academy', text: 'Inkblot Art Academy', value: academy },
    { key: 'Sturgeon Shipyard', text: 'Sturgeon Shipyard', value: shipyard },
    { key: 'Moray Towers', text: 'Moray Towers', value: towers },
    { key: 'Port Mackerel', text: 'Port Mackerel', value: port },
    { key: 'Manta Maria', text: 'Manta Maria', value: manta },
    { key: 'Kelp Dome', text: 'Kelp Dome', value: dome },
    { key: 'Snapper Canal', text: 'Snapper Canal', value: canal },
    { key: 'Blackbelly Skatepark', text: 'Blackbelly Skatepark', value: skatepark },
    { key: 'MakoMart', text: 'MakoMart', value: mart },
    { key: 'Walleye Warehouse', text: 'Walleye Warehouse', value: warehouse },
    { key: 'Shellendorf Institute', text: 'Shellendorf Institute', value: institute },
    { key: 'Arowana Mall', text: 'Arowana Mall', value: mall },
    { key: 'Goby Arena', text: 'Goby Arena', value: arena },
    { key: 'Piranha Pit', text: 'Piranha Pit', value: pit },
    { key: 'Camp Triggerfish', text: 'Camp Triggerfish', value: camp },
    { key: 'Wahoo World', text: 'Wahoo World', value: world },
    { key: 'New Albacore Hotel', text: 'New Albacore Hotel', value: hotel },
    { key: 'Ancho-V Games', text: 'Ancho-V Games', value: games },
    { key: 'Skipper Pavilion', text: 'Skipper Pavilion', value: pavilion },
  ]

  const addImageToSketch = () => {
    sketch.addImg(process.env.PUBLIC_URL + `/wpnMedium/Wst_${weaponDict[weapon]}.png`)
    setTool(Tools.Select)
  }

  const addTextToSketch = () => {
    sketch.addText(text, 
      { 
        fill: color, 
        fontFamily: "lato",
        stroke: '#000000',
        strokeWidth: 3,
        paintFirst: "stroke" })
    setTool(Tools.Select)
  }

  const undo = () => {
    sketch.undo()
    setCanUndo(sketch.canUndo())
    setCanRedo(sketch.canRedo())
  }

  const redo = () => {
    sketch.redo()
    setCanUndo(sketch.canUndo())
    setCanRedo(sketch.canRedo())
  }

  const removeSelected = () => {
    sketch.removeSelected()
  }

  const onSketchChange = () => {
    let prev = canUndo
    let now = sketch.canUndo()
    if (prev !== now) {
      setCanUndo(now)
    }
  }

  const download = () => {
    const dataUrl = sketch.toDataURL()
    let a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    a.href = dataUrl
    a.download = `${bg.replace('/static/media/', '').split('-')[0]} plans.png`
    a.click()
    window.URL.revokeObjectURL(dataUrl)
  }

  const onBgChange = (value) => {
    setBg(value)
    sketch.clear()
    setCanUndo(false)
    sketch.setBackgroundFromDataUrl(value)
  }

  useEffect(() => {
    if (!sketch) return
    setMenuSelection('plans')
    document.title = 'Planner - sendou.ink'
    sketch.setBackgroundFromDataUrl(reef)
  }, [sketch, setMenuSelection])

  return (
    <div>
      <h1>Make your plans!</h1>
      {isMobile && <Message negative>Unfortunately this tool isn't designed for narrow screens but you can still give it a go.</Message>}
      <div>
      <SketchField
        name="sketch"
        className="canvas-area"
        ref={c => (sketch = c)}
        lineColor={color}
        lineWidth={5}
        width={1280}
        height={720}
        /*width={
          this.state.controlledSize ? this.state.sketchWidth : null
        }
        height={
          this.state.controlledSize ? this.state.sketchHeight : null
        }*/
        /*defaultValue={dataJson}*/
        /*value={controlledValue}*/
        /*forceValue*/
        onChange={onSketchChange}
        tool={tool}
      />
      </div>
      <div style={{"paddingTop": "10px"}}>
        <Button icon disabled={!canUndo} onClick={() => undo()}><Icon name='undo' />Undo</Button>
        <Button icon disabled={!canRedo} onClick={() => redo()}><Icon name='redo' />Redo</Button>
        <Button icon disabled={tool !== Tools.Select} onClick={() => removeSelected()}><Icon name='trash' />Delete selected</Button>
        <Button icon onClick={() => download()}><Icon name='download' />Download</Button>
      </div>
      <div style={{"paddingTop": "10px"}}>
        <Grid columns={3}>
          <Grid.Column>
            <CirclePicker
              color={color}
              onChangeComplete={(newColor) => setColor(newColor.hex)} 
            />
          </Grid.Column>
          <Grid.Column>
            <h3>Tools</h3>
            <Dropdown
              onChange={(e, { value }) => setTool(value)}
              options={tools}
              selection
              value={tool}
            />
          </Grid.Column>
          <Grid.Column>
            <h3>Add text</h3>
            <Input 
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <div style={{ "paddingTop": "7px"}}>
              <Button 
                icon='plus' 
                circular 
                onClick={() => addTextToSketch()}
              />
            </div>
          </Grid.Column>
        </Grid>
      </div>
      <h3>Choose the map</h3>
      <Dropdown
        onChange={(e, { value }) => onBgChange(value)}
        options={maps}
        selection
        value={bg}
      />
      <Label basic color='red' pointing='left'>
        Please note that changing the map also clears all the drawings
      </Label>
      <h3>Choose a weapon to add</h3>
      <WeaponForm weaponForm={weapon} setWeaponForm={setWeapon} />
      <div style={{'paddingTop': '7px'}}>
        <Button 
          icon='plus' 
          circular 
          onClick={() => addImageToSketch()}
        />
      </div>
    </div>
  )
}

export default MapPlanner