import React from "react"
import { Grid, Checkbox } from "semantic-ui-react"

const MapPreferenceSelector = ({ maps, preferences }) => {
  return (
    <Grid relaxed columns={4}>
      <Grid.Column>
        <b>Splat Zones</b>
        {maps.sz.map(m => {
          return (
            <div key={m}>
              <Checkbox
                label={m}
                checked={!preferences.sz[m]}
                onChange={() => {
                  preferences.sz[m] = !preferences.sz[m]
                  window.localStorage.setItem(
                    "rotationPreferences",
                    JSON.stringify(preferences)
                  )
                }}
              />
              <br />
            </div>
          )
        })}
      </Grid.Column>
      <Grid.Column>
        <b>Tower Control</b>
        {maps.tc.map(m => {
          return (
            <div key={m}>
              <Checkbox
                label={m}
                checked={!preferences.tc[m]}
                onChange={() => {
                  preferences.tc[m] = !preferences.tc[m]
                  window.localStorage.setItem(
                    "rotationPreferences",
                    JSON.stringify(preferences)
                  )
                }}
              />
              <br />
            </div>
          )
        })}
      </Grid.Column>
      <Grid.Column>
        <b>Rainmaker</b>
        {maps.rm.map(m => {
          return (
            <div key={m}>
              <Checkbox
                label={m}
                checked={!preferences.rm[m]}
                onChange={() => {
                  preferences.rm[m] = !preferences.rm[m]
                  window.localStorage.setItem(
                    "rotationPreferences",
                    JSON.stringify(preferences)
                  )
                }}
              />
              <br />
            </div>
          )
        })}
      </Grid.Column>
      <Grid.Column>
        <b>Clam Blitz</b>
        {maps.cb.map(m => {
          return (
            <div key={m}>
              <Checkbox
                label={m}
                checked={!preferences.cb[m]}
                onChange={() => {
                  preferences.cb[m] = !preferences.cb[m]
                  window.localStorage.setItem(
                    "rotationPreferences",
                    JSON.stringify(preferences)
                  )
                }}
              />
              <br />
            </div>
          )
        })}
      </Grid.Column>
    </Grid>
  )
}

export default MapPreferenceSelector
