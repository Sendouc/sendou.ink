import React, { useState, useEffect } from 'react'
import { SketchField, Tools } from 'react-sketch'
import { CirclePicker } from 'react-color'
import { Dropdown, Button, Icon, Input, Grid } from 'semantic-ui-react'

import WeaponForm from '../XSearch/WeaponForm'
import weaponDict from '../../utils/english_internal.json'

const MapPlanner = ({ setMenuSelection }) => {
  let sketch = null
  const [tool, setTool] = useState(Tools.Pencil)
  const [color, setColor] = useState('#f44336')
  const [weapon, setWeapon] = useState('')
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [text, setText] = useState('')
  const tools = [
    { key: 1, text: 'Pencil', value: Tools.Pencil, icon: 'pencil' },
    { key: 2, text: 'Line', value: Tools.Line, icon: 'window minimize outline' },
    { key: 3, text: 'Rectangle', value: Tools.Rectangle, icon: 'square outline' },
    { key: 4, text: 'Circle', value: Tools.Circle, icon: 'circle outline' },
    { key: 5, text: 'Select', value: Tools.Select, icon: 'object group outline' }
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

  useEffect(() => {
    if (!sketch) return
    setMenuSelection('plans')
    sketch.setBackgroundFromDataUrl('https://cdn.gamer-network.net/2017/usgamer/splatoon-2-humpback-pump-track.jpg')
  }, [sketch])

  return (
    <div>
      <h1>Make your plans!</h1>
      (in the final version you can choose any map as the background)
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