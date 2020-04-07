import React, { useState } from "react"
import Modal from "../elements/Modal"
import Box from "../elements/Box"
import Label from "../elements/Label"
import Input from "../elements/Input"
import { useMutation } from "@apollo/react-hooks"
import { UPDATE_USER } from "../../graphql/mutations/updateUser"
import { Weapon } from "../../types"
import { useToast } from "@chakra-ui/core"
import Select from "../elements/Select"
import { countries } from "../../utils/lists"
import SensInput from "./SensInput"
import WeaponSelector from "../common/WeaponSelector"
import Button from "../elements/Button"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import { useEffect } from "react"
import MarkdownInput from "./MarkdownInput"

interface ProfileModalProps {
  closeModal: () => void
  existingProfile: UpdateUserVars
}

interface UpdateUserVars {
  country?: string
  motion_sens?: number
  stick_sens?: number
  weapons?: Weapon[]
  custom_url?: string
  bio?: string
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  closeModal,
  existingProfile,
}) => {
  const { grayWithShade } = useContext(MyThemeContext)
  const [profile, setProfile] = useState<UpdateUserVars>(existingProfile)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    if (
      profile.motion_sens !== null &&
      !profile.stick_sens &&
      profile.stick_sens !== 0
    ) {
      setError("Motion sensitivity entered without stick sensitivity")
    } else if (profile.custom_url && profile.custom_url.length < 2) {
      setError("Custom URL has to be over 2 characters long")
    } else if (profile.custom_url && profile.custom_url.length > 32) {
      setError("Custom URL can be at most 32 characters long")
    } else if (profile.custom_url && !isNaN(profile.custom_url as any)) {
      setError("Custom URL has to contain at least one letter")
    } else if (
      profile.custom_url &&
      !/^[a-z0-9]+$/i.test(profile.custom_url as any)
    ) {
      setError("Custom URL can only contain letters and numbers")
    } else if (profile.weapons && profile.weapons.length > 5) {
      setError("Weapon pool's max size is 5")
    } else if (profile.bio && profile.bio.length > 10000) {
      setError("Bio's max length is 10000")
    } else {
      setError(null)
    }
  }, [profile])

  const handleChange = (newValueObject: UpdateUserVars) => {
    setProfile({ ...profile, ...newValueObject })
  }

  const [updateUser, { loading }] = useMutation<boolean, UpdateUserVars>(
    UPDATE_USER,
    {
      variables: profile,
      onCompleted: () => {
        closeModal()
        toast({
          description: "Profile updated",
          position: "top-right",
          status: "success",
          duration: 10000,
        })
      },
      onError: (error) => {
        toast({
          title: "An error occurred",
          description: error.message,
          position: "top-right",
          status: "error",
          duration: 10000,
        })
      },
      refetchQueries: ["searchForUser"],
    }
  )

  return (
    <Modal title="Editing profile" closeModal={closeModal}>
      <Box display="flex" flexDirection="column">
        <Box>
          <Label>Profile picture</Label>
          Your profile picture comes from your Twitter account. In order to get
          it showing verify your Twitter account on Discord, log out and back in
          on sendou.ink.
        </Box>
        <Box mt="1em">
          <Input
            label="Custom URL"
            textLeft="https://sendou.ink/u/"
            value={profile.custom_url ?? ""}
            disabled={!!existingProfile.custom_url}
            setValue={(value: string) => handleChange({ custom_url: value })}
          />
          <Box color={grayWithShade} mt="0.5em" fontSize="15px">
            Please note Custom URL can't be updated after you have set it.
          </Box>
        </Box>
        <Box mt="1em">
          <Select
            label="Country"
            isSearchable
            value={
              profile.country
                ? {
                    value: profile.country,
                    label: countries.find(
                      (obj) => obj.code === profile.country
                    )!.name,
                  }
                : null
            }
            setValue={(country: string) => handleChange({ country: country })}
            options={countries.map((countryObj) => ({
              label: countryObj.name,
              value: countryObj.code,
            }))}
          />
        </Box>
        <Box display="flex" mt="1em" flexWrap="wrap">
          <Box mr="1em">
            <SensInput
              label="Stick sensitivity"
              value={profile.stick_sens}
              onChange={(value) => handleChange({ stick_sens: value })}
            />
          </Box>
          <SensInput
            label="Motion sensitivity"
            value={profile.motion_sens}
            onChange={(value) => handleChange({ motion_sens: value })}
          />
        </Box>
        <Box mt="1em">
          <WeaponSelector
            label="Weapon pool"
            isMulti
            setValue={(value: Weapon[]) => handleChange({ weapons: value })}
            value={profile.weapons}
          />
        </Box>
        <Box mt="1em">
          <MarkdownInput
            value={profile.bio ?? ""}
            setValue={(value: string) => handleChange({ bio: value })}
            label="Bio"
            limit={10000}
          />
          <Box color={grayWithShade} mt="0.5em" fontSize="15px">
            Markdown is supported. See:{" "}
            <a href="/markdown" target="_blank" rel="noreferrer noopener">
              https://sendou.ink/markdown
            </a>
          </Box>
        </Box>
        <Box mt="1em">
          <Button
            onClick={() => updateUser()}
            disabled={!!error}
            loading={loading}
          >
            Submit
          </Button>
          <Box as="span" ml="0.5em">
            <Button outlined onClick={() => closeModal()}>
              Cancel
            </Button>
          </Box>
        </Box>
        {error && (
          <Box as="span" mt="0.5em" color="red.500">
            {error}
          </Box>
        )}
      </Box>
    </Modal>
  )
}

export default ProfileModal
