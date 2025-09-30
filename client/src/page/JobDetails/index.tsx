import React, { Component } from "react";
import jobs from "../JobL/jobs.json";
import { JobDetailF } from "@/components/job_app-form";
import Header from "../../components/Header";

// 1. Change the prop type to 'string'
interface JobDetailsProps {
  jobId?: string;
}

// Renamed 'index' to 'JobDetails' for clarity (Highly recommended)
export class JobDetails extends Component<JobDetailsProps> {
  render() {
    const { jobId } = this.props;

    // 2. Find the job based on the jobId prop
    const job = jobs.find((j) => j.id === jobId);
    console.log("Received Job ID:", jobId);
    console.log("Found Job:", job);

    return (
      <div className="job-details">
        <Header />
        {job ? (
          <div className="job-card content p-4 border rounded shadow hover:shadow-lg transition-shadow duration-300">
            {/* 3. Access job properties safely */}
            <h2 className="text-2xl font-bold mb-2">
              {job.title} {/* Assuming 'title' exists on the job object */}
            </h2>
            <p className="text-gray-700 mb-1">
              <strong>Company:</strong> {job.company}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Location:</strong> {job.location}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Salary:</strong> {job.salary}
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Description:</strong> {job.description}
            </p>

            <JobDetailF jobId_ai={job.id} />

            {/* <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
              Apply Now
            </button> */}
          </div>
        ) : (
          <p className="text-red-500">Job not found. (ID: {jobId})</p>
        )}
      </div>
    );
  }
}

export default JobDetails;
