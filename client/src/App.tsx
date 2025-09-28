import React from "react";
import Home from "./page/Home";
import LoginF from "./page/LoginF";
import About from "./page/About";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LoginF />} />
      </Routes>
    </>
  );
}

export default App;
