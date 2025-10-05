"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { Link, useNavigate } from "react-router-dom";
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
// Header and Label removed as they were not used in the application.

// 1. Define the complete form schema for all fields
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  fullName: z.string().min(1, {
    message: "Full Name is required.",
  }),
  company: z.string().optional(),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  // For file upload, we use z.any() as the value will be a File object
  jobdescriptionFile: z.any().optional(),
});

type JobApplicationSchema = z.infer<typeof formSchema>;

// Renamed and exported as HRForm as requested
export function HRForm() {
  // Correctly call the hook at the top level
  const navigate = useNavigate();

  // Console log to verify the prop value on render

  // 1. Define your form and default values based on the updated schema
  const form = useForm<JobApplicationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      fullName: "",
      company: "",
      email: "",
      jobdescriptionFile: undefined,
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: JobApplicationSchema) {
    console.log("Form Submitted Successfully! Form Values:", values);
  }

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-8 bg-white shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Job Application (HR Form)
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. USERNAME FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Displayed on Console" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. FULL NAME FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. COMPANY FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your current company (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. EMAIL FIELD (Unique FormField) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your Company Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 5. UPLOAD JOB DESCRIPTION FIELD (Unique FormField with custom file handling) */}
            <FormField
              control={form.control}
              name="jobdescriptionFile"
              // Destructure the field object and explicitly set 'value' to undefined
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Upload Job Description</FormLabel>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      // For file inputs, the 'value' prop must be undefined for the input to work correctly.
                      value={undefined}
                      type="file"
                      onChange={(event) => {
                        // This handles saving the actual File object to the form state
                        onChange(
                          event.target.files ? event.target.files[0] : null
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

            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
