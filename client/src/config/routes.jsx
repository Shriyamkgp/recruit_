// src/config/routes.js
import React from "react";
import Home from "../page/Home";
import About from "../page/About";
import LoginF from "../page/LoginF";
import ApplicantF from "../page/ApplicantF";
import HRF from "../page/HRF";
import JobL from "../page/JobL";

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/login", element: <LoginF /> },
  { path: "/applicant", element: <ApplicantF /> },
  { path: "/hrf", element: <HRF /> },
  { path: "/joblist", element: <JobL /> },
];
