//https://stackoverflow.com/questions/42118296/dynamically-import-images-from-a-directory-using-webpack
export const wpnSmall: object = importAll(require.context("./wpnSmall", false))
export const wpnMedium: object = importAll(
  require.context("./wpnMedium", false)
)

function importAll(r: __WebpackModuleApi.RequireContext) {
  const images: any = {}
  r.keys().forEach(item => {
    images[item.substring(6, item.length - 4)] = r(item)
  })
  return images
}
