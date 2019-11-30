import React, { useState, useEffect } from "react"
import { Tab, Image, Grid, Button, Message } from "semantic-ui-react"
import { Redirect } from "react-router-dom"
import { useQuery } from "@apollo/react-hooks"
import { useParams } from "react-router-dom"
import { searchForUser } from "../../graphql/queries/searchForUser"
import { userLean } from "../../graphql/queries/userLean"
import PlayerXRankStats from "../xsearch/PlayerXRankStats"
import BuildTab from "./BuildTab"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { useQueryParam, NumberParam } from "use-query-params"
import Settings from "./Settings"
import ProfileLists from "./ProfileLists"

const UserPage = () => {
  const { id } = useParams()
  const [tab, setTab] = useQueryParam("tab", NumberParam)
  const { data, error, loading } = useQuery(searchForUser, {
    variables: { discord_id: id },
  })
  const userLeanQuery = useQuery(userLean)

  const [activeIndex, setActiveIndex] = useState(tab ? tab : 0)
  const [showSettings, setShowSettings] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleError = error => {
    console.error(error)
    setErrorMsg(error.message)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  const handleSuccess = () => {
    setShowSettings(false)
    setSuccessMsg("Profile successfully updated!")
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  useEffect(() => {
    if (loading || !data || !data.searchForUser) return
    document.title = `${data.searchForUser.username} - sendou.ink`
  }, [loading, data])

  if (loading || userLeanQuery.loading) return <Loading />

  if (error) return <Error errorMessage={error.message} />

  if (userLeanQuery.error)
    return <Error errorMessage={userLeanQuery.error.message} />

  const userData = data.searchForUser
  if (!userData) return <Redirect to="/404" />

  const panes = [
    {
      menuItem: "Builds",
      render: () => (
        <Tab.Pane>
          <BuildTab user={userLeanQuery.data.user} userViewed={userData} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "X Rank",
      render: () => (
        <Tab.Pane>
          <PlayerXRankStats twitter={userData.twitter_name} tabMode />
        </Tab.Pane>
      ),
    },
  ]

  const handleTabChange = (e, { activeIndex }) => {
    setActiveIndex(activeIndex)
    setTab(activeIndex)
  }

  return (
    <>
      <>
        <Grid stackable columns={4}>
          <Grid.Column width={3}>
            {userData.twitter_name && (
              <Image
                src={`https://avatars.io/twitter/${userData.twitter_name}`}
                rounded
                onError={error =>
                  console.error(
                    `Couldn't fetch avatar image of ${userData.twitter_name}.`
                  )
                }
              />
            )}
          </Grid.Column>
          <ProfileLists user={userData} />
          <Grid.Column>
            {!showSettings && userData.id === userLeanQuery.data.user.id && (
              <Button onClick={() => setShowSettings(!showSettings)}>
                Profile settings
              </Button>
            )}
          </Grid.Column>
        </Grid>
        {successMsg && <Message positive>{successMsg}</Message>}
        {errorMsg && <Message negative>{errorMsg}</Message>}
      </>
      <div style={{ paddingTop: "1.5em" }}>
        {showSettings ? (
          <Settings
            user={{
              country: "",
              motion_sens:
                userData.sens && userData.sens.motion
                  ? userData.sens.motion
                  : "",
              stick_sens:
                userData.sens && userData.sens.stick ? userData.sens.stick : "",
              weapons: [],
              ...userData,
            }}
            closeSettings={() => setShowSettings(false)}
            handleSuccess={() => handleSuccess()}
            handleError={() => handleError()}
          />
        ) : (
          <Tab
            panes={panes}
            activeIndex={activeIndex}
            onTabChange={handleTabChange}
          />
        )}
      </div>
    </>
  )
}

export default UserPage
