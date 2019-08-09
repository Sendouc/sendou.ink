import { useReducer, useEffect } from "react"
import { useQuery } from "@apollo/react-hooks"
import { searchForTrend } from "../../graphql/queries/seachForTrend"

const month = []
month[0] = null
month[1] = "Jan"
month[2] = "Feb"
month[3] = "Mar"
month[4] = "Apr"
month[5] = "May"
month[6] = "Jun"
month[7] = "Jul"
month[8] = "Aug"
month[9] = "Sep"
month[10] = "Oct"
month[11] = "Nov"
month[12] = "Dec"

const patches = {
  5: {
    2018: {
      name: "3.0",
      link: "https://splatoonwiki.org/wiki/Version_3.0.0_(Splatoon_2)"
    },
    2019: {
      name: "4.8",
      link: "https://splatoonwiki.org/wiki/Version_4.8.0_(Splatoon_2)"
    }
  },
  6: {
    2018: {
      name: "3.1",
      link: "https://splatoonwiki.org/wiki/Version_3.1.0_(Splatoon_2)"
    },
    2019: {
      name: "4.9",
      link: "https://splatoonwiki.org/wiki/Version_4.9.0_(Splatoon_2)"
    }
  },
  7: {
    2018: {
      name: "3.2",
      link: "https://splatoonwiki.org/wiki/Version_3.2.0_(Splatoon_2)"
    },
    2019: {
      name: "5.0",
      link: "https://splatoonwiki.org/wiki/Version_5.0.0_(Splatoon_2)"
    }
  },
  9: {
    2018: {
      name: "4.0",
      link: "https://splatoonwiki.org/wiki/Version_4.0.0_(Splatoon_2)"
    }
  },
  10: {
    2018: {
      name: "4.1",
      link: "https://splatoonwiki.org/wiki/Version_4.1.0_(Splatoon_2)"
    }
  },
  11: {
    2018: {
      name: "4.2",
      link: "https://splatoonwiki.org/wiki/Version_4.2.0_(Splatoon_2)"
    }
  },
  12: {
    2018: {
      name: "4.3",
      link: "https://splatoonwiki.org/wiki/Version_4.3.0_(Splatoon_2)"
    }
  },
  1: {
    2019: {
      name: "4.4",
      link: "https://splatoonwiki.org/wiki/Version_4.4.0_(Splatoon_2)"
    }
  },
  3: {
    2019: {
      name: "4.5",
      link: "https://splatoonwiki.org/wiki/Version_4.5.0_(Splatoon_2)"
    }
  },
  4: {
    2019: {
      name: "4.6+4.7",
      link: "https://splatoonwiki.org/wiki/List_of_updates_in_Splatoon_2"
    }
  }
}

const presetColors = [
  "#FF00FF",
  "#008000",
  "#FF0000",
  "#0000FF",
  "#FFA500",
  "#800080",
  "#A52A2A",
  "#1BC5CD",
  "#000080",
  "#5BCCA0"
]

const setPlotDataInitial = () => {
  const arr_to_return = []
  for (let i = 5; i < 13; i++) {
    if (patches.hasOwnProperty(i) && patches[i].hasOwnProperty(2018)) {
      arr_to_return.push({
        name: i,
        year: 2018,
        xLabel: month[i],
        patch: patches[i][2018].name
      })
    } else {
      arr_to_return.push({ name: i, year: 2018, xLabel: month[i] })
    }
  }
  const d = new Date()
  const year = d.getFullYear()
  const currentMonth = d.getMonth() + 1
  for (let i = 2019; i < year + 1; i++) {
    for (let j = 1; j < 13; j++) {
      // break the loop when we reach the future
      if (i === year && j === currentMonth) break
      const xLabel = j === 1 ? `Jan (${year})` : month[j]
      if (patches.hasOwnProperty(j) && patches[j].hasOwnProperty(i)) {
        arr_to_return.push({
          name: j,
          year: i,
          xLabel,
          patch: patches[j][i].name
        })
      } else {
        arr_to_return.push({ name: j, year: i, xLabel })
      }
    }
  }

  return arr_to_return
}

