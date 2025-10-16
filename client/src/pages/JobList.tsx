import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import Header from "../components/Header";

// Import the centralized API service

import * as RecruitApi from "@/api/RecruitApi";

// --- Types ---

interface Job {
  _id: string;

  title: string;

  companyName: string;

  location: string;

  // Note: Added salary back as it is typically needed in job listings

  salary?: { min: number; max: number };
}

interface Application {
  _id: string;

  jobId: string;

  applicantId: string;

  status: string;
}

// Assume the API response has a 'jobs' property

interface JobsApiResponse {
  jobs: Job[];

  success: boolean;
}

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [userApplications, setUserApplications] = useState<Application[]>([]);

  // Use the specific ID key from session storage as determined earlier

  const currentApplicantId = sessionStorage.getItem("applicantId");

  // --- Data Fetching Effects ---

  // 1. Fetch All Jobs

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        setError(null);

        // Use the centralized API function to fetch all jobs

        const responseData: JobsApiResponse = await RecruitApi.getAllJobs();

        if (responseData && Array.isArray(responseData.jobs)) {
          setJobs(responseData.jobs);
        } else {
          setJobs([]);

          console.error(
            "API response did not contain expected job array.",

            responseData
          );
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);

        setError("Failed to load available job postings.");

        setJobs([]);
      }
    };

    fetchJobs();
  }, []);

  // 2. Fetch Current User's Applications

  useEffect(() => {
    // Only fetch applications if an applicantId is available

    if (currentApplicantId) {
      const fetchApplications = async () => {
        try {
          const applicationResponse =
            await RecruitApi.getApplicationsByApplicant(currentApplicantId);

          // Assuming the API returns an object with an 'applications' array

          if (applicationResponse?.applications) {
            setUserApplications(applicationResponse.applications);
          }
        } catch (err) {
          console.error("Error fetching user applications:", err);

          // Don't set error state, just log it, as jobs should still display.
        }
      };

      fetchApplications();
    }

    // Note: setLoading(false) is intentionally in the job fetch effect,

    // as the main page content depends on the jobs being loaded.
  }, [currentApplicantId]);

  // Once both jobs and applications are potentially loaded, stop the main spinner.

  useEffect(() => {
    if (!loading) return; // Only run once loading is pending

    if (jobs.length > 0 || error !== null) {
      setLoading(false);
    }
  }, [jobs, error, loading]);

  // --- Render Status ---

  if (loading)
    return (
      <div className="text-center p-10 font-medium text-indigo-600">
        Loading job list...
      </div>
    );

  if (error)
    return (
      <div className="text-center p-10 text-red-500 font-semibold">
        Error: {error}
      </div>
    );

  if (!jobs.length)
    return (
      <div className="text-center p-10 text-gray-500">
        No jobs currently posted.
      </div>
    );

  // --- Helper Function ---

  const checkApplicationStatus = (jobId: string): Application | undefined => {
    return userApplications.find((app) => app.jobId === jobId);
  };

  // --- Render Job List ---

  return (
    <>
      <Header />

      <div className="p-4 md:p-10 max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b pb-2 text-center">
          Available Job Opportunities
        </h1>

        <ul className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: Job) => {
            const appliedApplication = checkApplicationStatus(job._id);

            const jobCardContent = (
              <div className="job-list-item bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center mb-3">
                    <span
                      role="img"
                      aria-label="briefcase"
                      className="mr-3 text-2xl"
                    >
                      💼
                    </span>

                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {job.title}
                    </h2>
                  </div>

                  <p className="text-gray-600 mb-1">
                    <span className="font-semibold">Company:</span>{" "}
                    {job.companyName}
                  </p>

                  <p className="text-gray-500 text-sm mb-4">
                    <span className="font-semibold">Location:</span>{" "}
                    {job.location}
                  </p>

                  {/* Optional: Display salary if available and typed */}

                  {job.salary && (
                    <p className="text-sm font-medium text-indigo-700 mb-4">
                      ${job.salary.min.toLocaleString()} - $
                      {job.salary.max.toLocaleString()} USD
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-auto">
                  {/* Conditional Button Logic */}

                  {appliedApplication ? (
                    <Link to={`/ai-interview/${job._id}`}>
                      <button
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
                        onClick={() => {
                          sessionStorage.setItem(
                            "applicationId",

                            appliedApplication._id
                          );
                        }}
                      >
                        Start AI Interview
                      </button>
                    </Link>
                  ) : (
                    <Link to={`/jobdetail/${job._id}`}>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md">
                        View & Apply
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );

            return <li key={job._id}>{jobCardContent}</li>;
          })}
        </ul>
      </div>
    </>
  );
};

export default JobList;
