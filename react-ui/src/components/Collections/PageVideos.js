import React from 'react'
import { Alert, Spin } from 'antd'
import { useSelector } from 'react-redux'
import { useQuery } from "@apollo/react-hooks"
import Segment from '../elements/Segment'
import VideosSubmitForm from './VideosSubmitForm'
import { userLean } from "../../graphql/queries/userLean"

const PageVideos = () => {
  const localization = useSelector(state => state.localization)
  const { data, error, loading } = useQuery(userLean)

  if (error) return <div style={{ color: "red" }}>{error.message}</div>
  if (loading) return <div style={{textAlign: "center"}}><Spin /></div>
  return (
    <Segment title={localization["Build Search"]}>
      {data.user ? <Alert message="Please sign in to submit new match videos" type="info" showIcon/> : <VideosSubmitForm /> }
    </Segment>
  )
}

export default PageVideos