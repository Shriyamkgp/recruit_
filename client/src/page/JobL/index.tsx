import React, { Component } from "react";
import jobs from "./jobs.json";
import { Link } from "react-router-dom";
import Header from "../../components/Header";

export class index extends Component {
  render() {
    return (
      <>
        <Header />
        <div>
          <h1
            className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide"
            style={{ letterSpacing: "2px" }}
          >
            <span role="img" aria-label="rocket" className="mr-2"></span>
            Available Jobs
            <span role="img" aria-label="rocket" className="ml-2"></span>
          </h1>
          <ul className="Border rounded-lg p-4 bg-slate-100">
            {jobs.map((job) => (
              <li key={job.id} className="job-list-item mb-4 bg-slate-200 p-4">
                <div className="job-card content p-4 border rounded shadow hover:shadow-lg transition-shadow duration-300">
                  <span
                    role="img"
                    aria-label="briefcase"
                    className="mr-2 text-xl"
                  >
                    💼
                  </span>
                  <h2>{job.title}</h2>
                  <p>{job.company}</p>
                  <p>{job.location}</p>

                  <div className="flex justify-end">
                    <Link to={`/${job.id}`}>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                        Apply
                      </button>
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }
}

export default index;
