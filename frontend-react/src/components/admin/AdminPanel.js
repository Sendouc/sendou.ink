import React, { useState, useEffect } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Redirect, Link } from "react-router-dom"

import { userLean } from "../../graphql/queries/userLean"
import AddTwitter from "./AddTwitter"
import Error from "../common/Error"
import Loading from "../common/Loading"
import { Message } from "semantic-ui-react"

const AdminPanel = () => {
  const { data, error, loading } = useQuery(userLean)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [link, setLink] = useState(null)

  useEffect(() => {
    document.title = "Admin - sendou.ink"
  }, [])

  if (loading) return <Loading />
  if (error) return <Error errorMessage={error.message} />

  const user = data.user
  if (!user || user.discord_id !== "79237403620945920")
    return <Redirect to="/404" />

  const handleSuccess = message => {
    setSuccessMsg(message)
    setTimeout(() => {
      setSuccessMsg(null)
    }, 10000)
  }

  const handleError = error => {
    setErrorMsg(error.message)
    setTimeout(() => {
      setErrorMsg(null)
    }, 10000)
  }

  return (
    <>
      {successMsg && <Message success>{successMsg}</Message>}
      {errorMsg && <Message error>{errorMsg}</Message>}
      {link && <Link to={link}>{`https://sendou.ink${link}`}</Link>}
      <AddTwitter
        handleSuccess={(message, link) => {
          handleSuccess(message)
          setLink(link)
        }}
        handleError={handleError}
      />
    </>
  )
}

export default AdminPanel
