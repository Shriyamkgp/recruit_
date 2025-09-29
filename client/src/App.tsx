import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { routes } from "./config/routes.jsx";

function App() {
  return (
    <>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </>
  );
}

export default App;
