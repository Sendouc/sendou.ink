import { createStore, combineReducers } from 'redux'

import languageReducer from './reducers/languageReducer'

const reducer = combineReducers({
  localization: languageReducer,
})

const store = createStore(reducer)

export default store