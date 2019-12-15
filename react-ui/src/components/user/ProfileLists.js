import React from "react"
import { List, Flag, Grid } from "semantic-ui-react"
import WpnImage from "../common/WpnImage"
import { countries } from "../../utils/lists"

const SensListItem = ({ sens }) => {
  const stickSensString =
    sens.stick !== null ? `${sens.stick > 0 ? "+" : ""}${sens.stick} Stick` : ""
  const motionSensString =
    sens.motion !== null
      ? ` ${sens.motion > 0 ? "+" : ""}${sens.motion} Motion`
      : ""
  return (
    <List.Item>
      <List.Content>
        {stickSensString}
        {motionSensString}
      </List.Content>
    </List.Item>
  )
}

const ProfileLists = ({ user, imageError }) => {
  return (
    <>
      <Grid.Column>
        <List>
          <List.Item>
            <List.Icon name="discord" size="large" />
            <List.Content>{`${user.username}#${user.discriminator}`}</List.Content>
          </List.Item>
          {user.twitter_name && !imageError && (
            <List.Item>
              <List.Icon name="twitter" size="large" />
              <List.Content>
                <a href={`https://twitter.com/${user.twitter_name}`}>
                  {user.twitter_name}
                </a>
              </List.Content>
            </List.Item>
          )}
          {user.twitch_name && (
            <List.Item>
              <List.Icon name="twitch" size="large" />
              <List.Content>
                <a href={`https://www.twitch.tv/${user.twitch_name}`}>
                  {user.twitch_name}
                </a>
              </List.Content>
            </List.Item>
          )}
        </List>
      </Grid.Column>
      <Grid.Column>
        <List>
          {user.country && (
            <List.Item>
              <List.Content>
                <Flag name={user.country} />
                {countries.reduce(
                  (acc, cur) => (cur.code === user.country ? cur.name : acc),
                  ""
                )}
              </List.Content>
            </List.Item>
          )}
          {user.weapons && (
            <List.Item>
              {user.weapons.map(wpn => (
                <WpnImage
                  key={wpn}
                  weapon={wpn}
                  size="SMALL"
                  style={{ float: "left" }}
                />
              ))}
            </List.Item>
          )}
          {user.sens && <SensListItem sens={user.sens} />}
        </List>
      </Grid.Column>
    </>
  )
}

export default ProfileLists
