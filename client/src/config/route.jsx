import React from "react";

import About from "../pages/About";
import AIInterview from "../pages/AIInterview";
import AIIntroductionPage from "../pages/AIIntroductionPage";
import ApplicantRegistration from "../pages/ApplicantRegistration";
import Home from "../pages/Home";
import HRRegistration from "../pages/HRRegistration";
import JobDescription from "../pages/JobDescription";
import JobList from "../pages/JobList";
import Login from "../pages/Login";
import Thankyou from "../pages/Thankyou";
import CreateJob from "../pages/CreateJob";
import PostedJob from "../pages/PostedJobs";
import ViewCandiates from "../pages/ViewCandiates";

export const routes = [
  { path: "/", element: <Home />, ws: false },
  { path: "/about", element: <About />, ws: false },
  { path: "/login", element: <Login />, ws: false },

  {
    path: "/applicant",
    element: <ApplicantRegistration />,
    ws: false,
  },
  { path: "/hrf", element: <HRRegistration />, ws: false },

  { path: "/job/applicant", element: <JobList />, ws: false },
  { path: "/jobdetail/:id", element: <JobDescription />, ws: false },

  { path: "/ai-interview/:id", element: <AIIntroductionPage />, ws: true },
  { path: "/main-ai/:id", element: <AIInterview />, ws: true },

  { path: "/main-ai/thankyou", element: <Thankyou />, ws: false },
  { path: "/hr/create_job", element: <CreateJob />, ws: false },
  { path: "/hr/posted-jobs", element: <PostedJob />, ws: false },
  {
    path: "/hr/posted-jobs/view-candiates/:id",
    element: <ViewCandiates />,
    ws: false,
  },
];
