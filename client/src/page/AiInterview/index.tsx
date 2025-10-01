import React, { Component } from "react";
import Header from "@/components/Header";

interface JobDetailsProps {
  jobId?: string;
}

export class index extends Component<JobDetailsProps> {
  render() {
    const { jobId } = this.props;
    console.log("jobId_ai:", jobId);
    return (
      <>
        <Header />
        <div>AI Interview Page: {jobId}</div>
      </>
    );
  }
}

export default index;
