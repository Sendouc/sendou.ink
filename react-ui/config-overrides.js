// https://ant.design/docs/react/use-with-create-react-app

const { override, fixBabelImports, addLessLoader } = require("customize-cra")

module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: { '@primary-color': '#141163'}
  })
)
