// src/config/routes.js
import React from "react";
import Home from "../page/Home";
import About from "../page/About";
import LoginF from "../page/LoginF";
import ApplicantF from "../page/ApplicantF";
import HRF from "../page/HRF";
import JobL from "../page/JobL";
import JobDetails from "../page/JobDetails";
import jobs from "../page/JobL/jobs.json";
import AiInterviewIntro from "../page/AiInterviewIntro";
import AiInterviewMain from "../page/AiInterviewMain";

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
  { path: "/login", element: <LoginF /> },
  { path: "/applicant", element: <ApplicantF /> },
  { path: "/hrf", element: <HRF /> },
  { path: "/joblist", element: <JobL /> },
  { path: "/jobdetail", element: <JobDetails /> },
  ...jobs.map((job) => ({
    path: `/${job.id}`,
    element: <JobDetails jobId={job.id} />,
  })),
  ...jobs.map((job) => ({
    path: `/ai-${job.id}`,
    element: <AiInterviewIntro jobId={job.id} />,
  })),
  ...jobs.map((job) => ({
    path: `/main-ai-${job.id}`,
    element: <AiInterviewMain jobId={job.id} />,
  })),
];