const mergeModeArrays = countObj => {
  const sz_arr = countObj["SZ"]
  const tc_arr = countObj["TC"]
  const rm_arr = countObj["RM"]
  const cb_arr = countObj["CB"]
  const arr_to_return = new Array(12).fill(0)
  for (let i = 1; i < 13; i++) {
    arr_to_return[i] = sz_arr[i] + tc_arr[i] + rm_arr[i] + cb_arr[i]
  }
  return arr_to_return
}

// monthIndex is between 1 and 12 (inclusive)
const resolveStartIndex = (monthIndex, year) => {
  // resolves start index for an array where index 0 is always May 2018
  if (year === 2018) {
    return monthIndex - 5
  } else if (year === 2019) {
    return 7 + monthIndex
  } else {
    return 7 + monthIndex + (year - 2019) * 12
  }
}

const getColor = state => {
  if (state.keys.length < 9) {
    return presetColors[state.keys.length]
  }

  return "#000000".replace(/0/g, function() {
    return (~~(Math.random() * 16)).toString(16)
  })
}

const reducer = (state, action) => {
  switch (action.type) {
    case "add":
      const trend = action.trendDocument
      const mode = action.mode
      const modeLabel = mode === "ALL" ? "" : ` (${mode})`
      const weapon = `${action.trendDocument.weapon}${modeLabel}`
      // don't add duplicate plots
      if (state.keys.indexOf(weapon) !== -1) return state
      const toPlotData = [...state.data]
      for (let index = 0; index < trend.counts.length; index++) {
        let year = trend.counts[index].year
        let year_arr = null
        if (mode === "ALL") {
          year_arr = mergeModeArrays(trend.counts[index])
        } else {
          year_arr = trend.counts[index][mode]
        }

        for (let i = 1; i < 13; i++) {
          // if year is 2018 skipping to the index where values are found
          if (year === 2018 && i < 5) {
            i = 4
            continue
          }
          const plotIndex = resolveStartIndex(i, year)
          if (plotIndex === toPlotData.length) break
          toPlotData[plotIndex][weapon] = year_arr[i]
        }
      }

      const keyObj = {
        weapon,
        color: getColor(state)
      }
      return { data: toPlotData, keys: [...state.keys, keyObj] }
    case "delete":
      const weaponToDelete = action.weapon
      const newKeys = [...state.keys].filter(k => k.weapon !== weaponToDelete)
      return { data: state.data, keys: newKeys }
    case "combine":
      const weaponLeft = action.left
      const weaponRight = action.right
      const newKey = `${weaponLeft} + ${weaponRight}`
      const newKeysWithCombined = [
        ...state.keys,
        { weapon: newKey, color: getColor(state) }
      ].filter(k => k.weapon !== weaponLeft && k.weapon !== weaponRight)
      const newDataWithCombined = [...state.data].map(d => {
        const dataObj = { ...d }
        let weaponLeftCount = 0
        let weaponRightCount = 0
        if (dataObj.hasOwnProperty(weaponLeft))
          weaponLeftCount = dataObj[weaponLeft]
        if (dataObj.hasOwnProperty(weaponRight))
          weaponRightCount = dataObj[weaponRight]
        dataObj[newKey] = weaponLeftCount + weaponRightCount
        delete dataObj[weaponLeft]
        delete dataObj[weaponRight]
        return dataObj
      })

      return { data: newDataWithCombined, keys: newKeysWithCombined }
    case "randomizeColor":
      const keysWithNewColor = [...state.keys].map(k => {
        if (k.weapon !== action.weapon) {
          return k
        }
        return {
          ...k,
          color: "#000000".replace(/0/g, function() {
            return (~~(Math.random() * 16)).toString(16)
          })
        }
      })
      return { data: state.data, keys: keysWithNewColor }
    default:
      throw new Error()
  }
}

export default function useTrends(weapon, mode) {
  const [plotData, dispatch] = useReducer(reducer, {
    data: setPlotDataInitial(),
    keys: []
  })
  // Skip query if there is no weapon provided
  const { data, loading, error } = useQuery(searchForTrend, {
    skip: !weapon,
    variables: { weapon }
  })

  useEffect(() => {
    if (loading || !data) return
    dispatch({ type: "add", trendDocument: data.searchForTrend, mode })
  }, [loading, data, mode])

  return { loading, error, plotData, dispatch }
}
