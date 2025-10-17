// CreateJobForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import * as RecruitApi from "@/api/RecruitApi";

// --- Schema Definition ---
// Define a custom Zod schema for file input validation
const ACCEPTED_FILE_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 5000000; // 5MB

const jobFormSchema = z.object({
  title: z.string().min(3, { message: "Job Title is required." }),
  companyName: z.string().min(1, { message: "Company Name is required." }),
  companyDescription: z
    .string()
    .min(10, { message: "Provide a brief Company Description." }),
  location: z.string().min(1, { message: "Location is required." }),
  minSalary: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .min(0, { message: "Minimum salary cannot be negative." }),
  maxSalary: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .min(0, { message: "Maximum salary cannot be negative." }),
  currency: z.string().default("USD"),

  // Job Description is now optional if a file is uploaded
  description: z.string().optional(),

  // File upload field using Zod's `any()` type for FileList/File,
  // with custom validation logic.
  jobFile: z
    .any()
    .refine(
      (files) =>
        files?.length > 0 ||
        (form.getValues("description") &&
          form.getValues("description").length > 20),
      "A description or a PDF file is required."
    )
    .refine(
      (files) => !files?.length || files?.[0].size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) =>
        !files?.length || ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf files are accepted."
    )
    .optional(),

  requirementsString: z
    .string()
    .min(10, { message: "List at least one requirement." }),
  skillsString: z.string().min(10, { message: "List at least one skill." }),
});

// Refinement to ensure maxSalary is greater than or equal to minSalary
const finalJobFormSchema = jobFormSchema.refine(
  (data) => data.maxSalary >= data.minSalary,
  {
    message: "Max Salary must be greater than or equal to Min Salary.",
    path: ["maxSalary"],
  }
);

type JobFormValues = z.infer<typeof finalJobFormSchema>;

// --- Component ---
export function CreateJobForm() {
  const navigate = useNavigate();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(finalJobFormSchema),
    defaultValues: {
      title: "",
      companyName: "",
      companyDescription: "",
      location: "",
      minSalary: 0,
      maxSalary: 0,
      currency: "USD",
      description: "",
      requirementsString: "",
      skillsString: "",
    },
  });

  const parseArrayString = (str: string): string[] => {
    return str
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  async function onSubmit(values: JobFormValues) {
    const hrId = sessionStorage.getItem("userId");

    if (!hrId) {
      form.setError("root.serverError", {
        type: "manual",
        message: "Authentication error: HR user ID missing. Please re-login.",
      });
      return;
    }

    const formData = new FormData();

    // Append all top-level fields
    formData.append("title", values.title);
    formData.append("companyName", values.companyName);
    formData.append("companyDescription", values.companyDescription);
    formData.append("location", values.location);
    formData.append("hrId", hrId);

    // Job Description (text) or File
    if (values.jobFile && values.jobFile.length > 0) {
      formData.append("jobFile", values.jobFile[0]);
      formData.append("description", "See attached PDF for full description.");
    } else if (values.description) {
      formData.append("description", values.description);
    }

    // ⬇️ CORE FIX: Send salary sub-fields individually as simple strings ⬇️
    // Backend API frameworks (like Express with Multer) will often treat fields
    // named 'salary.min' as nested object properties automatically.

    // Ensure numbers are converted to strings for FormData
    formData.append("salary.min", values.minSalary.toString());
    formData.append("salary.max", values.maxSalary.toString());
    formData.append("salary.currency", values.currency);

    // ⬇️ Optional but Recommended: Send arrays as stringified JSON ⬇️
    // NOTE: You *must* confirm your backend is parsing these JSON strings back into arrays.
    formData.append(
      "requirements",
      JSON.stringify(parseArrayString(values.requirementsString))
    );
    formData.append(
      "skills",
      JSON.stringify(parseArrayString(values.skillsString))
    );

    try {
      const response = await RecruitApi.createJob(formData);
      console.log("Job created successfully:", response);
      navigate("/hr/posted-jobs");
    } catch (error: any) {
      console.error("Error creating job:", error);
      form.setError("root.serverError", {
        type: "manual",
        message:
          error.message || "Failed to create job. Please check the form data.",
      });
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl mt-10">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
          Post a New Job 🚀
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Senior Full Stack Developer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-xl font-semibold mt-6 pt-4 border-t">
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., TechCorp Solutions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., New York, NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell applicants about your company (Min 10 chars)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-xl font-semibold mt-6 pt-4 border-t">
              Salary Details
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="minSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="90000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="130000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., USD, INR, EUR" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-xl font-semibold mt-6 pt-4 border-t">
              Job Details (Text or PDF)
            </h3>

            {/* FILE UPLOAD FIELD */}
            <FormField
              control={form.control}
              name="jobFile"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Job Description (PDF)</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept=".pdf"
                      onChange={(event) => {
                        // Manually handle file selection
                        onChange(
                          event.target.files && event.target.files.length > 0
                            ? event.target.files
                            : undefined
                        );
                      }}
                      className="file:text-indigo-600 file:font-semibold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* JOB DESCRIPTION (TEXTAREA) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description (Text)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A detailed overview of the role (Min 20 chars)"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remaining Fields */}
            <FormField
              control={form.control}
              name="requirementsString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Requirements (one per line or comma-separated)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="5+ years of experience in full stack development"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skillsString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills (comma-separated)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="React, Node.js, MongoDB, TypeScript"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root?.serverError && (
              <p className="text-red-500 text-sm font-medium">
                {form.formState.errors.root.serverError.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 transition duration-200"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
