import { Router } from "solid-app-router";
import type { Component } from "solid-js";
import { Routes } from "./Routes";
import { Layout } from "./old/scenes/layout/components/Layout";
import { UserProvider } from "./old/utils/UserContext";

const App: Component = () => {
  return (
    <Router>
      <UserProvider>
        <Layout>
          <Routes />
        </Layout>
      </UserProvider>
    </Router>
  );
};

export default App;
