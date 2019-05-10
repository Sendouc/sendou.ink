import React from 'react'
import { withRouter } from 'react-router-dom'
import { useQuery } from 'react-apollo-hooks'
import { Loader, Message, Grid, Button, Header } from 'semantic-ui-react'
import { searchForPlayers } from '../../graphql/queries/searchForPlayers'

const XSearchResults = withRouter(({ history, name, exact }) => {
  const result = useQuery(searchForPlayers, {variables: { name, exact }})

  if (result.loading) {
    return <div style={{"paddingTop": "25px", "paddingBottom": "20000px"}} ><Loader active inline='centered' /></div>
  }
  if (result.error) {
    return <div style={{"color": "red"}}>{result.error.message}</div>
  }
  const searchResult = result.data['searchForPlayers']
  if (searchResult.length === 0) {
    return <Message
          error
          header='Found 0 players who reached Top 500 with your search'
          list={[
            'You can\'t search for a player that has never finished in the Top 500',
            'Be careful about special characters: ρ is not the same as p for example',
            'Some characters can\'t be used in the search such as )'
          ]}
    />
  }
  return (
    <div style={{"paddingTop": "10px"}}>
      <Header>Search results</Header>
      {searchResult.length > 20 ? <Message info header='Your search returned over 20 players' content="Below are the twenty players with the highest power that match your criteria" /> : null}
      <Grid columns={3}>
        {searchResult.map(r => {
          return (
            <Grid.Row key={r.unique_id}>
              <Grid.Column>
              {r.name} ({r.x_power} with {r.weapon})
              </Grid.Column>
              <Grid.Column>
                <Button
                  positive 
                  onClick={() => history.push(`/xsearch/p/${r.unique_id}`)}
                >Go!</Button>
              </Grid.Column>
              <Grid.Column></Grid.Column>
            </Grid.Row>
          )
        })}
        </Grid>
    </div>
  )

})

export default XSearchResults