import React from "react"
import { Container } from "semantic-ui-react"
import MainMenu from "./MainMenu"
import Footer from "./Footer"
import Routes from "./Routes"

const App = () => {
  return (
    <div style={{ paddingTop: "0.3em" }}>
      <MainMenu />
      <Container>
        <Routes />
      </Container>
      <Footer />
    </div>
  )
}

export default App
