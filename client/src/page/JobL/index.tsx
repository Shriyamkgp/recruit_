import React, { Component } from "react";
import jobs from "./jobs.json";

export class index extends Component {
  render() {
    return (
      <>
        <div>
          <h1
            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-lg mb-6 animate-pulse"
            style={{ letterSpacing: "2px" }}
          >
            🚀 Available Jobs 🚀
          </h1>
          <ul>
            {jobs.map((job) => (
              <li key={job.id} className="job-list-item mb-4 bg-slate-200 p-4">
                <div className="job-card container mt-3">
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
                    <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                      Apply
                    </button>
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
