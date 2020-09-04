import React, { useEffect, useState, useContext } from "react"
import { RouteComponentProps } from "@reach/router"
import { Helmet } from "react-helmet-async"
import PageHeader from "../common/PageHeader"
import { Box, Flex, Progress, Badge } from "@chakra-ui/core"
import Select from "../elements/Select"
import { languages } from "../../utils/lists"
import MyThemeContext from "../../themeContext"
import Input from "../elements/Input"
import Button from "../elements/Button"
import { FaDownload } from "react-icons/fa"

const exportToJson = (
  objectData: Object,
  locale: string,
  dateString: string
) => {
  let filename = `translation_${locale}_${dateString}.json`
  let contentType = "application/json;charset=utf-8;"
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    var blob = new Blob(
      [decodeURIComponent(encodeURI(JSON.stringify(objectData)))],
      { type: contentType }
    )
    navigator.msSaveOrOpenBlob(blob, filename)
  } else {
    var a = document.createElement("a")
    a.download = filename
    a.href =
      "data:" +
      contentType +
      "," +
      encodeURIComponent(JSON.stringify(objectData))
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

const TranslatePage: React.FC<RouteComponentProps> = () => {
  const { themeColorWithShade, themeColor } = useContext(MyThemeContext)
  const [english, setEnglish] = useState<any>(null)
  const [toTranslate, setToTranslate] = useState<any>(null)
  const [languageDropdownValue, setLanguageDropdownValue] = useState<
    string | null
  >(null)
  const [selectedKey, setSelectedKey] = useState("game")

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/Sendouc/sendou-ink/master/frontend-react/public/locales/en/translation.json"
    )
      .then((response) => response.json())
      .then((data) => setEnglish(data))
  }, [])

  useEffect(() => {
    if (!languageDropdownValue) return
    fetch(
      `https://raw.githubusercontent.com/Sendouc/sendou-ink/master/frontend-react/public/locales/${languageDropdownValue}/translation.json`
    )
      .then((response) => response.json())
      .then((data) => {
        const dataFromLocalStorage = localStorage.getItem(
          `translation_${languageDropdownValue}`
        )

        setToTranslate(
          dataFromLocalStorage ? JSON.parse(dataFromLocalStorage) : data
        )
      })
  }, [languageDropdownValue])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!languageDropdownValue || !toTranslate) return
      localStorage.setItem(
        `translation_${languageDropdownValue}`,
        JSON.stringify(toTranslate)
      )
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [toTranslate, languageDropdownValue])

  const getPercentage = (keyToCheck: any) => {
    if (!english || !toTranslate) return 0
    let englishCount = 0
    let translatedCount = 0

    for (const entry of Object.entries(english[keyToCheck] ?? {})) {
      if (entry[1]) englishCount++
    }

    for (const entry of Object.entries(toTranslate[keyToCheck] ?? {})) {
      if (entry[1]) translatedCount++
    }

    return Math.ceil((translatedCount / englishCount) * 100)
  }

  const englishViewed = english ? english[selectedKey] ?? {} : {}
  const toTranslateViewed = toTranslate ? toTranslate[selectedKey] ?? {} : {}

  return (
    <>
      <Helmet>
        <title>Translate | sendou.ink</title>
      </Helmet>
      <PageHeader title="Translate" />
      <Box mt="1em">
        <Select
          label="Language to translate"
          options={languages.map((language) => ({
            label: language.name,
            value: language.code,
          }))}
          setValue={(value) => setLanguageDropdownValue(value)}
        />
      </Box>
      {english && toTranslate && (
        <>
          <Flex mt="1em" flexWrap="wrap">
            {Object.keys(english).map((key) => {
              const percentage = getPercentage(key)
              const active = selectedKey === key
              return (
                <Box
                  onClick={() => setSelectedKey(key)}
                  key={key}
                  w="150px"
                  rounded="lg"
                  overflow="hidden"
                  boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
                  p="20px"
                  m="20px"
                  textTransform="capitalize"
                  textAlign="center"
                  border="2px solid"
                  borderColor={active ? themeColorWithShade : null}
                  cursor="pointer"
                >
                  {key}
                  <Progress
                    mt="1em"
                    hasStripe
                    isAnimated
                    color={percentage === 100 ? "green" : "yellow"}
                    size="sm"
                    value={percentage}
                  />
                </Box>
              )
            })}
          </Flex>
          <Box mt="1em">
            <Button
              icon={FaDownload}
              onClick={() =>
                exportToJson(
                  toTranslate,
                  languageDropdownValue!,
                  new Date().toDateString()
                )
              }
            >
              Download
            </Button>
          </Box>
          <Box mt="1em">
            {Object.keys(englishViewed).map((key) => (
              <Box key={key} my="1em">
                <Box>
                  {englishViewed[key]}
                  {englishViewed[key] !== key && (
                    <Badge
                      variantColor={themeColor}
                      textTransform="none"
                      ml="0.5em"
                    >
                      {key}
                    </Badge>
                  )}
                </Box>
                <Box>
                  <Input
                    label=""
                    value={toTranslateViewed[key] ?? ""}
                    setValue={(value) => {
                      if (value === "") {
                        const keysObject = toTranslate[selectedKey] ?? {}
                        delete keysObject[key]

                        const newToTranslate = { ...toTranslate }
                        if (Object.keys(keysObject).length === 0) {
                          delete newToTranslate[selectedKey]
                        }

                        setToTranslate(newToTranslate)
                      } else {
                        setToTranslate({
                          ...toTranslate,
                          [selectedKey]: {
                            ...toTranslate[selectedKey],
                            [key]: value,
                          },
                        })
                      }
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </>
  )
}

export default TranslatePage
