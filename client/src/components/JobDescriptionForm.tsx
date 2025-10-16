"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import * as RecruitApi from "@/api/RecruitApi";

// --- Types & Schema Definitions ---

const formSchema = z.object({
  salary: z.string().optional(),
  resumeFile: z.any().optional(),
});

type JobApplicationSchema = z.infer<typeof formSchema>;

interface JobDetailsProps {
  jobId?: string;
}

type Application = {
  _id: string;
  jobId: string | { _id: string };
  applicantId: string;
  status: string;
};

// Helper function to extract Job ID from various formats
const extractJobId = (jobId: string | { _id: string }): string => {
  if (typeof jobId === "object" && jobId !== null && "_id" in jobId) {
    return jobId._id;
  }
  return jobId;
};

// --- Component ---

export function JobDescriptionForm({ jobId }: JobDetailsProps) {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<JobApplicationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salary: "",
      resumeFile: undefined,
    },
  });

  async function onSubmit(values: JobApplicationSchema) {
    setIsSubmitting(true);
    setFormError(null);

    const currentUserId = sessionStorage.getItem("userId");
    const targetJobId = jobId;

    if (!currentUserId || !targetJobId) {
      setFormError(
        !currentUserId
          ? "Authentication Error: User ID is missing."
          : "Error: Job ID is missing. Cannot submit application."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Get Applicant Profile
      const profileResponse = await RecruitApi.getApplicantProfile(
        currentUserId
      );
      const applicantProfile = profileResponse?.applicant;

      if (!applicantProfile || !applicantProfile._id) {
        setFormError(
          "Profile Required: Please complete your full applicant profile before applying."
        );
        return;
      }

      const applicantId = applicantProfile._id;
      sessionStorage.setItem("applicantId", applicantId);

      // 2. Check for existing application
      const applicationResponse = await RecruitApi.getApplicationsByApplicant(
        applicantId
      );
      const existingApplications: Application[] =
        applicationResponse?.applications || [];

      const existingApplication = existingApplications.find((application) => {
        return extractJobId(application.jobId) === targetJobId;
      });

      let finalApplicationId: string;

      if (existingApplication) {
        finalApplicationId = existingApplication._id;
      } else {
        // 3. Create a new application if none exists
        const newApplicationResponse = await RecruitApi.applyToJob(
          targetJobId,
          applicantId
        );

        if (!newApplicationResponse?.application?._id) {
          throw new Error("Failed to create new application.");
        }
        finalApplicationId = newApplicationResponse.application._id;
      }

      // Final success action: Store ID and redirect
      sessionStorage.setItem("applicationId", finalApplicationId);
      navigate(`/ai-interview/${targetJobId}`);
    } catch (error) {
      console.error("Submission error:", error);
      setFormError(
        `Application failed: ${
          error instanceof Error
            ? error.message
            : "Network error or API failure."
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 border rounded-xl shadow-2xl bg-white space-y-6">
      <h3 className="text-2xl font-bold text-center text-indigo-700">
        Apply for this Job
      </h3>

      {formError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-medium">
          Error: {formError}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Expected Salary Field */}
          <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Annual Salary (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., $120,000 USD"
                    type="text"
                    {...field}
                    disabled={isSubmitting}
                    className="focus:border-indigo-500"
                  />
                </FormControl>
                <FormDescription>
                  This value will be used for your applicant profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Resume Upload Field */}
          <FormField
            control={form.control}
            name="resumeFile"
            render={({ field: { onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Upload New Resume (PDF Only)</FormLabel>
                <FormControl>
                  <Input
                    {...fieldProps}
                    value={undefined}
                    type="file"
                    onChange={(event) => {
                      onChange(
                        event.target.files ? event.target.files[0] : undefined
                      );
                    }}
                    accept=".pdf"
                    className="cursor-pointer file:text-indigo-600 file:font-medium"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Uploading a file here will override the default resume in your
                  profile (Upload logic not fully implemented yet).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Default Resume Checkbox (Disabled/Informational) */}
          <div className="flex items-start space-x-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <Checkbox
              id="use-default-resume"
              defaultChecked
              disabled
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="use-default-resume"
                className="text-sm font-medium text-gray-700"
              >
                Use the Already Uploaded Resume
              </Label>
              <p className="text-xs text-gray-500">
                The system automatically uses the default resume file linked to
                your profile unless a new one is uploaded above.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Submit Application & Start AI Interview"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
