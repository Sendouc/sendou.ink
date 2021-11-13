import { Router } from "solid-app-router";
import type { Component } from "solid-js";
import Layout from "./scenes/layout";

const App: Component = () => {
  return (
    <Router>
      <Layout>routes here</Layout>
    </Router>
  );
};

export default App;
