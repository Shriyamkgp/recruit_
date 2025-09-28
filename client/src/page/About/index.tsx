import React, { Component } from "react";
import Header from "@/components/Header";
import "./index.css";
import { Link } from "react-router-dom";

export class index extends Component {
  render() {
    return (
      <>
        <Header />
        <header>
          <h1>Recruiter & Applicant Hub</h1>
          <p>Connecting Talent with Opportunity</p>
        </header>
        <div className="container">
          <section className="main-content">
            <h2>Your Next Career Move or Hire is Here</h2>
            <p>
              A dual-purpose platform designed to streamline the hiring process
              for recruiters and simplify the job search for applicants.
            </p>
          </section>

          <section className="section" id="recruiters">
            <h2>For Recruiters</h2>
            <p>
              Find the perfect candidates with our powerful search tools. Post
              jobs, manage applications, and automate your hiring workflow.
            </p>
            <div className="features">
              <div className="feature-item">
                <h3>Efficient Candidate Sourcing</h3>
                <p>
                  Filter candidates by skills, experience, and location to
                  quickly find the best fit for your team.
                </p>
              </div>
              <div className="feature-item">
                <h3>Automated Management</h3>
                <p>
                  Track applications, schedule interviews, and communicate with
                  candidates all from one centralized dashboard.
                </p>
              </div>
            </div>
            <Link to="../hrf">
              <a href="" className="cta-button">
                Find Talent
              </a>
            </Link>
          </section>

          <section className="section" id="applicants">
            <h2>For Applicants</h2>
            <p>
              Discover your next job opportunity. Create a professional profile,
              receive tailored job recommendations, and apply with ease.
            </p>
            <div className="features">
              <div className="feature-item">
                <h3>Personalized Job Matching</h3>
                <p>
                  Get job recommendations that match your skills and career
                  goals, making your job hunt more efficient.
                </p>
              </div>
              <div className="feature-item">
                <h3>Simplified Application Process</h3>
                <p>
                  Apply to multiple jobs with a single click and manage all your
                  applications from your dashboard.
                </p>
              </div>
            </div>
            <Link to="../applicant">
              <a href="#" className="cta-button">
                Find Jobs
              </a>
            </Link>
          </section>
        </div>
      </>
    );
  }
}

export default index;
