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
      const newStringsObj = action.state
      newStringsObj.setLanguage(action.languageCode)
      window.localStorage.setItem(
        "languagePreference",
        action.languageCode
      )
      return action.filter
    default:
      return state
  }
}

export const languageChange = (languageCode) => {
  return {
    type: 'SET_LANGUAGE',
    languageCode,
  }
}

export default languageReducer