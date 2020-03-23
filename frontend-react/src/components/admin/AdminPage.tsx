import React, { useState } from "react"
import PageHeader from "../common/PageHeader"
import { RouteComponentProps, Redirect } from "@reach/router"
import { useQuery, useMutation } from "@apollo/react-hooks"
import { UserData } from "../../types"
import { USER } from "../../graphql/queries/user"
import Loading from "../common/Loading"
import Error from "../common/Error"
import {
  UPDATE_TWITTER,
  UpdateTwitterVars,
} from "../../graphql/mutations/updateTwitter"
import { useToast, Heading, Flex, Box } from "@chakra-ui/core"
import Input from "../elements/Input"
import Button from "../elements/Button"

const AdminPage: React.FC<RouteComponentProps> = ({}) => {
  const [updateTwitterForms, setUpdateTwitterForms] = useState<
    Partial<UpdateTwitterVars>
  >({})
  const toast = useToast()
  const { data: userData, error: userError, loading: userLoading } = useQuery<
    UserData
  >(USER)

  const [updateTwitter] = useMutation<
    { updateTwitter: boolean },
    UpdateTwitterVars
  >(UPDATE_TWITTER, {
    variables: updateTwitterForms as UpdateTwitterVars,
    onCompleted: data => {
      toast({
        description: "Twitter updated",
        position: "top-right",
        status: "success",
        duration: 10000,
      })
    },
    onError: error => {
      toast({
        title: "An error occurred",
        description: error.message,
        position: "top-right",
        status: "error",
        duration: 10000,
      })
    },
  })

  if (userError) return <Error errorMessage={userError.message} />
  if (userLoading) return <Loading />
  if (!userData!.user) return <Redirect to="/404" />
  if (userData!.user.discord_id !== "79237403620945920")
    return <Redirect to="/404" />

  return (
    <>
      <PageHeader title="Admin" />
      <Heading>Update Twitter</Heading>
      <Flex my="1em">
        <Box mr="1em">
          <Input
            value={updateTwitterForms.unique_id ?? ""}
            setValue={value =>
              setUpdateTwitterForms({ ...updateTwitterForms, unique_id: value })
            }
            label="Unique ID"
          />
        </Box>
        <Input
          value={updateTwitterForms.twitter ?? ""}
          setValue={value =>
            setUpdateTwitterForms({ ...updateTwitterForms, twitter: value })
          }
          label="Twitter"
        />
      </Flex>
      <Button onClick={() => updateTwitter()}>Submit</Button>
    </>
  )
}

export default AdminPage
