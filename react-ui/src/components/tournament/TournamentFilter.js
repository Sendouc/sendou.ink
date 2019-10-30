import React, { useState } from "react"
import { Button, Form, Input } from "semantic-ui-react"
import WeaponDropdown from "../common/WeaponDropdown"

const TournamentFilter = ({ filter, setFilter, fireQuery }) => {
  const handleChange = (e, { name, value }) => {
    setFilter({ ...filter, [name]: value })
  }

  const handleDropdownChange = (e, { value }) => {
    if (value.length <= 4) {
      setFilter({ ...filter, comp: value })
    }
  }

  return (
    <Form>
      <Form.Group widths="equal">
        <Form.Field
          control={Input}
          name="tournament_name"
          label="Tournament"
          placeholder="Tournament"
          value={filter.tournament_name}
          onChange={handleChange}
        />
        <Form.Field
          control={Input}
          name="team_name"
          label="Team"
          placeholder="Team"
          value={filter.team_name}
          onChange={handleChange}
        />
        <Form.Field
          control={Input}
          name="player_name"
          label="Player"
          placeholder="Player"
          value={filter.player_name}
          onChange={handleChange}
        />
      </Form.Group>
      <WeaponDropdown
        multiple
        value={filter.comp}
        onChange={handleDropdownChange}
      />
      <Form.Group inline style={{ paddingTop: "10px" }}>
        <Form.Radio
          label="All"
          value="all"
          name="region"
          checked={filter.region === "all"}
          onChange={handleChange}
        />
        <Form.Radio
          label="Western only"
          value="western"
          name="region"
          checked={filter.region === "western"}
          onChange={handleChange}
        />
        <Form.Radio
          label="Japanese only"
          value="jpn"
          name="region"
          checked={filter.region === "jpn"}
          onChange={handleChange}
        />
      </Form.Group>
      <Button secondary onClick={() => fireQuery()}>
        Apply filters
      </Button>
      <span style={{ paddingLeft: "0.5em" }}>
        <Button
          type="button"
          onClick={() =>
            fireQuery({
              page: 1,
              tournament_name: "",
              region: "all",
              team_name: "",
              player_name: "",
              comp: []
            })
          }
        >
          Reset filters
        </Button>
      </span>
    </Form>
  )
}

export default TournamentFilter
