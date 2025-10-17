// PostedJobs.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2, Edit, Users, Search, PlusCircle } from "lucide-react";
import * as RecruitApiSecured from "@/api/RecruitApiSecured";

// --- Types ---
interface Salary {
  min: number;
  max: number;
  currency: string;
}

interface Job {
  _id: string;
  title: string;
  companyName: string;
  location: string;
  salary: Salary;
  description: string;
  hrId: string; // The field used for filtering
  createdAt: string;
}

// --- PostedJobs Component ---
export function PostedJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Retrieve the HR user ID from session storage
  const currentHrId = sessionStorage.getItem("userId");

  const fetchPostedJobs = useCallback(async () => {
    // 1. Validate the ID immediately
    if (!currentHrId) {
      toast.error("Authentication Required", {
        description: "HR user ID is missing. Please log in.",
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all jobs (or jobs filtered by HR ID if the API supports it)
      const response = await RecruitApiSecured.getAllJobs();
      // 2. CORE CORRECTION: Client-side filtering using the retrieved ID
      //    This checks if the 'hrId' property on the job object matches the 'currentHrId' from storage.
      const postedJobs = response.jobs.filter(
        (job: Job) => job.hrId._id === currentHrId
      );
      console.log(`PostedJobs: ${postedJobs}`);

      setJobs(postedJobs);
    } catch (error) {
      console.error("Error fetching posted jobs:", error);
      toast.error("Failed to load job listings.", {
        description: "Please check your network connection.",
      });
    } finally {
      setLoading(false);
    }
  }, [currentHrId]); // Dependency on currentHrId

  useEffect(() => {
    fetchPostedJobs();
  }, [fetchPostedJobs]);

  const handleTerminate = async (jobId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to terminate this job posting? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(jobId);

    toast.promise(RecruitApiSecured.deleteJob(jobId), {
      loading: "Terminating job...",
      success: () => {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
        return `Job posting "${
          jobs.find((j) => j._id === jobId)?.title
        }" terminated successfully.`;
      },
      error: (err) => {
        console.error("Error terminating job:", err);
        return "Failed to terminate the job posting.";
      },
      finally: () => setDeletingId(null),
    });
  };

  const filteredJobs = useMemo(() => {
    if (!searchTerm) {
      return jobs;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return jobs.filter((job) =>
      job.title.toLowerCase().includes(lowerCaseSearch)
    );
  }, [jobs, searchTerm]);

  if (loading) {
    return (
      <div className="text-center p-10">
        <Header />
        <p>Loading your posted jobs...</p>
      </div>
    );
  }

  // --- Render JSX ---
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-gray-900">Your Posted Jobs</h2>

          <Button
            onClick={() => navigate("/hr/create_job")}
            className="bg-indigo-600 hover:bg-indigo-700 transition duration-200 flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Post New Job</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex w-full max-w-lg items-center space-x-2 mb-8">
          <Search className="text-gray-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search jobs by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>

        {filteredJobs.length === 0 && (
          <div className="p-10 text-center border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">
              {searchTerm
                ? "No jobs match your search criteria."
                : "You haven't posted any jobs yet."}
            </p>
            {!searchTerm && (
              <Button
                className="mt-4"
                onClick={() => navigate("/hr/create_job")}
              >
                Post Your First Job
              </Button>
            )}
          </div>
        )}

        {/* Job List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card
              key={job._id}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-700">
                  {job.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {job.companyName} | {job.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {job.description}
                </p>
                <div className="text-sm font-medium">
                  Salary: {job.salary.currency}{" "}
                  {job.salary.min.toLocaleString()} -{" "}
                  {job.salary.max.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Posted on: {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 pt-4 border-t">
                {/* VIEW CANDIDATES BUTTON */}
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/hr/posted-jobs/view-candiates/${job._id}`)
                  }
                  className="flex items-center space-x-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Users className="w-4 h-4" />
                  <span>View Candidates</span>
                </Button>

                {/* UPDATE BUTTON */}
                <Button
                  variant="outline"
                  onClick={() => navigate(`/hr/update-job/${job._id}`)}
                  className="flex items-center space-x-1 text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>Update</span>
                </Button>

                {/* TERMINATE BUTTON */}
                <Button
                  variant="destructive"
                  onClick={() => handleTerminate(job._id)}
                  disabled={deletingId === job._id}
                  className="flex items-center space-x-1"
                >
                  {deletingId === job._id ? (
                    <span>Terminating...</span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Terminate</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

export default PostedJobs;
