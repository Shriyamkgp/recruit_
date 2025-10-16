import React from "react";
import { Routes, Route } from "react-router-dom";
import { routes } from "./config/route";
import { WebSocketProvider } from "./components/WebSocketContext";

function AppRoutes() {
  return (
    <Routes>
      {routes.map((route: any, index: any) => (
        <Route
          key={index}
          path={route.path}
          element={
            route.ws === true ? (
              <WebSocketProvider>{route.element}</WebSocketProvider>
            ) : (
              route.element
            )
          }
        />
      ))}
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
