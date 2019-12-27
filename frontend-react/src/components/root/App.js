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
        <div
          style={{
            background: "white",
            padding: "2em 3em",
            margin: "0 -2em 0 -2em",
            borderRadius: "7px",
          }}
        >
          <Routes />
        </div>
      </Container>
      <Footer />
    </div>
  )
}

export default App
