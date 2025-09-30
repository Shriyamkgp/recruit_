import React, { Component } from "react";

interface JobDetailsProps {
  jobId?: string;
}

export class index extends Component<JobDetailsProps> {
  render() {
    const { jobId } = this.props;
    console.log("jobId_ai:", jobId);
    return <div>AI Interview Page: {jobId}</div>;
  }
}

export default index;
