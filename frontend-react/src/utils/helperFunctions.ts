export function choose(choices: any[]) {
  var index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

export function ordinal_suffix_of(i: number) {
  var j = i % 10,
    k = i % 100
  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}

export function importAll(r: __WebpackModuleApi.RequireContext) {
  const images: any = {}
  r.keys().forEach((item) => {
    images[item.substring(6, item.length - 4)] = r(item)
  })
  return images
}

// https://coderwall.com/p/urxpsa/remove-falsy-values-or-empty-strings-from-javascript-objects
export const removeFalsy = (obj: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {}
  Object.keys(obj).forEach((prop: any) => {
    if (obj[prop]) {
      newObj[prop] = obj[prop]
    }
  })
  return newObj
}

// https://stackoverflow.com/a/31810991
export const getWeek = (date: Date) => {
  const onejan = new Date(date.getFullYear(), 0, 1)
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayOfYear = (today.getTime() - onejan.getTime() + 86400000) / 86400000
  return Math.ceil(dayOfYear / 7)
}
