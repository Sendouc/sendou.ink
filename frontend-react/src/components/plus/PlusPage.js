import React, { useState, useRef } from "react"
import { useQuery } from "@apollo/react-hooks"

import Suggestions from "./Suggestions"
import Loading from "../common/Loading"
import Error from "../common/Error"
import { plusInfo } from "../../graphql/queries/plusInfo"
import { Input } from "semantic-ui-react"
import { Redirect } from "react-router-dom"
import { userLean } from "../../graphql/queries/userLean"

const copyToClipboard = (e, refToUse, setCopySuccess) => {
  refToUse.current.select()
  document.execCommand("copy")
  e.target.focus()
  setCopySuccess(true)
  setTimeout(() => setCopySuccess(false), 1000)
}

const getAction = (success, onClick) => {
  if (!document.queryCommandSupported("copy")) return null
  if (success)
    return {
      color: "green",
      labelPosition: "right",
      icon: "checkmark",
      content: "Copy",
    }

  return {
    color: "linkedin",
    labelPosition: "right",
    icon: "copy",
    content: "Copy",
    onClick: onClick,
  }
}

const PlusPage = () => {
  const [showSuggestionForm, setShowSuggestionForm] = useState(false)
  const plusOneRef = useRef(null)
  const [plusOneCopySuccess, setPlusOneCopySuccess] = useState(false)
  const plusTwoRef = useRef(null)
  const [plusTwoCopySuccess, setPlusTwoCopySuccess] = useState(false)

  const { data, error, loading } = useQuery(plusInfo)
  const {
    data: userData,
    error: userQueryError,
    loading: userQueryLoading,
  } = useQuery(userLean)

  if (loading || userQueryLoading) return <Loading />
  if (error) return <Error errorMessage={error.message} />
  if (userQueryError) return <Error errorMessage={userQueryError.message} />
  if (!userData.user) return <Redirect to="/access" />
  if (!data.plusInfo) return <Redirect to="/404" />

  return (
    <>
      {!showSuggestionForm && (
        <>
          {data.plusInfo.plus_one_invite_link && (
            <>
              <div>
                <b>+1 invite link</b>
              </div>
              <Input
                style={{ width: "310px" }}
                ref={plusOneRef}
                action={getAction(plusOneCopySuccess, e =>
                  copyToClipboard(e, plusOneRef, setPlusOneCopySuccess)
                )}
                value={data.plusInfo.plus_one_invite_link}
              />
            </>
          )}
          {data.plusInfo.plus_two_invite_link && (
            <>
              <div style={{ marginTop: "1em" }}>
                <b>+2 invite link</b>
              </div>
              <Input
                style={{ width: "310px" }}
                ref={plusTwoRef}
                action={getAction(plusTwoCopySuccess, e =>
                  copyToClipboard(e, plusTwoRef, setPlusTwoCopySuccess)
                )}
                value={data.plusInfo.plus_two_invite_link}
              />
            </>
          )}
        </>
      )}
      {!data.plusInfo.voting_ends && (
        <Suggestions
          user={userData.user}
          plusServer={data.plusInfo.users_membership}
          showSuggestionForm={showSuggestionForm}
          setShowSuggestionForm={setShowSuggestionForm}
        />
      )}
    </>
  )
}

export default PlusPage
