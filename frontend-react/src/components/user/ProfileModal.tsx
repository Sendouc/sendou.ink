import { useMutation } from "@apollo/client"
import { Box, useToast } from "@chakra-ui/core"
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { UPDATE_USER } from "../../graphql/mutations/updateUser"
import MyThemeContext from "../../themeContext"
import { Weapon } from "../../types"
import { countries } from "../../utils/lists"
import WeaponSelector from "../common/WeaponSelector"
import Button from "../elements/Button"
import Input from "../elements/Input"
import Label from "../elements/Label"
import Modal from "../elements/Modal"
import Select from "../elements/Select"
import MarkdownInput from "./MarkdownInput"
import SensInput from "./SensInput"

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
  const { t } = useTranslation()
  const [profile, setProfile] = useState<UpdateUserVars>(existingProfile)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    if (
      profile.motion_sens !== null &&
      !profile.stick_sens &&
      profile.stick_sens !== 0
    ) {
      setError(t("users;Motion sensitivity entered without stick sensitivity"))
    } else if (profile.custom_url && profile.custom_url.length < 2) {
      setError(t("users;Custom URL has to be over 2 characters long"))
    } else if (profile.custom_url && profile.custom_url.length > 32) {
      setError(t("users;Custom URL can be at most 32 characters long"))
    } else if (profile.custom_url && !isNaN(profile.custom_url as any)) {
      setError(t("users;Custom URL has to contain at least one letter"))
    } else if (
      profile.custom_url &&
      !/^[a-z0-9]+$/i.test(profile.custom_url as any)
    ) {
      setError(t("users;Custom URL can only contain letters and numbers"))
    } else if (profile.weapons && profile.weapons.length > 5) {
      setError(t("users;Weapon pool's max size is 5"))
    } else if (profile.bio && profile.bio.length > 10000) {
      setError(t("users;Bio's max length is 10000"))
    } else {
      setError(null)
    }
  }, [profile, t])

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
          description: t("users;Profile updated"),
          position: "top-right",
          status: "success",
          duration: 10000,
        })
      },
      onError: (error) => {
        toast({
          title: t("An error occurred"),
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
    <Modal title={t("users;Editing profile")} closeModal={closeModal}>
      <Box display="flex" flexDirection="column">
        <Box>
          <Label>{t("users;Profile picture")}</Label>
          {t("users;profilePicExplanation")}
        </Box>
        <Box mt="1em">
          <Input
            label={t("users;Custom URL")}
            textLeft="https://sendou.ink/u/"
            value={profile.custom_url ?? ""}
            disabled={!!existingProfile.custom_url}
            setValue={(value: string) => handleChange({ custom_url: value })}
          />
          <Box color={grayWithShade} mt="0.5em" fontSize="15px">
            {t(
              "users;Please note Custom URL can't be updated after you have set it."
            )}
          </Box>
        </Box>
        <Box mt="1em">
          <Select
            label={t("users;Country")}
            isSearchable
            value={
              profile.country
                ? {
                    value: profile.country,
                    label: t(`countries;${profile.country.toUpperCase()}`),
                  }
                : null
            }
            setValue={(country: string) => handleChange({ country: country })}
            options={countries.map((countryObj) => ({
              label: t(`countries;${countryObj.toUpperCase()}`),
              value: countryObj,
            }))}
          />
        </Box>
        <Box display="flex" mt="1em" flexWrap="wrap">
          <Box mr="1em">
            <SensInput
              label={t("users;Stick sensitivity")}
              value={profile.stick_sens}
              onChange={(value) => handleChange({ stick_sens: value })}
            />
          </Box>
          <SensInput
            label={t("users;Motion sensitivity")}
            value={profile.motion_sens}
            onChange={(value) => handleChange({ motion_sens: value })}
          />
        </Box>
        <Box mt="1em">
          <WeaponSelector
            label={t("users;Weapon pool")}
            isMulti
            setValue={(value: Weapon[]) => handleChange({ weapons: value })}
            value={profile.weapons}
            showAlts
          />
        </Box>
        <Box mt="1em">
          <MarkdownInput
            label={t("users;Bio")}
            value={profile.bio ?? ""}
            setValue={(value: string) => handleChange({ bio: value })}
            limit={10000}
          />
          <Box color={grayWithShade} mt="0.5em" fontSize="15px">
            {t("users;markdownPrompt")}{" "}
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
            {t("users;Submit")}
          </Button>
          <Box as="span" ml="0.5em">
            <Button outlined onClick={() => closeModal()}>
              {t("users;Cancel")}
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
