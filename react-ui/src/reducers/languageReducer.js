import LocalizedStrings from 'react-localization'
import translation from '../translation.json'

const initialState = () => {
  const strings = new LocalizedStrings(translation)
  const languagePreference = window.localStorage.getItem(
    "languagePreference"
  )
  if (languagePreference) strings.setLanguage(languagePreference)
  return strings
}

const languageReducer = (state = initialState(), action) => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      const newStringsObj = state
      newStringsObj.setLanguage(action.languageCode)
      window.localStorage.setItem(
        "languagePreference",
        action.languageCode
      )
      return newStringsObj
    default:
      return state
  }
}

export default languageReducer