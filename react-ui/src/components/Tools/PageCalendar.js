import React, { useState, useEffect, useRef } from 'react'
import { Button, Segment } from 'semantic-ui-react'
import jstz from 'jstz'
import { useSelector } from 'react-redux'

import useWindowDimensions from '../hooks/useWindowDimensions'

const PageCalendar = ({ setMenuSelection }) => {
  const localization = useSelector(state => state.localization)
  const [showCode, setShowCode] = useState(false)
  const { containerWidth } = useWindowDimensions()
  const calenderDiv = useRef(null)

  const iFrameHTML = `<iframe title="calendar" src="https://calendar.google.com/calendar/embed?height=600&amp;wkst=2&amp;bgcolor=%23ffffff&amp;src=NDNnYnJlamkxbnQyZTY1dWJuZzdvYWkxZGtAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;color=%23E67C73&amp;showTitle=0&amp;showNav=1&amp;showDate=1&amp;showPrint=0&amp;showCalendars=0&amp;ctz=${jstz.determine().name()}" style=border-width: 0 width=${containerWidth} height="1000" frameBorder="0" scrolling="no"></iframe>`

  //This is a weird solution but I couldn't get it working just setting the iframe src from a variable
  useEffect(() => {
    setMenuSelection('calendar')
    document.title = 'Competitive Calendar - sendou.ink'
    calenderDiv.current.innerHTML = iFrameHTML
  }, [setMenuSelection, iFrameHTML])

  return (
    <div>
      <div>
        <Button onClick={() => setShowCode(!showCode)}>{localization["Show emoji code"]}</Button>
        {showCode 
        && 
        <Segment raised compact>
          <h4>
            <span role="img" aria-label="money bag emoji">💰</span> - {localization["Has prizes"]}<br/>
            <span role="img" aria-label="masks emoji">🎭</span> - {localization["Unconventional ruleset"]}<br/>
            <span role="img" aria-label="lock emoji">🔒</span> - {localization["Limited registration"]}<br/>
            <span role="img" aria-label="dice emoji">🎲</span> - {localization["Solo registration available"]}<br />
            <span role="img" aria-label="eyes emoji">👀</span> - {localization["No open registration"]}
          </h4>
        </Segment>}
      </div>
      <div style={{"paddingTop": "15px"}} ref={calenderDiv}></div>
      <Segment>
        If an event is missing you can contact <a href="https://twitter.com/Kbot_273">Kbot</a> about it.<br/>
        You can add the calendar to your personal Google Calendar by pressing the plus button above. If you are using other kind of calendar program you can try <a href="https://calendar.google.com/calendar/ical/43gbreji1nt2e65ubng7oai1dk%40group.calendar.google.com/public/basic.ics">this link</a> instead.
      </Segment>
    </div>
  )
}

export default PageCalendar