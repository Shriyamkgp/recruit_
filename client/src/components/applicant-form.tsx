"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Header from "./Header";
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
import { useNavigate } from "react-router-dom";

// Define the schema for form validation
const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full Name is required.",
  }),
  email: z.string().min(1, {
    message: "Email is required.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  // Use z.instanceof(File) for better type checking on file inputs
  resumeFile: z.any().refine((val) => val instanceof File, {
    message: "A resume file is required.",
  }),
  salaryExpectation: z
    .string()
    .min(1, {
      message: "eg: 50000 - 70000 USD",
    })
    .optional(),
});

export function ApplicantForm() {
  const navigate = useNavigate();

  // 1. Define the form hook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      resumeFile: undefined,
      salaryExpectation: "",
    },
  });

  // Helper function to handle the API calls
  async function registerApplicant(data: z.infer<typeof formSchema>) {
    // NOTE: Replace 'import.meta.env.API_DEV_URL' with your actual environment variable access
    // For CRA: process.env.REACT_APP_API_URL
    // For Vite: import.meta.env.VITE_API_URL
    const API_URL = import.meta.env.VITE_API_URL;
    console.log("API_URL:", API_URL);

    // 1. Prepare and submit User Registration data
    const registryData = {
      name: data.fullName,
      email: data.email,
      password: data.password,
      role: "applicant",
    };

    let registerApiResponse = null;
    try {
      const response = await fetch(`${API_URL}users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registryData),
      });

      if (!response.ok) {
        // Parse error message from response if possible
        const errorBody = await response.json();
        throw new Error(errorBody.message || "Failed to register applicant");
      }
      registerApiResponse = await response.json();
    } catch (error) {
      console.error(error);
      // Implement UI error handling here (e.g., set a state to show a toast)
      return; // Stop execution on registration failure
    }
    console.log("registerApiResponse:", registerApiResponse);
    // 2. Prepare and submit Applicant Profile data
    if (registerApiResponse) {
      const resumeFileObject = data.resumeFile as File;
      const userIdString = registerApiResponse._id;
      let salaryObject = null;

      // ... (salaryObject creation logic is correct)
      if (data.salaryExpectation) {
        const parts = data.salaryExpectation.split(/[\s-]+/);
        salaryObject = {
          min: parseInt(parts[0]),
          max: parseInt(parts[2]),
          currency: parts[3] || "USD",
        };
      }

      const formData = new FormData();
      // Keys match the backend expectations: userId (req.body) and resume (upload.single)
      formData.append("userId", userIdString);
      formData.append("resume", resumeFileObject);
      if (salaryObject) {
        // Must be stringified for Multer to put it in req.body as a string
        formData.append("salaryExpectation", JSON.stringify(salaryObject));
      }

      try {
        const response2 = await fetch(`${API_URL}applicants/`, {
          method: "POST",
          body: formData,
        });

        if (!response2.ok) {
          throw new Error("Failed to create applicant profile");
        }
        // Success: Navigate to job list
        
        navigate("../job/applicant");
      } catch (error) {
        console.error(error);
        // Implement UI error handling here
      }
    }
  }

  // 2. Define a submit handler (this is the function called by react-hook-form)
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    registerApplicant(values);
  }

  // 3. Component must return JSX unconditionally
  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          New Applicant Registration
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Full Name FIELD */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Full Name is required"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Email FIELD */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Password FIELD */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. UPLOAD RESUME FIELD */}
            <FormField
              control={form.control}
              name="resumeFile"
              // Destructure the field object and explicitly set 'value' to undefined
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Resume</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      // Required for file inputs to work properly
                      value={undefined}
                      type="file"
                      onChange={(event) => {
                        // Pass the File object to react-hook-form state
                        onChange(
                          event.target.files ? event.target.files[0] : undefined
                        );
                      }}
                      accept=".pdf"
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormDescription>
                    Please upload your resume as a single .pdf file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. Salary Expectation */}
            <FormField
              control={form.control}
              name="salaryExpectation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Expectation</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Eg: 50000 - 70000 USD"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
