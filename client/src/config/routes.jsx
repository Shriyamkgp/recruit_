// src/config/routes.js
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
import Thankyou from "../page/Thankyou";

export const routes = [
  { path: "/", element: <Home />, ws: false },
  { path: "/about", element: <About />, ws: false },
  { path: "/login", element: <LoginF />, ws: false },
  { path: "/applicant", element: <ApplicantF />, ws: false },
  { path: "/hrf", element: <HRF />, ws: false },
  { path: "/joblist", element: <JobL />, ws: false },
  { path: "/thankyou", element: <Thankyou />, ws: false },
  { path: "/jobdetail", element: <JobDetails />, ws: false },
  ...jobs.map((job) => ({
    path: `/${job.id}`,
    element: <JobDetails jobId={job.id} />,
    ws: false,
  })),

  ...jobs.map((job) => ({
    path: `/ai-${job.id}`,
    element: <AiInterviewIntro jobId={job.id} />,
    ws: true,
  })),

  ...jobs.map((job) => ({
    path: `/main-ai-${job.id}`,
    element: <AiInterviewMain jobId={job.id} />,
    ws: true,
  })),
];
