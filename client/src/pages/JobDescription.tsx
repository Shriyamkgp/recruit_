import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as RecruitApi from "@/api/RecruitApi";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import Header from "../components/Header";
import "../styles/JobDescription.css";

interface JobDetailData {
  job: {
    _id: string;
    title: string;
    companyName: string;
    location: string;
    description: string;
    salary: {
      min: number;
      max: number;
    };
  };
}


type JobState = JobDetailData | null | false;

const JobDescription = () => {
  const { id } = useParams<{ id: string }>();

  const [jobElement, setJobElement] = useState<JobState>(null);

  // --- Data Fetching Effect ---

  useEffect(() => {
    const fetchJob = async () => {
      // FIX: If ID is missing, set state to failure immediately.

      if (!id) {
        setJobElement(false);

        return;
      }

      try {
        setJobElement(null);

        const responseData = await RecruitApi.getJobById(id);

        setJobElement(responseData);
      } catch (error) {
        console.error("Error fetching job details:", error);

        setJobElement(false); // Indicate failure state
      }
    };

    fetchJob();
  }, [id]);

  // --- Render Status Handlers ---

  // Loading state

  if (jobElement === null) {
    return (
      <div className="job-details">
        <Header />

        <div className="text-center mt-8">Loading job details...</div>
      </div>
    );
  }

  // Error/Not Found state (now triggered if API fails OR if 'id' is missing)

  if (jobElement === false) {
    return (
      <div className="job-details">
        <Header />

        <div className="text-center mt-8 text-red-500">
          Job not found or failed to load. (ID: {id || "Missing ID"})
        </div>
      </div>
    );
  }

  // Destructure the job object for cleaner rendering

  const job = jobElement.job;

  // --- Successful Render ---

  return (
    <div className="job-details p-4 md:p-10 max-w-4xl mx-auto">
      <Header />

      <div className="job-card content p-6 border rounded-lg shadow-xl bg-white">
        <h2 className="text-3xl font-bold mb-2 text-indigo-800">{job.title}</h2>

        <div className="border-b pb-4 mb-4">
          <p className="text-gray-700 mb-1">
            <strong>Company:</strong> {job.companyName}
          </p>

          <p className="text-gray-700 mb-1">
            <strong>Location:</strong> {job.location}
          </p>

          <p className="text-gray-700 mb-4">
            <strong>Salary:</strong> ${job.salary.min.toLocaleString()} - $
            {job.salary.max.toLocaleString()} USD
          </p>
        </div>

        <h3 className="text-xl font-semibold mb-2">Job Description</h3>

        <p className="text-gray-600 whitespace-pre-line mb-6">
          {job.description}
        </p>

        {/* Component for the application form */}

        <JobDescriptionForm jobId={id} />
      </div>
    </div>
  );
};

export default JobDescription;
