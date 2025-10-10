import React from "react";
import { Routes, Route } from "react-router-dom";
import { routes } from "./config/routes.jsx";
import { WebSocketProvider } from "./components/webSockerContext";

function App() {
  return (
    <Routes>
      {routes.map((route: any, index: any) => (
        <Route
          key={index}
          path={route.path}
          element={
            // Conditionally wrap the element
            route.ws === true ? (
              <WebSocketProvider>{route.element}</WebSocketProvider>
            ) : (
              route.element
            )
          }
        />
      ))}
    </Routes>
  );
}

export default App;
