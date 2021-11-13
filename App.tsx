import { Router } from "solid-app-router";
import type { Component } from "solid-js";
import { Routes } from "./Routes";
import { Layout } from "./scenes/layout/components/Layout";

const App: Component = () => {
  return (
    <Router>
      <Layout>
        <Routes />
      </Layout>
    </Router>
  );
};

export default App;
