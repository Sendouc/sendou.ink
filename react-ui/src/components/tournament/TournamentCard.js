import React from "react"
import { Card, Flag, Header } from "semantic-ui-react"
import { wpnSmall } from "../../assets/imageImports"
import weaponDict from "../../utils/english_internal.json"
import { months } from "../../utils/lists"

const TournamentCard = ({
  tournament,
  onClick = null,
  centered = false,
  showBracket = true
}) => {
  const a = new Date(parseInt(tournament["date"]))
  const dateStr = `${a.getDate()} ${
    months[a.getMonth() + 1]
  } ${a.getFullYear()}`
  return (
    <Card raised centered={centered} onClick={onClick}>
      <Card.Content>
        <Card.Header>
          {tournament["name"]}
          {tournament["jpn"] && <Flag name="jp" />}
        </Card.Header>
        <Card.Meta>{dateStr}</Card.Meta>
        {tournament.hasOwnProperty("bracket") && (
          <Card.Description>
            {tournament.bracket && showBracket && (
              <a href={tournament.bracket}>Bracket</a>
            )}
          </Card.Description>
        )}
        <Card.Description>
          <span role="img" aria-label="trophy">
            🏆
          </span>{" "}
          <b>{tournament["winning_team_name"]}</b>
        </Card.Description>
        <Card.Description>
          {" "}
          {/*TODO: add link to profile if unique id*/}
          {tournament["winning_team_players"].map(player => {
            return <span key={player}>{player} </span>
          })}
        </Card.Description>
      </Card.Content>
      <Card.Content>
        <Card.Description>
          <Header as="h5" color="grey">
            Popular weapons
          </Header>
        </Card.Description>
        {tournament["popular_weapons"].map(weapon => (
          <img key={weapon} src={wpnSmall[weaponDict[weapon]]} alt={weapon} />
        ))}
      </Card.Content>
    </Card>
  )
}

export default TournamentCard
